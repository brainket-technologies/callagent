import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface VoiceProvidersConfig {
  elevenlabsApiKey?: string;
  sarvamApiKey?: string;
  cartesiaApiKey?: string;
  openaiApiKey?: string;
  defaultProvider?: string;
}

const SETTINGS_KEY = "voice_providers_config";

/**
 * Load Voice Providers API configuration from PostgreSQL system_settings or process.env
 */
export async function getVoiceProvidersConfig(): Promise<VoiceProvidersConfig> {
  let dbConfig: VoiceProvidersConfig = {};
  try {
    const rows = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, SETTINGS_KEY))
      .limit(1);

    if (rows.length > 0 && rows[0]?.data) {
      dbConfig = rows[0].data as VoiceProvidersConfig;
    }
  } catch (err) {
    console.warn("Could not query systemSettings for voice_providers_config:", err);
  }

  return {
    elevenlabsApiKey: dbConfig.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY || "",
    sarvamApiKey: dbConfig.sarvamApiKey || process.env.SARVAM_API_KEY || "",
    cartesiaApiKey: dbConfig.cartesiaApiKey || process.env.CARTESIA_API_KEY || "",
    openaiApiKey: dbConfig.openaiApiKey || process.env.OPENAI_API_KEY || "",
    defaultProvider: dbConfig.defaultProvider || "elevenlabs",
  };
}

/**
 * Save Voice Providers API configuration to PostgreSQL system_settings
 */
export async function saveVoiceProvidersConfig(
  config: Partial<VoiceProvidersConfig>
): Promise<VoiceProvidersConfig> {
  const current = await getVoiceProvidersConfig();
  const updated: VoiceProvidersConfig = {
    ...current,
    ...config,
  };

  const existing = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, SETTINGS_KEY))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(systemSettings)
      .set({
        data: updated as any,
        updatedAt: new Date(),
      })
      .where(eq(systemSettings.key, SETTINGS_KEY));
  } else {
    await db.insert(systemSettings).values({
      key: SETTINGS_KEY,
      data: updated as any,
    });
  }

  return updated;
}

/**
 * ElevenLabs Known High-Fidelity Voice IDs
 */
export const ELEVENLABS_PRESET_VOICES: Record<string, string> = {
  // Male conversational Indian / Global
  "aarav-elevenlabs": "pNInz6obpgDQGcFmaJgB", // Adam (warm, deep, authentic conversational male)
  "rohan-elevenlabs": "VR6AewLTigWG4xSOukaG", // Arnold
  "firoz-sonic-35": "pNInz6obpgDQGcFmaJgB",
  "arjun-sonic-35": "ErXwobaYiN019PkySvjV", // Antoni
  "kabir-sonic-35": "TxGEqnHWrfWFTfGW9XjX", // Josh
  // Female conversational Indian / Global
  "aditi-elevenlabs": "21m00Tcm4TlvDq8ikWAM", // Rachel (calm, warm, articulate female)
  "pooja-elevenlabs": "EXAVITQu4vr4xnSDxMaL", // Bella (expressive, energetic female)
  "riya-sonic-35": "21m00Tcm4TlvDq8ikWAM",
  "ananya-sonic-35": "AZnzlk1XvdvUeBnXmlld", // Domi
  "shreya-sonic-35": "ThT5KcBeYPX3keUQqHPh", // Dorothy
};

/**
 * Synthesize speech via ElevenLabs API (Ultra-realistic human performance)
 */
export async function synthesizeElevenLabsSpeech(options: {
  apiKey: string;
  voiceId: string;
  text: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}): Promise<Buffer | null> {
  try {
    const { apiKey, voiceId, text, stability = 0.5, similarityBoost = 0.8, style = 0.3 } = options;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("ElevenLabs TTS error:", res.status, errText);
      return null;
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err) {
    console.warn("ElevenLabs TTS fetch error:", err);
    return null;
  }
}

/**
 * Clone Voice from Reference Audio using ElevenLabs Instant Voice Cloning
 */
export async function cloneVoiceWithElevenLabs(options: {
  apiKey: string;
  name: string;
  audioFilePath: string;
  description?: string;
}): Promise<{ voiceId: string; name: string } | null> {
  try {
    const { apiKey, name, audioFilePath, description } = options;
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Reference audio file not found: ${audioFilePath}`);
    }

    const fileBuffer = fs.readFileSync(audioFilePath);
    const fileName = path.basename(audioFilePath);

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("files", new Blob([fileBuffer]), fileName);

    const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("ElevenLabs Voice Cloning error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    return {
      voiceId: data.voice_id,
      name,
    };
  } catch (err) {
    console.warn("ElevenLabs clone error:", err);
    return null;
  }
}

/**
 * Synthesize speech via Sarvam AI Bulbul (Native Indian Colloquial Voice Engine)
 */
export async function synthesizeSarvamSpeech(options: {
  apiKey: string;
  speaker: string;
  text: string;
  langCode?: string;
  pace?: number;
}): Promise<Buffer | null> {
  try {
    const { apiKey, speaker, text, langCode = "hi-IN", pace = 1.0 } = options;
    const url = "https://api.sarvam.ai/text-to-speech";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: langCode,
        speaker: speaker || "meera",
        pitch: 0,
        pace,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v1",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Sarvam AI TTS error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    if (data.audios && data.audios[0]) {
      return Buffer.from(data.audios[0], "base64");
    }
    return null;
  } catch (err) {
    console.warn("Sarvam TTS fetch error:", err);
    return null;
  }
}

/**
 * Synthesize speech via OpenAI Speech API (TTS-1-HD)
 */
export async function synthesizeOpenAISpeech(options: {
  apiKey: string;
  voice: string;
  text: string;
  speed?: number;
}): Promise<Buffer | null> {
  try {
    const { apiKey, voice = "alloy", text, speed = 1.0 } = options;
    const url = "https://api.openai.com/v1/audio/speech";

    const validVoice = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(voice.toLowerCase())
      ? voice.toLowerCase()
      : "alloy";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice: validVoice,
        input: text,
        speed,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("OpenAI TTS error:", res.status, errText);
      return null;
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err) {
    console.warn("OpenAI TTS fetch error:", err);
    return null;
  }
}

/**
 * Synthesize speech via Cartesia Sonic-3.5 API
 */
export async function synthesizeCartesiaSpeech(options: {
  apiKey: string;
  voiceId: string;
  text: string;
  modelId?: string;
}): Promise<Buffer | null> {
  try {
    const { apiKey, voiceId, text, modelId = "sonic-multilingual" } = options;
    const url = "https://api.cartesia.ai/tts/bytes";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "Cartesia-Version": "2024-06-10",
      },
      body: JSON.stringify({
        model_id: modelId,
        transcript: text,
        voice: {
          mode: "id",
          id: voiceId,
        },
        output_format: {
          container: "mp3",
          sample_rate: 44100,
          bit_rate: 128000,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Cartesia TTS error:", res.status, errText);
      return null;
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err) {
    console.warn("Cartesia TTS fetch error:", err);
    return null;
  }
}
