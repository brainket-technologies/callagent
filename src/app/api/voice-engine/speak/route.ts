import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiVoices, systemLanguages, systemTones } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

interface VoicePersonaConfig {
  voiceMap?: Record<string, string>;
  pitchOffset: number;
  rateOffset: number;
}

const VOICE_PERSONAS: Record<string, VoicePersonaConfig> = {
  // Arjun (Fast, authoritative Indian male logistics coordinator)
  "arjun-sonic-35": {
    voiceMap: { en: "en-US-AndrewMultilingualNeural", "en-in": "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -18,
    rateOffset: 8,
  },
  // Kabir (Calm corporate wealth & banking manager - smooth, prestigious baritone)
  "kabir-sonic-35": {
    voiceMap: { en: "en-US-AndrewMultilingualNeural", "en-in": "en-US-AndrewMultilingualNeural", hi: "en-US-AndrewMultilingualNeural" },
    pitchOffset: -36,
    rateOffset: -4,
  },
  // Ishaan (Youthful, energetic NDR delivery reschedule)
  "ishaan-sonic-35": {
    voiceMap: { en: "en-US-BrianMultilingualNeural", "en-in": "en-US-BrianMultilingualNeural", hi: "en-US-BrianMultilingualNeural" },
    pitchOffset: -8,
    rateOffset: 6,
  },
  // Dev (Warm conversational executive companion)
  "openai-dev-echo": {
    voiceMap: { en: "en-US-GuyNeural", "en-in": "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -26,
    rateOffset: 0,
  },
  // Aarav (Fintech loan sales lead qualifier)
  "aarav-elevenlabs": {
    voiceMap: { en: "en-US-BrianMultilingualNeural", "en-in": "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -12,
    rateOffset: 12,
  },
  // Rohan (Senior executive search consultant)
  "rohan-elevenlabs": {
    voiceMap: { en: "en-US-AndrewMultilingualNeural", "en-in": "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -32,
    rateOffset: -2,
  },
  // Aditya (Banking KYC & security compliance)
  "google-aditya-neural2": {
    voiceMap: { en: "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -28,
    rateOffset: 2,
  },
  // Vikram (Logistics fleet coordinator)
  "google-vikram-wavenet": {
    voiceMap: { en: "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -22,
    rateOffset: 5,
  },
  // Arvind (COD Order verification)
  "sarvam-arvind-bulbul": {
    voiceMap: { en: "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -16,
    rateOffset: 3,
  },
  // Rajesh (Operations delivery support)
  "sarvam-rajesh-bulbul": {
    voiceMap: { en: "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -34,
    rateOffset: -3,
  },
  // Sanjay (Deep leadership onyx)
  "openai-sanjay-onyx": {
    voiceMap: { en: "en-US-ChristopherNeural", "en-in": "hi-IN-MadhurNeural", hi: "hi-IN-MadhurNeural" },
    pitchOffset: -45,
    rateOffset: -5,
  },
  // Riya (Cheerful, upbeat customer care)
  "riya-sonic-35": {
    voiceMap: { en: "en-IN-NeerjaExpressiveNeural", "en-in": "en-IN-NeerjaExpressiveNeural", hi: "hi-IN-SwaraNeural" },
    pitchOffset: 16,
    rateOffset: 8,
  },
  // Ananya (Warm student admissions counselor)
  "ananya-sonic-35": {
    voiceMap: { en: "en-US-AvaMultilingualNeural", "en-in": "en-US-AvaMultilingualNeural", hi: "en-US-AvaMultilingualNeural" },
    pitchOffset: -6,
    rateOffset: -5,
  },
  // Shreya (Calm, soothing clinic receptionist)
  "shreya-sonic-35": {
    voiceMap: { en: "en-US-EmmaMultilingualNeural", "en-in": "en-US-EmmaMultilingualNeural", hi: "en-US-EmmaMultilingualNeural" },
    pitchOffset: -14,
    rateOffset: -7,
  },
  // Pooja (Vibrant promotional sales)
  "pooja-elevenlabs": {
    voiceMap: { en: "en-IN-NeerjaExpressiveNeural", "en-in": "en-IN-NeerjaExpressiveNeural", hi: "hi-IN-SwaraNeural" },
    pitchOffset: 22,
    rateOffset: 10,
  },
  // Aditi (Compassionate patient care)
  "aditi-elevenlabs": {
    voiceMap: { en: "en-IN-NeerjaNeural", "en-in": "en-IN-NeerjaNeural", hi: "hi-IN-SwaraNeural" },
    pitchOffset: 4,
    rateOffset: 0,
  },
  // Priya (EMI reminder)
  "google-priya-neural2": {
    voiceMap: { hi: "hi-IN-SwaraNeural" },
    pitchOffset: -10,
    rateOffset: -8,
  },
  // Sneha (Wellness desk)
  "google-sneha-wavenet": {
    voiceMap: { en: "en-IN-NeerjaNeural", hi: "hi-IN-SwaraNeural" },
    pitchOffset: 10,
    rateOffset: 4,
  },
  // Kavya (Employee onboarding)
  "sarvam-kavya-bulbul": {
    voiceMap: { hi: "hi-IN-SwaraNeural" },
    pitchOffset: 12,
    rateOffset: 5,
  },
  // Meera (Edtech course advisor)
  "sarvam-meera-bulbul": {
    voiceMap: { hi: "hi-IN-SwaraNeural" },
    pitchOffset: -4,
    rateOffset: -2,
  },
  // Neha (Customer care)
  "openai-neha-alloy": {
    voiceMap: { hi: "hi-IN-SwaraNeural" },
    pitchOffset: 8,
    rateOffset: 4,
  },
  // Sanya (Financial advisory)
  "openai-sanya-coral": {
    voiceMap: { en: "en-US-AvaMultilingualNeural", "en-in": "en-US-AvaMultilingualNeural", hi: "en-US-AvaMultilingualNeural" },
    pitchOffset: 0,
    rateOffset: -2,
  },
};

// Edge Neural Voices mapped by language and gender
const EDGE_VOICE_MAP: Record<string, { male: string; female: string }> = {
  // Hindi
  "hi-in": { male: "hi-IN-MadhurNeural", female: "hi-IN-SwaraNeural" },
  "hi": { male: "hi-IN-MadhurNeural", female: "hi-IN-SwaraNeural" },

  // English (India)
  "en-in": { male: "hi-IN-MadhurNeural", female: "en-IN-NeerjaNeural" },

  // English (US)
  "en-us": { male: "en-US-GuyNeural", female: "en-US-JennyNeural" },
  "en": { male: "hi-IN-MadhurNeural", female: "en-IN-NeerjaNeural" },

  // English (UK)
  "en-gb": { male: "en-GB-RyanNeural", female: "en-GB-SoniaNeural" },

  // Gujarati
  "gu-in": { male: "gu-IN-NiranjanNeural", female: "gu-IN-DhwaniNeural" },
  "gu": { male: "gu-IN-NiranjanNeural", female: "gu-IN-DhwaniNeural" },

  // Marathi
  "mr-in": { male: "mr-IN-ManoharNeural", female: "mr-IN-AarohiNeural" },
  "mr": { male: "mr-IN-ManoharNeural", female: "mr-IN-AarohiNeural" },

  // Bengali
  "bn-in": { male: "bn-IN-BashkarNeural", female: "bn-IN-TanishaaNeural" },
  "bn": { male: "bn-IN-BashkarNeural", female: "bn-IN-TanishaaNeural" },

  // Punjabi (uses Indian Neural voices with Devanagari transliteration)
  "pa-in": { male: "hi-IN-MadhurNeural", female: "hi-IN-SwaraNeural" },
  "pa": { male: "hi-IN-MadhurNeural", female: "hi-IN-SwaraNeural" },

  // Tamil
  "ta-in": { male: "ta-IN-ValluvarNeural", female: "ta-IN-PallaviNeural" },
  "ta": { male: "ta-IN-ValluvarNeural", female: "ta-IN-PallaviNeural" },

  // Telugu
  "te-in": { male: "te-IN-MohanNeural", female: "te-IN-ShrutiNeural" },
  "te": { male: "te-IN-MohanNeural", female: "te-IN-ShrutiNeural" },

  // Kannada
  "kn-in": { male: "kn-IN-GaganNeural", female: "kn-IN-SapnaNeural" },
  "kn": { male: "kn-IN-GaganNeural", female: "kn-IN-SapnaNeural" },

  // Malayalam
  "ml-in": { male: "ml-IN-MidhunNeural", female: "ml-IN-SobhanaNeural" },
  "ml": { male: "ml-IN-MidhunNeural", female: "ml-IN-SobhanaNeural" },

  // Urdu
  "ur-in": { male: "ur-IN-SalmanNeural", female: "ur-IN-GulNeural" },
  "ur": { male: "ur-IN-SalmanNeural", female: "ur-IN-GulNeural" },

  // Arabic
  "ar-xa": { male: "ar-SA-HamedNeural", female: "ar-SA-ZariyahNeural" },
  "ar": { male: "ar-SA-HamedNeural", female: "ar-SA-ZariyahNeural" },

  // French
  "fr-fr": { male: "fr-FR-HenriNeural", female: "fr-FR-DeniseNeural" },
  "fr": { male: "fr-FR-HenriNeural", female: "fr-FR-DeniseNeural" },

  // German
  "de-de": { male: "de-DE-ConradNeural", female: "de-DE-KatjaNeural" },
  "de": { male: "de-DE-ConradNeural", female: "de-DE-KatjaNeural" },

  // Spanish
  "es-es": { male: "es-ES-AlvaroNeural", female: "es-ES-ElviraNeural" },
  "es": { male: "es-ES-AlvaroNeural", female: "es-ES-ElviraNeural" },

  // Italian
  "it-it": { male: "it-IT-DiegoNeural", female: "it-IT-ElsaNeural" },
  "it": { male: "it-IT-DiegoNeural", female: "it-IT-ElsaNeural" },

  // Russian
  "ru-ru": { male: "ru-RU-DmitryNeural", female: "ru-RU-SvetlanaNeural" },
  "ru": { male: "ru-RU-DmitryNeural", female: "ru-RU-SvetlanaNeural" },

  // Indonesian
  "id-id": { male: "id-ID-ArdiNeural", female: "id-ID-GadisNeural" },
  "id": { male: "id-ID-ArdiNeural", female: "id-ID-GadisNeural" },

  // Dutch
  "nl-nl": { male: "nl-NL-MaartenNeural", female: "nl-NL-FennaNeural" },
  "nl": { male: "nl-NL-MaartenNeural", female: "nl-NL-FennaNeural" },

  // Chinese
  "zh-cn": { male: "zh-CN-YunxiNeural", female: "zh-CN-XiaoxiaoNeural" },
  "zh": { male: "zh-CN-YunxiNeural", female: "zh-CN-XiaoxiaoNeural" },
};

// Fallback TTS language codes for Google TTS
const GOOGLE_TTS_LANG_MAP: Record<string, string> = {
  "pa-in": "pa",
  "pa": "pa",
  "my-mm": "my",
  "my": "my",
  "or-in": "hi",
  "or": "hi",
};

// Clean voice display name
function getCleanName(fullName: string): string {
  if (!fullName) return "Assistant";
  return fullName.replace(/\(.*?\)/g, "").trim() || fullName.trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("voiceId") || "";
    let lang = (searchParams.get("lang") || "en-IN").trim();
    let text = (searchParams.get("text") || "").trim();
    let toneQuery = (searchParams.get("tone") || "").trim();
    let genderQuery = (searchParams.get("gender") || "").trim();
    let name = searchParams.get("name") || "";

    // 1. Resolve Voice details from DB
    let dbVoice: any = null;
    if (slug) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      const rows = await db
        .select()
        .from(aiVoices)
        .where(
          or(
            eq(aiVoices.slug, slug),
            eq(aiVoices.voiceId, slug),
            ilike(aiVoices.name, `%${slug}%`),
            ...(isUuid ? [eq(aiVoices.id, slug as any)] : [])
          )
        )
        .limit(1);

      if (rows.length > 0) {
        dbVoice = rows[0];
      }
    }

    if (!name) {
      name = getCleanName(dbVoice?.name || slug || "Assistant");
    }

    // Gender: strictly use DB voice gender if available
    const voiceGender = (dbVoice?.gender || genderQuery || "female").toLowerCase().trim();
    const isMale = voiceGender === "male";

    // 2. Fetch language from systemLanguages
    const allLangs = await db.select().from(systemLanguages);
    const matchedLang =
      allLangs.find((l) => l.code.toLowerCase() === lang.toLowerCase()) ||
      allLangs.find((l) => l.code.toLowerCase().startsWith(lang.toLowerCase().split("-")[0])) ||
      allLangs.find((l) => l.code === "en-IN");

    const effectiveLangCode = matchedLang?.code || lang;
    const langPrefix = effectiveLangCode.toLowerCase().split("-")[0];
    const isEnglish = langPrefix === "en";

    // 3. Resolve Assigned Tone from DB to obtain audioRate & audioPitch
    const allTones = await db.select().from(systemTones);
    const targetToneIdOrKey = dbVoice?.tone || toneQuery || "professional";
    const matchedTone =
      allTones.find((t) => t.id === targetToneIdOrKey) ||
      allTones.find((t) => t.key.toLowerCase() === targetToneIdOrKey.toLowerCase()) ||
      allTones.find((t) => t.name.toLowerCase() === targetToneIdOrKey.toLowerCase()) ||
      allTones[0];

    const audioRate = Number(matchedTone?.audioRate || 1.0);
    const audioPitch = Number(matchedTone?.audioPitch || 1.0);

    // 3. Resolve Assigned Tone directly from DB (system_tones table attached to the voice)
    const personaSlug = dbVoice?.slug || slug;
    const persona = VOICE_PERSONAS[personaSlug] || {};

    const basePitchOffset = persona.pitchOffset ?? (isMale ? -25 : 0);
    const baseRateOffset = persona.rateOffset ?? 0;

    // Speed and pitch modulation directly from matchedTone row in database
    const dbRateMod = Math.round((audioRate - 1.0) * 100);
    const dbPitchMod = Math.round((audioPitch - 1.0) * 100);

    const finalRate = Math.max(-25, Math.min(25, baseRateOffset + dbRateMod));
    const finalPitch = Math.max(-50, Math.min(50, basePitchOffset + dbPitchMod));

    const rateArg = finalRate >= 0 ? `+${finalRate}%` : `${finalRate}%`;
    const pitchArg = finalPitch >= 0 ? `+${finalPitch}Hz` : `${finalPitch}Hz`;

    // 4. Resolve Spoken Script directly from DB (system_languages table)
    if (!text || text.trim().length === 0) {
      text = matchedLang?.sampleText || `Hello, I am ${name}. How may I help you today?`;
    }

    // Interpolate voice name in text
    text = text
      .replace(/\$\{\s*name\s*\}/gi, name)
      .replace(/\$\(\s*name\s*\)/gi, name)
      .replace(/\{\s*name\s*\}/gi, name)
      .replace(/\$name\b/gi, name)
      .trim();

    // 5. Cache Key (Includes persona slug, tone, language, rate, pitch, and script text)
    const cacheDir = path.join(process.cwd(), "public", "uploads", "voices", "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const hash = crypto
      .createHash("md5")
      .update(
        `${personaSlug}_${effectiveLangCode}_${voiceGender}_${matchedTone?.key || "tone"}_${rateArg}_${pitchArg}_${text}`
      )
      .digest("hex");
    const cacheFilePath = path.join(cacheDir, `${hash}.mp3`);

    // Check if cached file already exists
    if (fs.existsSync(cacheFilePath)) {
      const audioBuffer = fs.readFileSync(cacheFilePath);
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.length.toString(),
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    // 6. Neural Synthesis with edge-tts (Exact Persona Voice + Tone Speed & Pitch)
    const edgeExecutable = path.join(process.cwd(), ".venv", "bin", "edge-tts");
    const hasEdgeTts = fs.existsSync(edgeExecutable);

    // Pick distinct voice actor for this persona and language
    let chosenVoice =
      persona.voiceMap?.[effectiveLangCode.toLowerCase()] ||
      persona.voiceMap?.[langPrefix];

    if (!chosenVoice) {
      const edgeVoiceConfig =
        EDGE_VOICE_MAP[effectiveLangCode.toLowerCase()] || EDGE_VOICE_MAP[langPrefix];
      chosenVoice = isMale ? edgeVoiceConfig?.male : edgeVoiceConfig?.female;
    }

    if (chosenVoice && hasEdgeTts) {
      let spokenScript = text;
      if (langPrefix === "pa") {
        const gMap: Record<string, string> = {
          'ੳ': 'उ', 'ਅ': 'अ', 'ਆ': 'आ', 'ਇ': 'इ', 'ਈ': 'ई', 'ਉ': 'उ', 'ਊ': 'ऊ', 'ਏ': 'ए', 'ਐ': 'ऐ', 'ਓ': 'ओ', 'ਔ': 'औ',
          'ਸ': 'स', 'ਹ': 'ह',
          'ਕ': 'क', 'ਖ': 'ख', 'ਗ': 'ग', 'ਘ': 'घ', 'ਙ': 'ङ',
          'ਚ': 'च', 'ਛ': 'छ', 'ਜ': 'ज', 'ਝ': 'झ', 'ਞ': 'ञ',
          'ਟ': 'ट', 'ਠ': 'ठ', 'ਡ': 'ड', 'ਢ': 'ढ', 'ਣ': 'ण',
          'ਤ': 'त', 'ਥ': 'थ', 'ਦ': 'द', 'ਧ': 'ध', 'ਨ': 'न',
          'ਪ': 'प', 'ਫ': 'फ', 'ਬ': 'ब', 'ਭ': 'भ', 'ਮ': 'म',
          'ਯ': 'य', 'ਰ': 'र', 'ਲ': 'ल', 'ਵ': 'व', 'ੜ': 'ड़',
          'ਸ਼': 'श', 'ਜ਼': 'ज़', 'ਫ਼': 'फ़', 'ਖ਼': 'ख़', 'ਗ਼': 'ग़', 'ਲ਼': 'ळ',
          'ਖ਼': 'ख़', 'ਗ਼': 'ग़', 'ਜ਼': 'ज़', 'ਫ਼': 'फ़', 'ਲ਼': 'ळ',
          'ਾ': 'ा', 'ਿ': 'ि', 'ੀ': 'ी', 'ੁ': 'ु', 'ੂ': 'ू', 'ੇ': 'े', 'ੈ': 'ै', 'ੋ': 'ो', 'ੌ': 'ौ',
          '੍': '्', 'ੰ': 'ं', 'ਂ': 'ं', 'ੱ': '्', '਼': '', '।': '।', '॥': '॥',
        };
        spokenScript = text.split('').map((c) => gMap[c] || c).join('');
      }

      try {
        await execFileAsync(edgeExecutable, [
          "--voice",
          chosenVoice,
          "--rate",
          rateArg,
          "--pitch",
          pitchArg,
          "--text",
          spokenScript,
          "--write-media",
          cacheFilePath,
        ]);

        if (fs.existsSync(cacheFilePath)) {
          const buffer = fs.readFileSync(cacheFilePath);
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": buffer.length.toString(),
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          });
        }
      } catch (edgeErr) {
        console.warn("Primary Edge TTS execution failed, retrying with male Madhur neural voice:", edgeErr);
        if (isMale) {
          try {
            await execFileAsync(edgeExecutable, [
              "--voice",
              "hi-IN-MadhurNeural",
              "--rate",
              rateArg,
              "--pitch",
              "-25Hz",
              "--text",
              spokenScript,
              "--write-media",
              cacheFilePath,
            ]);
            if (fs.existsSync(cacheFilePath)) {
              const buffer = fs.readFileSync(cacheFilePath);
              return new NextResponse(buffer, {
                status: 200,
                headers: {
                  "Content-Type": "audio/mpeg",
                  "Content-Length": buffer.length.toString(),
                  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
                  "Pragma": "no-cache",
                  "Expires": "0",
                },
              });
            }
          } catch {}
        }
      }
    }

    // 7. Fallback for Static Audio File or Google TTS
    const voiceSlug = dbVoice?.slug || slug;
    const fallbackWav = path.join(process.cwd(), "public", "uploads", "voices", `${voiceSlug}.wav`);

    // For male voices: strictly use local male .wav if edge-tts didn't produce audio
    if (isMale && fs.existsSync(fallbackWav)) {
      const wavBuffer = fs.readFileSync(fallbackWav);
      return new NextResponse(wavBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": wavBuffer.length.toString(),
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      });
    }

    // 8. Fallback to Google Free TTS ONLY for female voices where acceptable
    if (!isMale) {
      const ttsLang =
        GOOGLE_TTS_LANG_MAP[effectiveLangCode.toLowerCase()] ||
        GOOGLE_TTS_LANG_MAP[langPrefix] ||
        langPrefix ||
        "en";

      try {
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(
          text
        )}`;

        const ttsRes = await fetch(googleTtsUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "audio/mpeg, audio/*;q=0.9",
          },
        });

        if (ttsRes.ok) {
          const arrayBuf = await ttsRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);

          fs.writeFileSync(cacheFilePath, buffer);

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": buffer.length.toString(),
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          });
        }
      } catch (ttsErr) {
        console.warn("Google TTS fallback failed:", ttsErr);
      }
    }

    // 9. Final Static Audio File Fallback (Female or General)
    if (fs.existsSync(fallbackWav)) {
      const wavBuffer = fs.readFileSync(fallbackWav);
      return new NextResponse(wavBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": wavBuffer.length.toString(),
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Audio preview not available for this voice, language, and tone" },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("GET /api/voice-engine/speak error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to generate voice audio" },
      { status: 500 }
    );
  }
}
