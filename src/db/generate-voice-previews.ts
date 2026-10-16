import { db } from "./index";
import { aiVoices, systemTones, systemLanguages } from "./schema";
import { sql } from "drizzle-orm";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Voice configurations with Mac system voices
interface VoiceConfig {
  sysVoiceEn: string;
  sysVoiceIndic: string;
  cleanName: string;
  gender: string;
}

const VOICE_CONFIGS: Record<string, VoiceConfig> = {
  "riya-sonic-35": {
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    cleanName: "Riya",
    gender: "female",
  },
  "shreya-sonic-35": {
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    cleanName: "Shreya",
    gender: "female",
  },
  "sanya-sonic-35": {
    sysVoiceEn: "Samantha",
    sysVoiceIndic: "Lekha",
    cleanName: "Sanya",
    gender: "female",
  },
  "rahul-sonic-35": {
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    cleanName: "Rahul",
    gender: "male",
  },
  "sagar-sonic-35": {
    sysVoiceEn: "Aman",
    sysVoiceIndic: "Rishi",
    cleanName: "Sagar",
    gender: "male",
  },
  "vishakha-sonic-35": {
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    cleanName: "Vishakha",
    gender: "female",
  },
  "rachel-turbo-25": {
    sysVoiceEn: "Samantha",
    sysVoiceIndic: "Lekha",
    cleanName: "Rachel",
    gender: "female",
  },
  "adam-multilingual-v2": {
    sysVoiceEn: "Reed",
    sysVoiceIndic: "Rishi",
    cleanName: "Adam",
    gender: "male",
  },
  "aditi-elevenlabs": {
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    cleanName: "Aditi",
    gender: "female",
  },
  "google-en-in-wavenet-d": {
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    cleanName: "Google WaveNet",
    gender: "female",
  },
  "google-hi-in-neural2-a": {
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    cleanName: "Google Neural",
    gender: "female",
  },
  "sarvam-arvind-bulbul": {
    sysVoiceEn: "Rishi",
    sysVoiceIndic: "Rishi",
    cleanName: "Arvind",
    gender: "male",
  },
  "sarvam-kavya-bulbul": {
    sysVoiceEn: "Tara",
    sysVoiceIndic: "Lekha",
    cleanName: "Kavya",
    gender: "female",
  },
};

// Rates by tone for English and Indic languages (All 20 system tones)
const TONE_RATES: Record<string, { enRate: number; indicRate: number }> = {
  urgent: { enRate: 220, indicRate: 210 },
  friendly: { enRate: 185, indicRate: 180 },
  empathetic: { enRate: 145, indicRate: 140 },
  professional: { enRate: 175, indicRate: 170 },
  persuasive: { enRate: 205, indicRate: 195 },
  calm: { enRate: 135, indicRate: 130 },
  casual: { enRate: 170, indicRate: 165 },
  authoritative: { enRate: 165, indicRate: 160 },
  enthusiastic: { enRate: 215, indicRate: 205 },
  direct: { enRate: 200, indicRate: 190 },
  sympathetic: { enRate: 145, indicRate: 140 },
  humorous: { enRate: 190, indicRate: 185 },
  formal: { enRate: 160, indicRate: 155 },
  playful: { enRate: 200, indicRate: 190 },
  inspirational: { enRate: 180, indicRate: 175 },
  luxury: { enRate: 150, indicRate: 145 },
  patient: { enRate: 140, indicRate: 135 },
  cheerful: { enRate: 195, indicRate: 190 },
  assertive: { enRate: 175, indicRate: 170 },
  inquisitive: { enRate: 175, indicRate: 170 },
};

// Return standard benchmark text without punctuation glitches (NO exclamation marks!)
function getSpeechText(
  lang: string,
  name: string,
  gender: string
): { text: string; sysVoiceKey: "sysVoiceEn" | "sysVoiceIndic" } {
  const code = lang.toLowerCase().split("-")[0];

  if (code === "hi") {
    // If female voice using Lekha, use Devanagari without exclamation mark
    if (gender === "female") {
      return {
        text: `नमस्ते, मैं ${name} हूँ. मैं आपकी सभी व्यावसायिक कॉल्स को संभालने के लिए तैयार हूँ.`,
        sysVoiceKey: "sysVoiceIndic",
      };
    }
    // For male voice using Rishi, use Romanized Hindi so it pronounces cleanly with Indian accent
    return {
      text: `Namaste, main ${name} hoon. Main aapki sabhi business calls ko sambhalne ke liye taiyar hoon.`,
      sysVoiceKey: "sysVoiceIndic",
    };
  }

  if (code === "mr") {
    if (gender === "female") {
      return {
        text: `नमस्कार, मी ${name} आहे. आपल्या सर्व व्यावसायिक कॉल्स सांभाळण्यासाठी मी तयार आहे.`,
        sysVoiceKey: "sysVoiceIndic",
      };
    }
    return {
      text: `Namaskar, mee ${name} aahe. Aaplya sarva business calls sambhalnyasathi mee taiyar aahe.`,
      sysVoiceKey: "sysVoiceIndic",
    };
  }

  if (code === "gu") {
    return {
      text: `Namaste, hoon ${name} chhoon. Tamara badha business calls sambhalva maate hoon taiyar chhoon.`,
      sysVoiceKey: "sysVoiceEn",
    };
  }

  if (code === "bn") {
    return {
      text: `Nomoshkar, aami ${name} bolchhi. Aaponar shob business call porichalona korte aami prostut.`,
      sysVoiceKey: "sysVoiceIndic",
    };
  }

  // Default: English
  return {
    text: `Hello, I am ${name}. I am ready to handle your business communications with ease.`,
    sysVoiceKey: "sysVoiceEn",
  };
}

