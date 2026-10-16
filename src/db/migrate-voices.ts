import { db } from "./index";
import { sql } from "drizzle-orm";
import { systemLanguages, systemTones } from "./schema";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export interface VoiceSeedItem {
  slug: string;
  name: string;
  cleanName: string;
  provider: "Cartesia" | "ElevenLabs" | "Google" | "Sarvam" | "OpenAI";
  voiceId: string;
  model: string;
  tag: "Most Used" | "Neutral";
  gender: "female" | "male";
  languages: string[]; // language codes to be resolved to system_languages.id UUIDs
  tone: string;       // tone key to be resolved to system_tones.id UUID
  description: string;
  sysVoiceEn: string;
  sysVoiceIndic: string;
  sortOrder: number;
}

export const INDIAN_VOICES_SEED: VoiceSeedItem[] = [
  // ==========================================
  // 1. CARTESIA (Sonic-3.5)
  // ==========================================
  {
    slug: "riya-sonic-35",
    name: "Riya (Sonic-3.5)",
    cleanName: "Riya",
    provider: "Cartesia",
    voiceId: "sonic-riya-in-35",
    model: "Sonic-3.5",
    tag: "Most Used",
    gender: "female",
    languages: ["hi-IN", "en-IN", "mr-IN"],
    tone: "ecommerce-care",
    description: "Cheerful, swift Indian female voice for customer care, order support, and e-commerce.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 1,
  },
  {
    slug: "arjun-sonic-35",
    name: "Arjun (Sonic-3.5)",
    cleanName: "Arjun",
    provider: "Cartesia",
    voiceId: "sonic-arjun-in-35",
    model: "Sonic-3.5",
    tag: "Most Used",
    gender: "male",
    languages: ["hi-IN", "en-IN", "pa-IN"],
    tone: "logistics-dispatch",
    description: "Fast, authoritative Indian male voice for dispatch operations, fleet coordination, and OTPs.",
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    sortOrder: 2,
  },
  {
    slug: "ananya-sonic-35",
    name: "Ananya (Sonic-3.5)",
    cleanName: "Ananya",
    provider: "Cartesia",
    voiceId: "sonic-ananya-in-35",
    model: "Sonic-3.5",
    tag: "Most Used",
    gender: "female",
    languages: ["hi-IN", "en-IN", "bn-IN"],
    tone: "education-counselor",
    description: "Inspiring, warm female voice for student admissions, course advice, and career guidance.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 3,
  },
  {
    slug: "kabir-sonic-35",
    name: "Kabir (Sonic-3.5)",
    cleanName: "Kabir",
    provider: "Cartesia",
    voiceId: "sonic-kabir-in-35",
    model: "Sonic-3.5",
    tag: "Neutral",
    gender: "male",
    languages: ["hi-IN", "en-IN", "te-IN"],
    tone: "financial-advisory",
    description: "Articulate, compliant corporate male persona for wealth management and banking.",
    sysVoiceEn: "Aman",
    sysVoiceIndic: "Rishi",
    sortOrder: 4,
  },
  {
    slug: "shreya-sonic-35",
    name: "Shreya (Sonic-3.5)",
    cleanName: "Shreya",
    provider: "Cartesia",
    voiceId: "sonic-shreya-in-35",
    model: "Sonic-3.5",
    tag: "Neutral",
    gender: "female",
    languages: ["hi-IN", "en-IN", "gu-IN"],
    tone: "healthcare-clinic",
    description: "Gentle, organized clinic desk voice for doctor consultations and diagnostic reports.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 5,
  },
  {
    slug: "ishaan-sonic-35",
    name: "Ishaan (Sonic-3.5)",
    cleanName: "Ishaan",
    provider: "Cartesia",
    voiceId: "sonic-ishaan-in-35",
    model: "Sonic-3.5",
    tag: "Neutral",
    gender: "male",
    languages: ["hi-IN", "en-IN"],
    tone: "logistics-ndr",
    description: "Action-oriented problem solver for NDR delivery rescheduling and address verification.",
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    sortOrder: 6,
  },

  // ==========================================
  // 2. ELEVENLABS (Turbo v2.5 / Multilingual v2)
  // ==========================================
  {
    slug: "aditi-elevenlabs",
    name: "Aditi (Turbo v2.5)",
    cleanName: "Aditi",
    provider: "ElevenLabs",
    voiceId: "ThT5KcBeYPX3keUQqHPh",
    model: "Turbo v2.5",
    tag: "Most Used",
    gender: "female",
    languages: ["hi-IN", "en-IN", "bn-IN"],
    tone: "healthcare-empathetic",
    description: "Empathetic, compassionate female voice with natural Indian cadence for healthcare & counseling.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 7,
  },
  {
    slug: "aarav-elevenlabs",
    name: "Aarav (Turbo v2.5)",
    cleanName: "Aarav",
    provider: "ElevenLabs",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    model: "Turbo v2.5",
    tag: "Most Used",
    gender: "male",
    languages: ["en-IN", "hi-IN", "en-US"],
    tone: "hr-screening",
    description: "Engaging recruiter persona for HR candidate screening, salary expectations, and interview setup.",
    sysVoiceEn: "Aman",
    sysVoiceIndic: "Rishi",
    sortOrder: 8,
  },
  {
    slug: "pooja-elevenlabs",
    name: "Pooja (Multilingual v2)",
    cleanName: "Pooja",
    provider: "ElevenLabs",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    model: "Multilingual v2",
    tag: "Neutral",
    gender: "female",
    languages: ["hi-IN", "en-IN", "mr-IN"],
    tone: "ecommerce-sales",
    description: "High-energy, persuasive promotional sales voice for cart recovery and festive offers.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 9,
  },
  {
    slug: "rohan-elevenlabs",
    name: "Rohan (Multilingual v2)",
    cleanName: "Rohan",
    provider: "ElevenLabs",
    voiceId: "SOYHLrjzK2X1ezoPC6cr",
    model: "Multilingual v2",
    tag: "Neutral",
    gender: "male",
    languages: ["en-IN", "hi-IN"],
    tone: "financial-sales",
    description: "Dynamic fintech lead qualification voice for credit cards and merchant loans.",
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    sortOrder: 10,
  },

  // ==========================================
  // 3. GOOGLE (Neural2 / WaveNet)
  // ==========================================
  {
    slug: "google-priya-neural2",
    name: "Priya (Google Neural2)",
    cleanName: "Priya",
    provider: "Google",
    voiceId: "hi-IN-Neural2-A",
    model: "Neural2",
    tag: "Most Used",
    gender: "female",
    languages: ["hi-IN", "en-IN"],
    tone: "financial-collections",
    description: "Clear, polite, and firm Google Neural2 voice for EMI payment reminders and due alerts.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 11,
  },
  {
    slug: "google-aditya-neural2",
    name: "Aditya (Google Neural2)",
    cleanName: "Aditya",
    provider: "Google",
    voiceId: "hi-IN-Neural2-B",
    model: "Neural2",
    tag: "Most Used",
    gender: "male",
    languages: ["hi-IN", "en-IN", "mr-IN"],
    tone: "education-academic",
    description: "Patient, structured Google Neural2 voice for academic advisors and examination schedules.",
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    sortOrder: 12,
  },
  {
    slug: "google-sneha-wavenet",
    name: "Sneha (Google WaveNet)",
    cleanName: "Sneha",
    provider: "Google",
    voiceId: "en-IN-Wavenet-D",
    model: "Wavenet",
    tag: "Neutral",
    gender: "female",
    languages: ["en-IN", "ta-IN"],
    tone: "healthcare-wellness",
    description: "Soothing WaveNet voice for preventive health checkups and wellness prescription updates.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 13,
  },
  {
    slug: "google-vikram-wavenet",
    name: "Vikram (Google WaveNet)",
    cleanName: "Vikram",
    provider: "Google",
    voiceId: "en-IN-Wavenet-C",
    model: "Wavenet",
    tag: "Neutral",
    gender: "male",
    languages: ["en-IN", "hi-IN"],
    tone: "financial-kyc",
    description: "Authoritative Google WaveNet male voice for banking KYC alerts and security notices.",
    sysVoiceEn: "Aman",
    sysVoiceIndic: "Rishi",
    sortOrder: 14,
  },

  // ==========================================
  // 4. SARVAM AI (Bulbul v1 Indic)
  // ==========================================
  {
    slug: "sarvam-arvind-bulbul",
    name: "Arvind (Sarvam Bulbul)",
    cleanName: "Arvind",
    provider: "Sarvam",
    voiceId: "sarvam-bulbul-arvind",
    model: "Bulbul v1",
    tag: "Most Used",
    gender: "male",
    languages: ["hi-IN", "mr-IN", "gu-IN", "bn-IN"],
    tone: "ecommerce-verification",
    description: "Authentic vernacular Indian male voice for COD verification and order confirmations.",
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    sortOrder: 15,
  },
  {
    slug: "sarvam-kavya-bulbul",
    name: "Kavya (Sarvam Bulbul)",
    cleanName: "Kavya",
    provider: "Sarvam",
    voiceId: "sarvam-bulbul-kavya",
    model: "Bulbul v1",
    tag: "Most Used",
    gender: "female",
    languages: ["hi-IN", "mr-IN", "gu-IN", "ta-IN", "te-IN"],
    tone: "hr-onboarding",
    description: "Welcoming vernacular Indian female voice for employee onboarding and company intro.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 16,
  },
  {
    slug: "sarvam-rajesh-bulbul",
    name: "Rajesh (Sarvam Bulbul)",
    cleanName: "Rajesh",
    provider: "Sarvam",
    voiceId: "sarvam-bulbul-rajesh",
    model: "Bulbul v1",
    tag: "Neutral",
    gender: "male",
    languages: ["hi-IN", "kn-IN", "te-IN"],
    tone: "logistics-support",
    description: "Helpful, approachable Indic helpdesk voice for delivery tracking and transit delays.",
    sysVoiceEn: "Aman",
    sysVoiceIndic: "Rishi",
    sortOrder: 17,
  },
  {
    slug: "sarvam-meera-bulbul",
    name: "Meera (Sarvam Bulbul)",
    cleanName: "Meera",
    provider: "Sarvam",
    voiceId: "sarvam-bulbul-meera",
    model: "Bulbul v1",
    tag: "Neutral",
    gender: "female",
    languages: ["hi-IN", "ta-IN", "ml-IN"],
    tone: "education-edtech",
    description: "Vibrant Indic educational advisor voice for bootcamp demos and placement counselling.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 18,
  },

  // ==========================================
  // 5. OPENAI (TTS-1 / TTS-1-HD)
  // ==========================================
  {
    slug: "openai-neha-alloy",
    name: "Neha (OpenAI Alloy)",
    cleanName: "Neha",
    provider: "OpenAI",
    voiceId: "alloy",
    model: "TTS-1",
    tag: "Most Used",
    gender: "female",
    languages: ["en-IN", "hi-IN", "en-US"],
    tone: "ecommerce-care",
    description: "Balanced, clear, versatile Indian female voice for modern customer engagement.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 19,
  },
  {
    slug: "openai-dev-echo",
    name: "Dev (OpenAI Echo)",
    cleanName: "Dev",
    provider: "OpenAI",
    voiceId: "echo",
    model: "TTS-1",
    tag: "Most Used",
    gender: "male",
    languages: ["en-IN", "hi-IN", "en-US"],
    tone: "hr-headhunter",
    description: "Executive, poised Indian male voice for confidential leadership hiring.",
    sysVoiceEn: "Aman",
    sysVoiceIndic: "Rishi",
    sortOrder: 20,
  },
  {
    slug: "openai-sanya-coral",
    name: "Sanya (OpenAI Coral)",
    cleanName: "Sanya",
    provider: "OpenAI",
    voiceId: "coral",
    model: "TTS-1",
    tag: "Neutral",
    gender: "female",
    languages: ["en-IN", "hi-IN"],
    tone: "financial-advisory",
    description: "Polished, reassuring corporate tone for financial planning and wealth consultation.",
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    sortOrder: 21,
  },
  {
    slug: "openai-sanjay-onyx",
    name: "Sanjay (OpenAI Onyx)",
    cleanName: "Sanjay",
    provider: "OpenAI",
    voiceId: "onyx",
    model: "TTS-1-HD",
    tag: "Neutral",
    gender: "male",
    languages: ["en-IN", "hi-IN"],
    tone: "logistics-dispatch",
    description: "Deep, commanding Indian male narrator for dispatch alerts and logistics logistics.",
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    sortOrder: 22,
  },
];

