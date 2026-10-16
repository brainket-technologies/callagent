import { db } from "./index";
import { sql } from "drizzle-orm";
import { systemSettings } from "./schema";

async function main() {
  console.log("🚀 Migrating to single 'system_settings' table...");

  // 1. Drop temporary separated tables if they exist
  await db.execute(sql`DROP TABLE IF EXISTS "mail_configs" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "firebase_configs" CASCADE;`);
  console.log("  🧹 Dropped separate tables (mail_configs, firebase_configs)");

  // 2. Create single unified system_settings table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "system_settings" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "key" varchar(100) NOT NULL UNIQUE,
      "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("  ✅ Single unified table 'system_settings' created / verified");

  // 3. Upsert 'mail' settings record
  await db.execute(sql`
    INSERT INTO "system_settings" ("key", "data", "updated_at")
    VALUES (
      'mail',
      '{
        "smtpHost": "smtp.sendgrid.net",
        "smtpPort": "587",
        "smtpUser": "apikey",
        "smtpPass": "••••••••••••••••••••",
        "fromEmail": "notifications@voxera.ai",
        "fromName": "Voxera AI Cloud"
      }'::jsonb,
      now()
    )
    ON CONFLICT ("key") DO NOTHING;
  `);
  console.log("  🌱 Seeded 'mail' settings into system_settings");

  // 4. Upsert 'firebase' settings record
  await db.execute(sql`
    INSERT INTO "system_settings" ("key", "data", "updated_at")
    VALUES (
      'firebase',
      '{
        "projectId": "voxera-voice-telephony-prod",
        "apiKey": "•••••••••••••••••••••••••••••",
        "fcmKey": "•••••••••••••••••••••••••••••",
        "storageBucket": "voxera-voice-telephony-prod.appspot.com",
        "serviceAccountJson": "{\\n  \\"type\\": \\"service_account\\",\\n  \\"project_id\\": \\"voxera-voice-telephony-prod\\",\\n  \\"private_key_id\\": \\"•••••••••••••••••••••••••••••\\",\\n  \\"client_email\\": \\"firebase-adminsdk@voxera-voice-telephony-prod.iam.gserviceaccount.com\\"\\n}"
      }'::jsonb,
      now()
    )
    ON CONFLICT ("key") DO NOTHING;
  `);
  console.log("  🌱 Seeded 'firebase' settings into system_settings");

  // Clean up any old migration file
  console.log("✨ Single table migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
