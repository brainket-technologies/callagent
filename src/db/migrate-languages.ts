import { db } from "./index";
import { sql } from "drizzle-orm";

export const SYSTEM_LANGUAGES_SEED = [
  {
    code: "ar-XA",
    name: "Arabic",
    nativeName: "العربية",
    flagEmoji: "🇸🇦",
    sampleText: "مرحباً، أنا ${name}، جاهز لمساعدتك وإدارة اتصالاتك بكل سهولة.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 1,
  },
  {
    code: "bn-IN",
    name: "Bengali",
    nativeName: "বাংলা",
    flagEmoji: "🇮🇳",
    sampleText: "নমস্কার, আমি ${name}, আপনার সমস্ত ব্যবসায়িক কল সহজে পরিচালনা করতে আমি প্রস্তুত.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 2,
  },
  {
    code: "my-MM",
    name: "Burmese (Myanmar)",
    nativeName: "မြန်မာစာ",
    flagEmoji: "🇲🇲",
    sampleText: "မင်္ဂလာပါ၊ ကျွန်ုပ်သည် ${name} ဖြစ်ပြီး သင့်လုပ်ငန်းဆိုင်ရာ ဆက်သွယ်မှုများကို ကူညီဆောင်ရွက်ပေးရန် အသင့်ရှိပါသည်။",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 3,
  },
  {
    code: "nl-NL",
    name: "Dutch",
    nativeName: "Nederlands",
    flagEmoji: "🇳🇱",
    sampleText: "Hallo, ik ben ${name}. Ik sta klaar om uw zakelijke communicatie soepel te laten verlopen.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 4,
  },
  {
    code: "en-IN",
    name: "English (IN)",
    nativeName: "English (India)",
    flagEmoji: "🇮🇳",
    sampleText: "Hello, I am ${name}. I am ready to handle your business communications with ease.",
    isPrimary: true,
    isEnabled: true,
    sortOrder: 5,
  },
  {
    code: "en-GB",
    name: "English (UK)",
    nativeName: "English (UK)",
    flagEmoji: "🇬🇧",
    sampleText: "Hello, I am ${name}. How may I assist you with your business queries today?",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 6,
  },
  {
    code: "en-US",
    name: "English (US)",
    nativeName: "English (US)",
    flagEmoji: "🇺🇸",
    sampleText: "Hello, I am ${name}. How may I help you today?",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 7,
  },
  {
    code: "fr-FR",
    name: "French",
    nativeName: "Français",
    flagEmoji: "🇫🇷",
    sampleText: "Bonjour, je suis ${name}. Je suis à votre disposition pour gérer vos communications avec efficacité.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 8,
  },
  {
    code: "de-DE",
    name: "German",
    nativeName: "Deutsch",
    flagEmoji: "🇩🇪",
    sampleText: "Guten Tag, ich bin ${name}. Ich unterstütze Sie gerne bei Ihrer geschäftlichen Kommunikation.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 9,
  },
  {
    code: "gu-IN",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    flagEmoji: "🇮🇳",
    sampleText: "નમસ્તે, હું ${name} છું, તમારા વ્યવસાયિક કોલ્સ સરળતાથી સંભાળવા માટે હું તૈયાર છું.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 10,
  },
  {
    code: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी",
    flagEmoji: "🇮🇳",
    sampleText: "नमस्ते, मैं ${name} हूँ, आपकी सभी व्यावसायिक कॉल्स को आसानी से संभालने के लिए मैं तैयार हूँ.",
    isPrimary: true,
    isEnabled: true,
    sortOrder: 11,
  },
  {
    code: "id-ID",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flagEmoji: "🇮🇩",
    sampleText: "Halo, saya ${name}. Saya siap membantu komunikasi bisnis Anda dengan mudah dan lancar.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 12,
  },
  {
    code: "it-IT",
    name: "Italian",
    nativeName: "Italiano",
    flagEmoji: "🇮🇹",
    sampleText: "Buongiorno, sono ${name}. Sono pronto a gestire le vostre comunicazioni aziendali con facilità.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 13,
  },
  {
    code: "kn-IN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flagEmoji: "🇮🇳",
    sampleText: "ನಮಸ್ಕಾರ, ನಾನು ${name}, ನಿಮ್ಮ ಎಲ್ಲಾ ವ್ಯಾಪಾರ ಕರೆಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿಭಾಯಿಸಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 14,
  },
  {
    code: "ms-MY",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    flagEmoji: "🇲🇾",
    sampleText: "Salam, saya ${name}. Saya bersedia untuk membantu menguruskan komunikasi perniagaan anda dengan mudah.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 15,
  },
  {
    code: "ml-IN",
    name: "Malayalam",
    nativeName: "മലയാളം",
    flagEmoji: "🇮🇳",
    sampleText: "നമസ്കാരം, ഞാൻ ${name}, നിങ്ങളുടെ എല്ലാ ബിസിനസ്സ് കോളുകളും എളുപ്പത്തിൽ കൈകാര്യം ചെയ്യാൻ ഞാൻ തയ്യാറാണ്.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 16,
  },
  {
    code: "zh-CN",
    name: "Mandarin (Simplified Chinese)",
    nativeName: "中文 (简体)",
    flagEmoji: "🇨🇳",
    sampleText: "您好，我是 ${name}，很高兴为您处理各类业务通话与咨询。",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 17,
  },
  {
    code: "mr-IN",
    name: "Marathi",
    nativeName: "मराठी",
    flagEmoji: "🇮🇳",
    sampleText: "नमस्कार, मी ${name} आहे, तुमच्या सर्व व्यावसायिक कॉल्स सहज हाताळण्यासाठी मी तयार आहे.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 18,
  },
  {
    code: "or-IN",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    flagEmoji: "🇮🇳",
    sampleText: "ନମସ୍କାର, ମୁଁ ${name}, ଆପଣଙ୍କର ବ୍ୟବସାୟିକ କଲ୍ ପରିଚାଳନା କରିବାକୁ ମୁଁ ପ୍ରସ୍ତୁତ.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 19,
  },
  {
    code: "pa-IN",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    flagEmoji: "🇮🇳",
    sampleText: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ${name} ਹਾਂ, ਤੁਹਾਡੀਆਂ ਸਾਰੀਆਂ ਕਾਰੋਬਾਰੀ ਕਾਲਾਂ ਆਸਾਨੀ ਨਾਲ ਸੰਭਾਲਣ ਲਈ ਮੈਂ ਤਿਆਰ ਹਾਂ.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 20,
  },
  {
    code: "ru-RU",
    name: "Russian",
    nativeName: "Русский",
    flagEmoji: "🇷🇺",
    sampleText: "Здравствуйте, меня зовут ${name}. Я готов помочь в обработке ваших деловых коммуникаций.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 21,
  },
  {
    code: "es-ES",
    name: "Spanish",
    nativeName: "Español",
    flagEmoji: "🇪🇸",
    sampleText: "Hola, soy ${name}. Estoy listo para gestionar sus comunicaciones empresariales con total facilidad.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 22,
  },
  {
    code: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
    flagEmoji: "🇮🇳",
    sampleText: "வணக்கம், நான் ${name}, உங்கள் அனைத்து வணிக அழைப்புகளையும் எளிதாக கையாள நான் தயாராக உள்ளேன்.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 23,
  },
  {
    code: "te-IN",
    name: "Telugu",
    nativeName: "తెలుగు",
    flagEmoji: "🇮🇳",
    sampleText: "నమస్కారం, నేను ${name}, మీ అన్ని వ్యాపార కాల్స్‌ను సులభంగా నిర్వహించడానికి నేను సిద్ధంగా ఉన్నాను.",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 24,
  },
];

export async function seedAllLanguages() {
  console.log("🚀 Creating / Migrating 'system_languages' table in PostgreSQL...");

  // 1. Ensure system_languages table exists with sample_text
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "system_languages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "code" varchar(20) NOT NULL UNIQUE,
      "name" varchar(100) NOT NULL,
      "native_name" varchar(100),
      "flag_emoji" varchar(20) DEFAULT '🇮🇳',
      "sample_text" text,
      "is_primary" boolean NOT NULL DEFAULT false,
      "is_enabled" boolean NOT NULL DEFAULT true,
      "sort_order" integer DEFAULT 0,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("  ✅ Table 'system_languages' verified");

  // 2. Insert or update all 24 languages
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
    console.log(`  🌱 Seeded language: [${lang.code}] ${lang.flagEmoji} ${lang.name} (${lang.nativeName})`);
  }

  console.log("✨ All 24 system languages seeded successfully!");
}

if (process.argv[1]?.endsWith("migrate-languages.ts")) {
  seedAllLanguages()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}