export async function seedAllVoices() {
  console.log("🚀 Refreshing Indian AI Voices in PostgreSQL with UUID foreign keys (languages & tone)...");

  // 1. Ensure table structure
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "ai_voices" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "slug" varchar(100) NOT NULL UNIQUE,
      "name" varchar(150) NOT NULL,
      "provider" varchar(50) NOT NULL DEFAULT 'Cartesia',
      "voice_id" varchar(150) NOT NULL,
      "model" varchar(100) DEFAULT 'Sonic-3.5',
      "tag" varchar(50) DEFAULT 'Neutral',
      "gender" varchar(20) DEFAULT 'female',
      "languages" jsonb DEFAULT '[]',
      "tone" varchar(100),
      "preview_audio_url" text,
      "description" text,
      "is_enabled" boolean NOT NULL DEFAULT true,
      "sort_order" integer DEFAULT 0,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  // 2. Clear old voices table completely
  console.log("  🧹 Clearing old voices from ai_voices table...");
  await db.execute(sql`DELETE FROM "ai_voices"`);

  // 3. Resolve system languages and tones UUIDs from DB
  const allLangs = await db.select().from(systemLanguages);
  const langCodeToId = new Map(allLangs.map((l) => [l.code.toLowerCase(), l.id]));

  const allTones = await db.select().from(systemTones);
  const toneKeyToId = new Map(allTones.map((t) => [t.key.toLowerCase(), t.id]));

  console.log(`  🔍 Loaded ${allLangs.length} system languages and ${allTones.length} system tones for ID mapping.`);

  // 4. Output directory for voices audio
  const outDir = path.join(process.cwd(), "public", "uploads", "voices");
  const cacheDir = path.join(outDir, "cache");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Clear existing voice preview audio files and cache so they are freshly generated
  console.log("  🧹 Removing old preview audio files in public/uploads/voices...");
  const existingFiles = fs.readdirSync(outDir);
  for (const file of existingFiles) {
    const fullPath = path.join(outDir, file);
    if (file === "cache" && fs.existsSync(cacheDir)) {
      const cached = fs.readdirSync(cacheDir);
      for (const cf of cached) {
        try { fs.unlinkSync(path.join(cacheDir, cf)); } catch {}
      }
    } else if (file.endsWith(".wav") || file.endsWith(".mp3") || file.endsWith(".aiff")) {
      try { fs.unlinkSync(fullPath); } catch {}
    }
  }

  const edgeExecutable = path.join(process.cwd(), ".venv", "bin", "edge-tts");
  const hasEdgeTts = fs.existsSync(edgeExecutable);
  console.log(`  🎙️ Edge Neural TTS status: ${hasEdgeTts ? "Available at .venv/bin/edge-tts" : "Not found"}`);

  // 5. Insert each Indian voice with language & tone IDs, and generate fresh preview audio
  for (const v of INDIAN_VOICES_SEED) {
    const audioFileName = `${v.slug}.wav`;
    const audioFilePath = path.join(outDir, audioFileName);
    const previewUrl = `/uploads/voices/${audioFileName}`;

    // Map language codes to UUIDs from system_languages table
    const mappedLangIds = v.languages
      .map((code) => langCodeToId.get(code.toLowerCase()))
      .filter(Boolean) as string[];

    // Fallback if none matched
    if (mappedLangIds.length === 0 && allLangs.length > 0) {
      mappedLangIds.push(allLangs[0].id);
    }

    // Map tone key to UUID from system_tones table
    const mappedToneId = toneKeyToId.get(v.tone.toLowerCase()) || allTones[0]?.id || null;

    const isMale = v.gender === "male";
    const primaryLang = v.languages[0] || "hi-IN";
    const isEnglishPrimary = primaryLang.startsWith("en");

    // Natural sample text
    const speechText = isEnglishPrimary
      ? `Hello, I am ${v.cleanName}. I am ready to handle your business communications with ease.`
      : `नमस्ते, मैं ${v.cleanName} हूँ। आपकी सभी व्यावसायिक कॉल्स को आसानी से संभालने के लिए मैं तैयार हूँ।`;

    // Neural voice selection:
    // Male: hi-IN-MadhurNeural / en-IN-PrabhatNeural at -22Hz deep baritone
    // Female: hi-IN-SwaraNeural / en-IN-NeerjaNeural at +2Hz
    const neuralVoice = isMale
      ? (isEnglishPrimary ? "en-IN-PrabhatNeural" : "hi-IN-MadhurNeural")
      : (isEnglishPrimary ? "en-IN-NeerjaNeural" : "hi-IN-SwaraNeural");
    const pitch = isMale ? "-22Hz" : "+2Hz";

    // Freshly generate neural audio
    if (hasEdgeTts) {
      try {
        const tempMp3 = path.join("/tmp", `${v.slug}-preview.mp3`);
        execSync(
          `"${edgeExecutable}" --voice "${neuralVoice}" --pitch="${pitch}" --rate="+0%" --text "${speechText.replace(/"/g, '\\"')}" --write-media "${tempMp3}"`,
          { stdio: "ignore" }
        );
        execSync(`afconvert -f 'WAVE' -d 'LEI16@24000' "${tempMp3}" "${audioFilePath}"`, { stdio: "ignore" });
        if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
      } catch (err: any) {
        console.warn(`  ⚠️ Failed generating edge-tts preview for ${v.name}:`, err?.message);
      }
    }

    // Fallback if edge-tts failed or file not generated
    if (!fs.existsSync(audioFilePath)) {
      try {
        const tempAiff = path.join("/tmp", `${v.slug}.aiff`);
        execSync(
          `say -v "${v.sysVoiceEn}" -r 175 -o "${tempAiff}" "${speechText.replace(/"/g, '\\"')}"`,
          { stdio: "ignore" }
        );
        execSync(`afconvert -f 'WAVE' -d 'LEI16@24000' "${tempAiff}" "${audioFilePath}"`, { stdio: "ignore" });
        if (fs.existsSync(tempAiff)) fs.unlinkSync(tempAiff);
      } catch {}
    }

    await db.execute(sql`
      INSERT INTO "ai_voices" (
        "slug", "name", "provider", "voice_id", "model", "tag", "gender",
        "languages", "tone", "preview_audio_url", "description", "is_enabled", "sort_order"
      ) VALUES (
        ${v.slug}, ${v.name}, ${v.provider}, ${v.voiceId}, ${v.model}, ${v.tag}, ${v.gender},
        ${JSON.stringify(mappedLangIds)}::jsonb, ${mappedToneId}, ${previewUrl}, ${v.description}, true, ${v.sortOrder}
      );
    `);

    console.log(`  🌱 [${v.provider}] ${v.name} (${v.gender}) [${neuralVoice} ${pitch}] -> Tone ID: ${mappedToneId}, Langs: ${mappedLangIds.length}`);
  }

  console.log(`✨ Successfully wiped and freshly generated all ${INDIAN_VOICES_SEED.length} Indian AI Voices!`);
}

if (process.argv[1]?.endsWith("migrate-voices.ts")) {
  seedAllVoices()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Voices migration failed:", err);
      process.exit(1);
    });
}
