import { db } from "./index";
import { sql } from "drizzle-orm";

async function migrateLanguageSampleText() {
  console.log("=== Starting Language Sample Text Migration ===");

  // 1. Add sample_text column to system_languages if not exists
  await db.execute(sql`
    ALTER TABLE system_languages 
    ADD COLUMN IF NOT EXISTS sample_text TEXT;
  `);
  console.log("Added column sample_text to system_languages");

  // 2. Populate dynamic sample text for all 12 languages
  const sampleTexts: Record<string, string> = {
    "hi-IN": "नमस्ते, मैं ${name} हूँ, आपकी सभी व्यावसायिक कॉल्स को आसानी से संभालने के लिए मैं तैयार हूँ",
    "en-IN": "Hello, I am ${name}. I am ready to handle your business communications with ease.",
    "en-US": "Hello, I am ${name}. How may I help you today?",
    "mr-IN": "नमस्कार, मी ${name} आहे, तुमच्या सर्व व्यावसायिक कॉल्स सहज हाताळण्यासाठी मी तयार आहे",
    "gu-IN": "નમસ્તે, હું ${name} છું, તમારા વ્યવસાયિક કોલ્સ સરળતાથી સંભાળવા માટે હું તૈયાર છું",
    "bn-IN": "নমস্কার, আমি ${name}, আপনার সমস্ত ব্যবসায়িক কল সহজে পরিচালনা করতে আমি প্রস্তুত",
    "ta-IN": "வணக்கம், நான் ${name}, உங்கள் அனைத்து வணிக அழைப்புகளையும் எளிதாக கையாள நான் தயாராக உள்ளேன்",
    "te-IN": "నమస్కారం, నేను ${name}, మీ అన్ని వ్యాపార కాల్స్‌ను సులభంగా నిర్వహించడానికి నేను సిద్ధంగా ఉన్నాను",
    "kn-IN": "ನಮಸ್ಕಾರ, ನಾನು ${name}, ನಿಮ್ಮ ಎಲ್ಲಾ ವ್ಯಾಪಾರ ಕರೆಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿಭಾಯಿಸಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ",
    "ml-IN": "നമസ്കാരം, ഞാൻ ${name}, നിങ്ങളുടെ എല്ലാ ബിസിനസ്സ് കോളുകളും എളുപ്പത്തിൽ കൈകാര്യം ചെയ്യാൻ ഞാൻ തയ്യാറാണ്",
    "pa-IN": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ${name} ਹਾਂ, ਤੁਹਾਡੀਆਂ ਸਾਰੀਆਂ ਕਾਰੋਬਾਰੀ ਕਾਲਾਂ ਆਸਾਨੀ ਨਾਲ ਸੰਭਾਲਣ ਲਈ ਮੈਂ ਤਿਆਰ ਹਾਂ",
    "ur-IN": "السلام علیکم، میں ${name} ہوں، آپ کی تمام کاروباری کالز آسانی سے سنبھالنے کے لیے تیار ہوں",
  };

  for (const [code, text] of Object.entries(sampleTexts)) {
    await db.execute(sql`
      UPDATE system_languages
      SET sample_text = ${text},
          updated_at = NOW()
      WHERE code = ${code};
    `);
    console.log(`Updated sample_text for ${code}`);
  }

  // 3. Verify
  const rows = await db.execute(sql`
    SELECT code, name, sample_text FROM system_languages ORDER BY sort_order ASC;
  `);
  console.log("Sample texts in DB:", rows);

  console.log("=== Migration Complete ===");
  process.exit(0);
}

migrateLanguageSampleText().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
