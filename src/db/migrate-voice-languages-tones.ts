import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Adding 'languages', 'tone', 'tones' to 'ai_voices' table...");

  await db.execute(sql`
    ALTER TABLE "ai_voices" ADD COLUMN IF NOT EXISTS "languages" jsonb DEFAULT '["en-IN", "hi-IN"]';
    ALTER TABLE "ai_voices" ADD COLUMN IF NOT EXISTS "tone" varchar(50) DEFAULT 'professional';
    ALTER TABLE "ai_voices" ADD COLUMN IF NOT EXISTS "tones" jsonb DEFAULT '["professional"]';
  `);
  console.log("  ✅ Added columns to 'ai_voices'");

  // Update existing voices with rich language & tone associations
  const updates = [
    { slug: "riya-sonic-35", languages: ["hi-IN", "en-IN", "mr-IN"], tone: "friendly", tones: ["friendly", "professional"] },
    { slug: "shreya-sonic-35", languages: ["hi-IN", "en-IN"], tone: "empathetic", tones: ["empathetic", "friendly"] },
    { slug: "sanya-sonic-35", languages: ["en-IN", "en-US"], tone: "professional", tones: ["professional", "calm"] },
    { slug: "rahul-sonic-35", languages: ["hi-IN", "en-IN"], tone: "urgent", tones: ["urgent", "professional"] },
    { slug: "sagar-sonic-35", languages: ["en-IN", "hi-IN"], tone: "calm", tones: ["calm", "professional"] },
    { slug: "vishakha-sonic-35", languages: ["hi-IN", "en-IN", "mr-IN", "gu-IN"], tone: "persuasive", tones: ["persuasive", "friendly"] },
    { slug: "rachel-turbo-25", languages: ["en-US", "en-IN"], tone: "friendly", tones: ["friendly", "casual"] },
    { slug: "adam-multilingual-v2", languages: ["en-US", "en-IN"], tone: "professional", tones: ["professional", "persuasive"] },
    { slug: "aditi-elevenlabs", languages: ["hi-IN", "en-IN", "bn-IN"], tone: "empathetic", tones: ["empathetic"] },
    { slug: "google-en-in-wavenet-d", languages: ["en-IN"], tone: "professional", tones: ["professional"] },
    { slug: "google-hi-in-neural2-a", languages: ["hi-IN"], tone: "professional", tones: ["professional"] },
    { slug: "sarvam-arvind-bulbul", languages: ["hi-IN", "mr-IN", "bn-IN"], tone: "persuasive", tones: ["persuasive", "professional"] },
    { slug: "sarvam-kavya-bulbul", languages: ["hi-IN", "mr-IN", "gu-IN"], tone: "friendly", tones: ["friendly", "empathetic"] },
  ];

  for (const u of updates) {
    await db.execute(sql`
      UPDATE "ai_voices"
      SET "languages" = ${JSON.stringify(u.languages)}::jsonb,
          "tone" = ${u.tone},
          "tones" = ${JSON.stringify(u.tones)}::jsonb,
          "updated_at" = now()
      WHERE "slug" = ${u.slug};
    `);
    console.log(`  🌱 Updated voice [${u.slug}] languages=${JSON.stringify(u.languages)} tone=${u.tone}`);
  }

  console.log("✨ Voices languages and tones migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
