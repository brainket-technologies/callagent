import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiVoices } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";
import {
  getVoiceProvidersConfig,
  synthesizeElevenLabsSpeech,
  synthesizeSarvamSpeech,
  synthesizeOpenAISpeech,
  synthesizeCartesiaSpeech,
  ELEVENLABS_PRESET_VOICES,
} from "@/lib/voice-providers";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

interface DialogueTurn {
  speaker: "A" | "B";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      speakerAId = "firoz-sonic-35",
      speakerBId = "riya-sonic-35",
      dialogue = [],
      style = 0.35,
      stability = 0.5,
    } = body;

    const turns: DialogueTurn[] = Array.isArray(dialogue) && dialogue.length > 0
      ? dialogue
      : [
          { speaker: "A", text: "अरे नमस्ते! कैसे हैं आप? मैं Voxera से बोल रहा हूँ।" },
          { speaker: "B", text: "हाँजी नमस्ते! बताइए क्या बात है?" },
          { speaker: "A", text: "बस आपके नए ऑर्डर के कन्फर्मेशन को लेकर एक छोटी सी बात करनी थी।" },
          { speaker: "B", text: "अच्छा बढ़िया, बिल्कुल बताइए!" },
        ];

    // Resolve Speaker A and Speaker B voices from DB
    const [voiceARows, voiceBRows] = await Promise.all([
      db.select().from(aiVoices).where(or(eq(aiVoices.slug, speakerAId), eq(aiVoices.voiceId, speakerAId), ilike(aiVoices.name, `%${speakerAId}%`))).limit(1),
      db.select().from(aiVoices).where(or(eq(aiVoices.slug, speakerBId), eq(aiVoices.voiceId, speakerBId), ilike(aiVoices.name, `%${speakerBId}%`))).limit(1),
    ]);

    const voiceA = voiceARows[0];
    const voiceB = voiceBRows[0];

    const config = await getVoiceProvidersConfig();
    const cacheDir = path.join(process.cwd(), "public", "uploads", "voices", "dialogue");
    await fs.promises.mkdir(cacheDir, { recursive: true });

    const synthesizedTurns: Array<{
      speaker: "A" | "B";
      speakerName: string;
      text: string;
      audioUrl: string;
    }> = [];

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      const isSpeakerA = turn.speaker === "A";
      const targetVoice = isSpeakerA ? voiceA : voiceB;
      const speakerName = targetVoice?.name || (isSpeakerA ? "Agent" : "Customer");
      const provider = (targetVoice?.provider || "").toLowerCase();
      const targetSlug = targetVoice?.slug || (isSpeakerA ? "speaker-a" : "speaker-b");

      const turnHash = crypto
        .createHash("md5")
        .update(`${targetSlug}_${turn.text}_${style}_${stability}`)
        .digest("hex");
      const turnAudioPath = path.join(cacheDir, `${turnHash}.mp3`);
      const turnAudioUrl = `/uploads/voices/dialogue/${turnHash}.mp3`;

      if (!fs.existsSync(turnAudioPath)) {
        let generatedBuffer: Buffer | null = null;

        // Try ElevenLabs if configured
        if (config.elevenlabsApiKey && (provider.includes("eleven") || targetVoice?.tag === "Custom Clone")) {
          const elVoiceId = targetVoice?.voiceId || ELEVENLABS_PRESET_VOICES[targetSlug] || "pNInz6obpgDQGcFmaJgB";
          generatedBuffer = await synthesizeElevenLabsSpeech({
            apiKey: config.elevenlabsApiKey,
            voiceId: elVoiceId,
            text: turn.text,
            style: Number(style),
            stability: Number(stability),
          });
        }

        // Try Sarvam if configured
        if (!generatedBuffer && config.sarvamApiKey && provider.includes("sarvam")) {
          generatedBuffer = await synthesizeSarvamSpeech({
            apiKey: config.sarvamApiKey,
            speaker: targetVoice?.gender === "female" ? "meera" : "arvind",
            text: turn.text,
          });
        }

        // Try OpenAI if configured
        if (!generatedBuffer && config.openaiApiKey && provider.includes("openai")) {
          generatedBuffer = await synthesizeOpenAISpeech({
            apiKey: config.openaiApiKey,
            voice: targetVoice?.gender === "female" ? "nova" : "echo",
            text: turn.text,
          });
        }

        // Fallback to Edge Neural TTS
        if (!generatedBuffer) {
          const edgeExecutable = path.join(process.cwd(), ".venv", "bin", "edge-tts");
          if (fs.existsSync(edgeExecutable)) {
            const chosenVoice = targetVoice?.gender === "female" ? "hi-IN-SwaraNeural" : "hi-IN-MadhurNeural";
            try {
              await execFileAsync(edgeExecutable, [
                "--voice",
                chosenVoice,
                "--rate",
                "-1%",
                "--pitch",
                "+0Hz",
                "--text",
                turn.text,
                "--write-media",
                turnAudioPath,
              ]);
            } catch (err) {
              console.warn("Edge-tts dialogue turn generation failed:", err);
            }
          }
        } else {
          await fs.promises.writeFile(turnAudioPath, generatedBuffer);
        }
      }

      synthesizedTurns.push({
        speaker: turn.speaker,
        speakerName,
        text: turn.text,
        audioUrl: turnAudioUrl,
      });
    }

    return NextResponse.json({
      success: true,
      speakerA: voiceA ? { name: voiceA.name, slug: voiceA.slug, provider: voiceA.provider } : null,
      speakerB: voiceB ? { name: voiceB.name, slug: voiceB.slug, provider: voiceB.provider } : null,
      turns: synthesizedTurns,
    });
  } catch (err: any) {
    console.error("POST /api/voice-engine/dialogue error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to orchestrate dialogue" },
      { status: 500 }
    );
  }
}
