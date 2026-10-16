import { db } from "./index";
import { sql } from "drizzle-orm";
import { tools } from "./schema";

async function main() {
  console.log("🚀 Creating separate 'tools' table in PostgreSQL...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "tools" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "slug" varchar(50) NOT NULL UNIQUE,
      "name" varchar(100) NOT NULL,
      "description" text,
      "icon" text,
      "is_enabled" boolean NOT NULL DEFAULT true,
      "config_key" text DEFAULT '',
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("  ✅ Table 'tools' created / verified");

  const initialTools = [
    {
      slug: "cal_com",
      name: "Cal.com",
      description: "Open-source scheduling infrastructure",
      icon: "https://cal.com/favicon.ico",
      isEnabled: true,
      configKey: "cal_live_90812389102",
    },
    {
      slug: "calendly",
      name: "Calendly",
      description: "Booking & scheduling automation",
      icon: "https://assets.calendly.com/assets/authentication/media/favicon.ico",
      isEnabled: true,
      configKey: "cal_token_8192381",
    },
    {
      slug: "google_calendar",
      name: "Google Calendar",
      description: "Calendar events and scheduling",
      icon: "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
      isEnabled: true,
      configKey: "gcal_oauth_98123.apps.googleusercontent.com",
    },
    {
      slug: "google_sheets",
      name: "Google Sheets",
      description: "Spreadsheet data logging",
      icon: "https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico",
      isEnabled: true,
      configKey: "sheet_id_819203810293",
    },
    {
      slug: "slack",
      name: "Slack",
      description: "Send messages and alerts to your Slack channels",
      icon: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png",
      isEnabled: false,
      configKey: "",
    },
    {
      slug: "whatsapp_business",
      name: "WhatsApp Business",
      description: "Reach customers on WhatsApp. Send approved templates or free..",
      icon: "https://static.whatsapp.net/rsrc.php/v3/yP/r/rNqzzdltrash.png",
      isEnabled: true,
      configKey: "waba_id_81923891023",
    },
  ];

  for (const t of initialTools) {
    await db.execute(sql`
      INSERT INTO "tools" ("slug", "name", "description", "icon", "is_enabled", "config_key", "updated_at")
      VALUES (${t.slug}, ${t.name}, ${t.description}, ${t.icon}, ${t.isEnabled}, ${t.configKey}, now())
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED.name,
        "description" = EXCLUDED.description,
        "icon" = EXCLUDED.icon;
    `);
    console.log(`  🌱 Tool '${t.name}' seeded/updated`);
  }

  console.log("✨ Dedicated 'tools' table migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
