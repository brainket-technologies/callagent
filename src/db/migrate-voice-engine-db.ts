import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Starting Voice Engine Database Migration...");

  // 1. Add audio_rate and audio_pitch columns to system_tones
  await db.execute(sql`
    ALTER TABLE "system_tones" ADD COLUMN IF NOT EXISTS "audio_rate" varchar(20) DEFAULT '1.00';
    ALTER TABLE "system_tones" ADD COLUMN IF NOT EXISTS "audio_pitch" varchar(20) DEFAULT '1.00';
  `);
  console.log("  ✅ Added audio_rate and audio_pitch columns to system_tones");

  // 2. Calibrate all 20 System Tones in DB
  const toneCalibrations: Record<string, { rate: string; pitch: string }> = {
    professional: { rate: "1.00", pitch: "1.00" },
    friendly: { rate: "1.04", pitch: "1.02" },
    empathetic: { rate: "0.92", pitch: "0.99" },
    urgent: { rate: "1.14", pitch: "1.02" },
    persuasive: { rate: "1.06", pitch: "1.02" },
    casual: { rate: "1.02", pitch: "1.00" },
    calm: { rate: "0.88", pitch: "0.98" },
    authoritative: { rate: "0.94", pitch: "0.98" },
    enthusiastic: { rate: "1.10", pitch: "1.03" },
    direct: { rate: "1.08", pitch: "1.00" },
    sympathetic: { rate: "0.90", pitch: "0.99" },
    humorous: { rate: "1.06", pitch: "1.02" },
    formal: { rate: "0.95", pitch: "0.99" },
    playful: { rate: "1.08", pitch: "1.03" },
    inspirational: { rate: "1.04", pitch: "1.02" },
    luxury: { rate: "0.90", pitch: "0.98" },
    patient: { rate: "0.88", pitch: "0.98" },
    cheerful: { rate: "1.06", pitch: "1.03" },
    assertive: { rate: "1.02", pitch: "0.98" },
    inquisitive: { rate: "1.02", pitch: "1.02" },
  };

  for (const [key, profile] of Object.entries(toneCalibrations)) {
    await db.execute(sql`
      UPDATE "system_tones"
      SET "audio_rate" = ${profile.rate},
          "audio_pitch" = ${profile.pitch},
          "updated_at" = now()
      WHERE "key" = ${key};
    `);
    console.log(`  🎵 Updated tone audio profile in DB: [${key}] rate=${profile.rate} pitch=${profile.pitch}`);
  }

  // 3. Seed Voice Engine Configuration in system_settings
  const indicVoiceNames = {
    nova: { hi: "नोवा", mr: "नोव्हा", gu: "નોવા", bn: "নোভা", ta: "நோவா", te: "నోవా", kn: "ನೋವಾ" },
    shimmer: { hi: "शिमर", mr: "शिमर", gu: "શિમર", bn: "শিমার", ta: "ஷிம்மர்", te: "షిమ్మర్", kn: "ಶಿಮ್ಮರ್" },
    fable: { hi: "फेबल", mr: "फेबल", gu: "ફેબલ", bn: "ফেবল", ta: "ஃபேபிள்", te: "ఫేబుల్", kn: "ಫೇಬಲ್" },
    alloy: { hi: "अलॉय", mr: "अ‍ॅलॉय", gu: "એલોય", bn: "অ্যালয়", ta: "அலாய்", te: "అల్లాయ్", kn: "ಅಲಾಯ್" },
    echo: { hi: "इको", mr: "इको", gu: "ઇકો", bn: "ইকো", ta: "எக்கோ", te: "ఎకో", kn: "ಎಕೋ" },
    onyx: { hi: "ऑनिक्स", mr: "ऑक्सिस", gu: "ઓનિક્સ", bn: "অনিক্স", ta: "ஆனிக்ஸ்", te: "ఆనిక్స్", kn: "ಆನಿಕ್ಸ್" },
    coral: { hi: "कोरल", mr: "कोरल", gu: "કોરલ", bn: "কোরাল", ta: "கோரல்", te: "కోరల్", kn: "ಕೋರಲ್" },
    sage: { hi: "सेज", mr: "सेज", gu: "સેજ", bn: "সেজ", ta: "சேஜ்", te: "సేజ్", kn: "ಸೇಜ್" },
    verse: { hi: "वर्स", mr: "वर्स", gu: "વર્સ", bn: "ভার্স", ta: "வெர்ஸ்", te: "వెర్స్", kn: "ವರ್ಸ್" },
    aditi: { hi: "अदिति", mr: "अदिती", gu: "અદિતિ", bn: "অদিতি", ta: "அதிதி", te: "అదితి", kn: "ಅದಿತಿ" },
    shreya: { hi: "श्रेया", mr: "श्रेया", gu: "શ્રેયા", bn: "শ্রেয়া", ta: "ஷ்ரேயா", te: "శ్రేయ", kn: "ಶ್ರೇಯಾ" },
    sagar: { hi: "सागर", mr: "सागर", gu: "સાગર", bn: "সাগর", ta: "சாகர்", te: "సాగర్", kn: "ಸಾಗರ್" },
    arvind: { hi: "अरविंद", mr: "अरविंद", gu: "અરવિંદ", bn: "অরবিন্দ", ta: "அரவிந்த்", te: "అరవింద్", kn: "ಅರವಿಂದ್" },
    kavya: { hi: "काव्या", mr: "काव्या", gu: "કાવ્યા", bn: "কাব্য", ta: "காவ்யா", te: "కావ్య", kn: "ಕಾವ್ಯಾ" },
    sanya: { hi: "सान्या", mr: "सान्या", gu: "સાન્યા", bn: "সানিয়া", ta: "சான்யா", te: "సాన్యా", kn: "ಸಾನ್ಯಾ" },
    vikram: { hi: "विक्रम", mr: "विक्रम", gu: "વિક્રમ", bn: "বিক্রম", ta: "விக்ரம்", te: "విక్రమ్", kn: "ವಿಕ್ರಮ್" },
    rahul: { hi: "राहुल", mr: "राहुल", gu: "રાહુલ", bn: "রাহুল", ta: "ராகுல்", te: "రాహుల్", kn: "ರಾಹುಲ್" },
    riya: { hi: "रिया", mr: "रिया", gu: "રિયા", bn: "রিয়া", ta: "ரியா", te: "రియా", kn: "ರಿಯಾ" },
    vishakha: { hi: "विशाखा", mr: "विशाखा", gu: "વિશાખા", bn: "বিশাখা", ta: "விசாகா", te: "విశాఖ", kn: "ವಿಶಾಖಾ" },
    ananya: { hi: "अनन्या", mr: "अनन्या", gu: "અનન્યા", bn: "অনন্যা", ta: "அனன்யா", te: "అనన్య", kn: "ಅನನ್ಯಾ" },
    rohan: { hi: "रोहन", mr: "रोहन", gu: "રોહન", bn: "রোহন", ta: "ரோஹன்", te: "రోహన్", kn: "ರೋಹನ್" },
    pooja: { hi: "पूजा", mr: "पूजा", gu: "પૂજા", bn: "পূজা", ta: "பூஜா", te: "పూజా", kn: "ಪೂಜಾ" },
    rachel: { hi: "रेचल", mr: "रेचल", gu: "રેચલ", bn: "রেচেল", ta: "ரேச்சல்", te: "రేచల్", kn: "ರೇಚಲ್" },
    kabir: { hi: "कबीर", mr: "कबीर", gu: "કબીર", bn: "কবীর", ta: "கபீர்", te: "கబీர்", kn: "ಕಬೀರ್" },
    adam: { hi: "एडम", mr: "अ‍ॅडम", gu: "એડમ", bn: "অ্যাডাম", ta: "ஆடம்", te: "ఆడమ్", kn: "ಆಡಮ್" },
    antoni: { hi: "अंटोनी", mr: "अँटोनी", gu: "એન્ટોની", bn: "অ্যান্টনি", ta: "அந்தோணி", te: "ఆంటோनि", kn: "ಆಂಟೋನಿ" },
    bella: { hi: "बेला", mr: "बेला", gu: "બેલા", bn: "বেলা", ta: "பெல்லா", te: "బెల్లా", kn: "ಬೆಲ್ಲಾ" },
    domi: { hi: "डोमी", mr: "डोमी", gu: "ડોમી", bn: "ডোমি", ta: "டோமி", te: "డోమి", kn: "ಡೋಮಿ" },
    elli: { hi: "एली", mr: "एली", gu: "એલી", bn: "এলি", ta: "எல்லி", te: "ఎల్లి", kn: "ಎಲ್ಲಿ" },
    josh: { hi: "जॉश", mr: "जॉश", gu: "જોશ", bn: "জোশ", ta: "ஜோஷ்", te: "జోష్", kn: "ಜೋಶ್" },
    dhruv: { hi: "ध्रुव", mr: "ध्रुव", gu: "ધ્રુવ", bn: "ধ্রুব", ta: "துருவ்", te: "ధ్రువ్", kn: "ಧ್ರುವ್" },
    priya: { hi: "प्रिया", mr: "प्रिया", gu: "પ્રિયા", bn: "প্রিয়া", ta: "பிரியா", te: "ప్రియా", kn: "ಪ್ರಿಯಾ" },
    tara: { hi: "तारा", mr: "तारा", gu: "તારા", bn: "তারা", ta: "தாரா", te: "తార", kn: "ತಾರಾ" },
    arjun: { hi: "अर्जुन", mr: "अर्जुन", gu: "અર્જુન", bn: "অর্জুন", ta: "அர்ஜுன்", te: "అర్జున్", kn: "ಅರ್ಜುನ್" },
    dev: { hi: "देव", mr: "देव", gu: "દેવ", bn: "দেব", ta: "தேவ்", te: "దేవ్", kn: "ದೇವ್" },
    ishaan: { hi: "ईशान", mr: "ईशान", gu: "ઈશાન", bn: "ঈশান", ta: "இஷான்", te: "ఇషాన్", kn: "ಇಶಾನ್" },
    aanya: { hi: "आन्या", mr: "आन्या", gu: "આન્યા", bn: "আনিয়া", ta: "ஆனியா", te: "ఆన్యా", kn: "ಆನ್ಯಾ" },
    charlotte: { hi: "शार्लोट", mr: "शार्लोट", gu: "શાર્લોટ", bn: "শার্লট", ta: "சார்லோட்", te: "షార్లెట్", kn: "ಶಾರ್ಲೆಟ್" },
    callum: { hi: "कैलम", mr: "कॅलम", gu: "કેલમ", bn: "ক্যালুম", ta: "காலம்", te: "కాలమ్", kn: "ಕ್ಯಾಲಮ್" },
    freya: { hi: "फ्रेया", mr: "फ्रेया", gu: "ફ્રેયા", bn: "ফ্রেয়া", ta: "ஃப்ரேயா", te: "ఫ్రెయా", kn: "ಫ್ರೇಯಾ" },
    liam: { hi: "लियाम", mr: "लियाम", gu: "લિયામ", bn: "লিয়াম", ta: "லியாம்", te: "లియామ్", kn: "ಲಿಯಾಮ್" },
    charlie: { hi: "चार्ली", mr: "चार्ली", gu: "ચાર્લી", bn: "চার্লি", ta: "சார்லி", te: "చార్లీ", kn: "ಚಾರ್ಲಿ" },
    suman: { hi: "सुमन", mr: "सुमन", gu: "સુમન", bn: "সুমন", ta: "சுமன்", te: "సుమన్", kn: "ಸುಮನ್" },
    rohit: { hi: "रोहित", mr: "रोहित", gu: "રોહિત", bn: "রোহিত", ta: "ரோஹித்", te: "రోహిత్", kn: "ರೋಹಿತ್" },
    meera: { hi: "मीरा", mr: "मीरा", gu: "મીરા", bn: "মীরা", ta: "மீரா", te: "మీరా", kn: "ಮೀರಾ" },
    neha: { hi: "नेहा", mr: "नेहा", gu: "નેહા", bn: "नेहा", ta: "நேஹா", te: "నేహా", kn: "ನೇಹಾ" },
    anand: { hi: "आनंद", mr: "आनंद", gu: "આનંદ", bn: "আনন্দ", ta: "ஆனந்த்", te: "ఆనంద్", kn: "ಆನಂದ್" },
  };

  const noveltyVoices = [
    "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
    "deranged", "good news", "hysterical", "pipe organ", "organ", "trinoids",
    "whisper", "zarvox", "junior", "fred", "ralph", "princess", "grandma",
    "grandpa", "jester", "wobble", "superstar", "sinji", "tink", "xander", "kathy"
  ];

  const femaleVoices = [
    "samantha", "victoria", "google uk english female", "google us english female",
    "karen", "tara", "flo", "sandy", "shelley", "lekha", "veena", "sangeeta",
    "zira", "heera", "swara", "ava", "allison", "susan", "serena", "zoe", "siri",
    "moira", "tessa", "fiona", "agnes", "hazel", "kanya", "kyoko", "laura", "lesya",
    "linh", "luciana", "melina", "milena", "monica", "mónica", "nora", "paulina",
    "piya", "satu", "tina", "tingting", "yelda", "yuna", "zosia", "zuzana",
    "vani", "kalpana", "female", "woman", "girl"
  ];

  const maleVoices = [
    "google us english", "google uk english male", "reed", "eddy", "rocko",
    "alex", "daniel", "rishi", "aman", "david", "oliver", "george", "arthur",
    "evan", "nathan", "tom", "guy", "jacques", "thomas", "male", "man", "boy",
    "hemant", "madhur", "ravi"
  ];

  const voiceEngineConfigData = {
    indicVoiceNames,
    noveltyVoices,
    femaleVoices,
    maleVoices,
    toneAudioProfiles: toneCalibrations,
    updatedAt: new Date().toISOString(),
  };

  await db.execute(sql`
    INSERT INTO "system_settings" ("key", "data", "updated_at")
    VALUES ('voice_engine_config', ${JSON.stringify(voiceEngineConfigData)}::jsonb, now())
    ON CONFLICT ("key") DO UPDATE
    SET "data" = EXCLUDED."data",
        "updated_at" = now();
  `);
  console.log("  📦 Seeded 'voice_engine_config' into system_settings table");

  console.log("✨ Voice Engine Database Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