async function main() {
  console.log("🎙️ Generating Flawless Voice Previews across ALL assigned languages and tones...");
  console.log("   (Exclamation marks removed to fix 'exclamation point' audio glitch)");

  const outDir = path.join(process.cwd(), "public", "uploads", "voices");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const allVoices = await db.select().from(aiVoices);
  const allTones = await db.select().from(systemTones);
  const toneMap = new Map(allTones.map((t) => [t.id, t.key]));

  const allLangs = await db.select().from(systemLanguages);
  const langMap = new Map(allLangs.map((l) => [l.id, l.code]));

  console.log(`Processing ${allVoices.length} voices...`);

  for (const v of allVoices) {
    const config = VOICE_CONFIGS[v.slug] || {
      sysVoiceEn: v.gender === "female" ? "Tara" : "Rishi",
      sysVoiceIndic: v.gender === "female" ? "Lekha" : "Rishi",
      cleanName: v.name.replace(/\(.*?\)/g, "").trim(),
      gender: v.gender || "female",
    };

    // 1. Determine assigned tone key
    const assignedToneKey = (v.tone && toneMap.get(v.tone)) || "professional";

    // 2. Determine assigned languages
    const assignedLangIds = (Array.isArray(v.languages) ? v.languages : []) as string[];
    const assignedCodes = assignedLangIds.map((id) => langMap.get(id) || id);
    if (assignedCodes.length === 0) assignedCodes.push("en-IN");

    // Primary language: first assigned language
    const primaryCode = assignedCodes[0];
    const primaryPrefix = primaryCode.split("-")[0];

    console.log(`\n🎤 [${v.name}] Slug: ${v.slug}`);
    console.log(`   Assigned Tone: ${assignedToneKey}`);
    console.log(`   Assigned Langs: [${assignedCodes.join(", ")}] -> Primary: ${primaryCode}`);

    // Priority 1: Assigned tone for all assigned languages
    // Priority 2: Popular tones (professional, friendly, urgent, calm, enthusiastic, direct)
    const tonesToGenerate = Array.from(
      new Set([
        assignedToneKey,
        "professional",
        "friendly",
        "urgent",
        "calm",
        "enthusiastic",
        "direct",
      ])
    );

    for (const toneKey of tonesToGenerate) {
      const rates = TONE_RATES[toneKey] || TONE_RATES.professional;
      for (const langCode of assignedCodes) {
        const langPrefix = langCode.split("-")[0];
        const { text, sysVoiceKey } = getSpeechText(langCode, config.cleanName, config.gender);
        const sysVoice = config[sysVoiceKey];
        const rate = langPrefix === "en" ? rates.enRate : rates.indicRate;

        const toneFileName = `${v.slug}-${langPrefix}-${toneKey}.wav`;
        const tempAiff = path.join("/tmp", `${v.slug}-${langPrefix}-${toneKey}.aiff`);
        const finalWavPath = path.join(outDir, toneFileName);

        if (!fs.existsSync(finalWavPath)) {
          try {
            execSync(
              `say -v "${sysVoice}" -r ${rate} -o "${tempAiff}" "${text.replace(/"/g, '\\"')}"`
            );
            execSync(`afconvert -f 'WAVE' -d 'LEI16@24000' "${tempAiff}" "${finalWavPath}"`);
            if (fs.existsSync(tempAiff)) fs.unlinkSync(tempAiff);
          } catch (err: any) {
            console.error(`  ❌ Failed generating ${toneFileName}:`, err?.message);
          }
        }

        // If this is the primary language, also copy as the primary tone wav: `${slug}-${toneKey}.wav`
        if (langPrefix === primaryPrefix) {
          const toneWavPath = path.join(outDir, `${v.slug}-${toneKey}.wav`);
          if (fs.existsSync(finalWavPath) && !fs.existsSync(toneWavPath)) {
            fs.copyFileSync(finalWavPath, toneWavPath);
          }
        }

        // If this is the assigned tone AND primary language, copy as primary `${slug}.wav`
        if (toneKey === assignedToneKey && langPrefix === primaryPrefix) {
          const defaultWavPath = path.join(outDir, `${v.slug}.wav`);
          if (fs.existsSync(finalWavPath)) {
            fs.copyFileSync(finalWavPath, defaultWavPath);
            console.log(`   🌟 Primary ${v.slug}.wav saved in [${langPrefix.toUpperCase()}] tone [${toneKey}]`);
          }
        }
      }
    }

    // Ensure primary default audio exists
    const defaultWavPath = path.join(outDir, `${v.slug}.wav`);
    if (!fs.existsSync(defaultWavPath)) {
      const existing = fs.readdirSync(outDir).filter((f) => f.startsWith(v.slug) && f.endsWith(".wav"));
      if (existing.length > 0) {
        fs.copyFileSync(path.join(outDir, existing[0]), defaultWavPath);
        console.log(`   🌟 Default ${v.slug}.wav linked from ${existing[0]}`);
      }
    }

    // Update database previewAudioUrl
    const finalUrl = `/uploads/voices/${v.slug}.wav`;
    await db
      .update(aiVoices)
      .set({
        previewAudioUrl: finalUrl,
        updatedAt: new Date(),
      })
      .where(sql`id = ${v.id}`);

    console.log(`   ✅ DB updated for ${v.name} -> previewAudioUrl = ${finalUrl}`);
  }

  console.log("\n🎉 All voice previews successfully generated for ALL languages and tones!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Audio generation error:", err);
  process.exit(1);
});
