import { db } from "./index";
import { sql } from "drizzle-orm";

async function clearAll() {
  console.log("=== Deleting all AI Voices, System Tones, and System Languages ===");

  // 1. Delete all rows from ai_voices
  await db.execute(sql`DELETE FROM ai_voices;`);
  console.log("Deleted all rows from ai_voices.");

  // 2. Delete all rows from system_tones
  await db.execute(sql`DELETE FROM system_tones;`);
  console.log("Deleted all rows from system_tones.");

  // 3. Delete all rows from system_languages
  await db.execute(sql`DELETE FROM system_languages;`);
  console.log("Deleted all rows from system_languages.");

  // 4. Verify counts
  const [v] = await db.execute(sql`SELECT count(*) FROM ai_voices;`);
  const [t] = await db.execute(sql`SELECT count(*) FROM system_tones;`);
  const [l] = await db.execute(sql`SELECT count(*) FROM system_languages;`);

  console.log("Current DB Counts:", {
    ai_voices: v.count,
    system_tones: t.count,
    system_languages: l.count,
  });

  console.log("=== All records deleted successfully! ===");
  process.exit(0);
}

clearAll().catch((err) => {
  console.error("Error deleting records:", err);
  process.exit(1);
});
