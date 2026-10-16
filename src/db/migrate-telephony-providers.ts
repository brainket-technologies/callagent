import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Creating 'telephony_providers' and 'user_telephony_configs' tables in PostgreSQL...");

  // 1. Create telephony_providers table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "telephony_providers" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "slug" varchar(50) NOT NULL UNIQUE,
      "name" varchar(100) NOT NULL,
      "description" text,
      "logo_url" text,
      "auth_type" varchar(50) NOT NULL DEFAULT 'api_key_and_token',
      "docs_url" text,
      "is_enabled" boolean NOT NULL DEFAULT true,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("  ✅ Table 'telephony_providers' ready");

  // 2. Create user_telephony_configs table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "user_telephony_configs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "provider_slug" varchar(50) NOT NULL,
      "name" varchar(100) NOT NULL,
      "phone_number" varchar(50),
      "api_key" text NOT NULL,
      "auth_token" text NOT NULL,
      "status" varchar(30) NOT NULL DEFAULT 'active',
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("  ✅ Table 'user_telephony_configs' ready");

  // 3. Seed initial telephony provider (Tata Tele)
  const initialCarriers = [
    {
      slug: "tata_tele",
      name: "Tata Tele",
      logo_url: "https://www.tatatelebusiness.com/favicon.ico",
      description: "Enterprise SIP trunking, Smartflo voice gateway, and dedicated telecom trunks.",
      auth_type: "api_key_and_token",
      docs_url: "https://www.tatatelebusiness.com",
      is_enabled: true,
    },
  ];

  for (const c of initialCarriers) {
    await db.execute(sql`
      INSERT INTO "telephony_providers" ("slug", "name", "logo_url", "description", "auth_type", "docs_url", "is_enabled")
      VALUES (${c.slug}, ${c.name}, ${c.logo_url}, ${c.description}, ${c.auth_type}, ${c.docs_url}, ${c.is_enabled})
      ON CONFLICT ("slug") DO UPDATE
      SET "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "logo_url" = EXCLUDED."logo_url",
          "updated_at" = now();
    `);
    console.log(`  🌱 Seeded carrier: ${c.name}`);
  }

  console.log("✨ Telephony providers database migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
