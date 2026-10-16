import { db } from "./index";
import { sql } from "drizzle-orm";
import { systemTones } from "./schema";

// Natural, balanced acoustics for all 19 tones:
// - audioRate between 0.98 and 1.04 (smooth, clear human pace)
// - audioPitch between 0.99 and 1.01 (clean, crisp, zero muffled heaviness)
const naturalToneAcoustics: Record<string, { audioRate: string; audioPitch: string }> = {
  "logistics-dispatch": { audioRate: "1.04", audioPitch: "1.00" },
  "logistics-support": { audioRate: "1.01", audioPitch: "1.00" },
  "logistics-ndr": { audioRate: "1.03", audioPitch: "1.00" },
  "financial-advisory": { audioRate: "0.98", audioPitch: "0.99" },
  "financial-sales": { audioRate: "1.03", audioPitch: "1.00" },
  "financial-collections": { audioRate: "0.99", audioPitch: "0.99" },
  "financial-kyc": { audioRate: "1.00", audioPitch: "1.00" },
  "healthcare-empathetic": { audioRate: "0.98", audioPitch: "1.00" },
  "healthcare-wellness": { audioRate: "1.00", audioPitch: "1.01" },
  "healthcare-clinic": { audioRate: "0.98", audioPitch: "1.01" },
  "ecommerce-sales": { audioRate: "1.03", audioPitch: "1.01" },
  "ecommerce-care": { audioRate: "1.02", audioPitch: "1.01" },
  "ecommerce-verification": { audioRate: "1.02", audioPitch: "1.00" },
  "education-counselor": { audioRate: "1.00", audioPitch: "1.01" },
  "education-academic": { audioRate: "0.99", audioPitch: "1.00" },
  "education-edtech": { audioRate: "1.01", audioPitch: "1.01" },
  "hr-onboarding": { audioRate: "1.01", audioPitch: "1.01" },
  "hr-screening": { audioRate: "1.01", audioPitch: "1.00" },
  "hr-headhunter": { audioRate: "0.98", audioPitch: "0.99" },
};

async function run() {
  console.log("Updating tone audioRate and audioPitch to natural, crystal-clear acoustics...");

  const existingTones = await db.select().from(systemTones);
  for (const tone of existingTones) {
    const ac = naturalToneAcoustics[tone.key];
    if (ac) {
      await db.execute(sql`
        UPDATE system_tones 
        SET 
          audio_rate = ${ac.audioRate},
          audio_pitch = ${ac.audioPitch},
          updated_at = NOW()
        WHERE id = ${tone.id};
      `);
      console.log(`[TUNED] ${tone.key} -> rate: ${ac.audioRate}, pitch: ${ac.audioPitch}`);
    }
  }

  console.log("All tones tuned to crisp, natural audio levels with zero heaviness!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
