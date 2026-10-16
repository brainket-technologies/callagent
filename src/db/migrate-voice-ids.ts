import { db } from "./index";
import postgres from "postgres";
import { aiVoices, systemLanguages, systemTones } from "./schema";
import { eq } from "drizzle-orm";

async function runMigration() {
  console.log("Starting DB migration: drop accent_language & tones columns, convert languages & tone to IDs...");

  const sql = postgres(
    process.env.DATABASE_URL || "postgresql://firozmohammad@localhost:5432/callagent"
  );

  // 1. Drop columns accent_language and tones from ai_voices table
  try {
    await sql`ALTER TABLE ai_voices DROP COLUMN IF EXISTS accent_language;`;
    console.log("✓ Dropped column 'accent_language' from ai_voices");
  } catch (err: any) {
    console.log("Note on accent_language drop:", err.message);
  }

  try {
    await sql`ALTER TABLE ai_voices DROP COLUMN IF EXISTS tones;`;
    console.log("✓ Dropped column 'tones' from ai_voices");
  } catch (err: any) {
    console.log("Note on tones drop:", err.message);
  }

  // 2. Fetch all system languages and tones
  const allLangs = await db.select().from(systemLanguages);
  const allTones = await db.select().from(systemTones);

  const langCodeToId: Record<string, string> = {};
  for (const l of allLangs) {
    langCodeToId[l.code.toLowerCase()] = l.id;
    // also map language name in lowercase (e.g. hindi, english)
    langCodeToId[l.name.toLowerCase()] = l.id;
  }

  const toneKeyToId: Record<string, string> = {};
  for (const t of allTones) {
    toneKeyToId[t.key.toLowerCase()] = t.id;
    toneKeyToId[t.name.toLowerCase()] = t.id;
  }

  console.log("Available Languages:", Object.keys(langCodeToId));
  console.log("Available Tones:", Object.keys(toneKeyToId));

  // Default fallback IDs (Hindi / English for langs, Professional for tone)
  const defaultLangIds = [
    langCodeToId["en-in"] || allLangs[0]?.id,
    langCodeToId["hi-in"] || allLangs[1]?.id,
  ].filter(Boolean);

  const defaultToneId = toneKeyToId["professional"] || allTones[0]?.id;

  // 3. Fetch all voices and update their languages and tone to UUID IDs
  const voices = await db.select().from(aiVoices);

  for (const voice of voices) {
    // Convert existing languages (codes or names) to IDs
    let existingLangs = Array.isArray(voice.languages) ? (voice.languages as string[]) : [];
    
    // Map to IDs
    let mappedLangIds: string[] = [];
    for (const item of existingLangs) {
      if (typeof item === "string") {
        // If it is already a UUID from systemLanguages, keep it
        const isExistingId = allLangs.some(l => l.id === item);
        if (isExistingId) {
          mappedLangIds.push(item);
        } else {
          const matchedId = langCodeToId[item.toLowerCase()];
          if (matchedId) {
            mappedLangIds.push(matchedId);
          }
        }
      }
    }

    if (mappedLangIds.length === 0) {
      mappedLangIds = defaultLangIds;
    }
    // Deduplicate
    mappedLangIds = Array.from(new Set(mappedLangIds));

    // Convert tone (key or name) to ID
    let currentTone = voice.tone || "professional";
    const isToneId = allTones.some(t => t.id === currentTone);
    let mappedToneId = isToneId ? currentTone : (toneKeyToId[currentTone.toLowerCase()] || defaultToneId);

    // Update voice record
    await db
      .update(aiVoices)
      .set({
        languages: mappedLangIds,
        tone: mappedToneId,
        updatedAt: new Date(),
      })
      .where(eq(aiVoices.id, voice.id));

    console.log(`Updated voice '${voice.name}': languages=${JSON.stringify(mappedLangIds)}, tone=${mappedToneId}`);
  }

  console.log("Migration completed successfully!");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
