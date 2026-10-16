import { db, schema } from "./index";
import { hashPassword } from "../lib/auth-password";
import { SYSTEM_LANGUAGES_SEED } from "./migrate-languages";
import { seedAllTones } from "./migrate-tones";
import { seedAllVoices } from "./migrate-voices";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting Database Seeder...");

  // 1. Seed Admin
  console.log("  👤 Seeding admin account...");
  await db.delete(schema.admins);
  const hashedPassword = await hashPassword("123");
  const [newAdmin] = await db
    .insert(schema.admins)
    .values({
      email: "admin",
      passwordHash: hashedPassword,
      name: "Admin",
      isActive: true,
    })
    .returning();
  console.log("  ✅ Admin created:", newAdmin.email);

  // 2. Seed 24 System Languages
  console.log("  🌐 Seeding 24 system languages...");
  for (const lang of SYSTEM_LANGUAGES_SEED) {
    await db.execute(sql`
      INSERT INTO "system_languages" (
        "code", "name", "native_name", "flag_emoji", "sample_text", "is_primary", "is_enabled", "sort_order"
      ) VALUES (
        ${lang.code}, ${lang.name}, ${lang.nativeName}, ${lang.flagEmoji}, ${lang.sampleText}, ${lang.isPrimary}, ${lang.isEnabled}, ${lang.sortOrder}
      )
      ON CONFLICT ("code") DO UPDATE
      SET "name" = EXCLUDED."name",
          "native_name" = EXCLUDED."native_name",
          "flag_emoji" = EXCLUDED."flag_emoji",
          "sample_text" = EXCLUDED."sample_text",
          "is_primary" = EXCLUDED."is_primary",
          "is_enabled" = EXCLUDED."is_enabled",
          "sort_order" = EXCLUDED."sort_order",
          "updated_at" = now();
    `);
  }
  console.log(`  ✅ Successfully seeded ${SYSTEM_LANGUAGES_SEED.length} system languages.`);

  // 3. Seed System Tones (Strictly Categorized by 6 Industries)
  console.log("  🎭 Seeding system tones (Logistics, Healthcare, Financial, Education, HR, eCommerce)...");
  await seedAllTones();

  // 4. Seed AI Voices (All Free Indian Voices with Language & Tone UUIDs)
  console.log("  🎙️ Seeding Indian AI Voices across 5 providers with UUID foreign keys...");
  await seedAllVoices();

  console.log("✨ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
