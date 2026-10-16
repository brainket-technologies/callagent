import { db } from "./index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Applying database migration for system_tones sample_text columns...");

  // 1. Add columns to system_tones
  await db.execute(sql`
    ALTER TABLE system_tones 
    ADD COLUMN IF NOT EXISTS sample_text TEXT,
    ADD COLUMN IF NOT EXISTS sample_text_en TEXT;
  `);

  console.log("Columns added successfully!");

  // 2. Define authentic industry scripts, speed (rate) and pitch for all 19 tones
  const toneUpdates: Array<{
    key: string;
    sampleText: string;
    sampleTextEn: string;
    audioRate: string;
    audioPitch: string;
  }> = [
    {
      key: "logistics-dispatch",
      sampleText: "नमस्ते! मैं ${name} बोल रहा हूँ, लॉजिस्टिक्स डिस्पैच से। आपके पार्सल का लाइव डिस्पैच और डिलीवरी रूट कन्फर्म करने के लिए मैंने कॉल किया है।",
      sampleTextEn: "Hello! This is ${name} from Logistics Dispatch. I'm calling with a live update regarding your shipment transit and delivery schedule.",
      audioRate: "1.08",
      audioPitch: "0.94",
    },
    {
      key: "logistics-ndr",
      sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ। आपके पेंडिंग पार्सल का डिलीवरी अड्रेस कन्फर्म करने और तुरंत री-डिलीवरी टाइम स्लॉट बुक करने के लिए मैंने संपर्क किया है।",
      sampleTextEn: "Hello, this is ${name}. I am calling regarding your pending package to confirm your delivery address and schedule an immediate re-delivery.",
      audioRate: "1.08",
      audioPitch: "0.98",
    },
    {
      key: "logistics-support",
      sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, पार्सल ट्रैकिंग सपोर्ट से। आपके शिपमेंट का रियल-टाइम स्टेटस और लोकेशन बताने के लिए मैं उपस्थित हूँ।",
      sampleTextEn: "Hello, this is ${name} from Delivery Support. I am here to help track your live shipment status and resolve transit queries.",
      audioRate: "1.03",
      audioPitch: "0.94",
    },
    {
      key: "financial-advisory",
      sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, वेल्थ एडवाइजरी टीम से। आपके पोर्टफोलियो रिटर्न और सुरक्षित फाइनेंशियल प्लानिंग में सहायता के लिए मैं उपस्थित हूँ।",
      sampleTextEn: "Hello, this is ${name} from Wealth Advisory. I am here to assist you with portfolio optimization and strategic financial planning.",
      audioRate: "0.92",
      audioPitch: "0.88",
    },
    {
      key: "financial-collections",
      sampleText: "नमस्ते, मैं ${name} बात कर रही हूँ। आपकी आगामी ईएमआई ड्यू डेट और आसान ऑनलाइन पेमेंट ऑप्शन्स के बारे में आपको सूचित करने के लिए कॉल किया है।",
      sampleTextEn: "Hello, this is ${name} with a courteous reminder regarding your upcoming EMI installment and secure instant payment confirmation.",
      audioRate: "0.96",
      audioPitch: "0.96",
    },
    {
      key: "financial-sales",
      sampleText: "नमस्ते, मैं ${name} बात कर रहा हूँ। आपके प्री-अप्रूव्ड बिज़नेस लोन और सबसे कम ब्याज दर के ऑफर्स शेयर करने के लिए मैंने कॉल किया है।",
      sampleTextEn: "Hello! This is ${name}. I'm reaching out with exciting details regarding your pre-approved credit line and low-interest loan options.",
      audioRate: "1.10",
      audioPitch: "1.00",
    },
    {
      key: "financial-kyc",
      sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, बैंकिंग सिक्योरिटी डेस्क से। आपके बैंक खाते के त्वरित और सुरक्षित डिजिटल केवाईसी सत्यापन के लिए यह कॉल है।",
      sampleTextEn: "Hello, this is ${name} from Banking Security. I am assisting you with confidential account verification and seamless digital KYC completion.",
      audioRate: "0.97",
      audioPitch: "0.92",
    },
    {
      key: "healthcare-empathetic",
      sampleText: "नमस्ते, मैं ${name} बात कर रही हूँ, केयर टीम से। आपकी सेहत, दवाईयों के समय और नियमित फॉलो-अप का ध्यान रखने के लिए मैंने संपर्क किया है।",
      sampleTextEn: "Hello, this is ${name} from Patient Care. I am following up gently on your recovery, health checkup, and prescription schedule today.",
      audioRate: "0.90",
      audioPitch: "0.98",
    },
    {
      key: "healthcare-clinic",
      sampleText: "नमस्ते, मैं ${name} बोल रही हूँ, क्लिनिक रिसेप्शन से। डॉक्टर कंसल्टेशन, अपॉइंटमेंट शेड्यूलिंग और लैब रिपोर्ट्स की जानकारी के लिए मैं उपलब्ध हूँ।",
      sampleTextEn: "Hello, I am ${name} from Clinic Care. I'm here to assist you with doctor appointments, consultation schedules, and medical reports.",
      audioRate: "0.92",
      audioPitch: "1.04",
    },
    {
      key: "healthcare-wellness",
      sampleText: "नमस्ते, मैं ${name} बात कर रही हूँ, वेलनेस एडवाइजरी से। आपकी डाइट, लाइफस्टाइल और प्रिवेंटिव हेल्थ चेकअप्स के बारे में चर्चा करने के लिए मैं उपस्थित हूँ।",
      sampleTextEn: "Hello, this is ${name} from Wellness Care. I am delighted to support your holistic lifestyle goals, nutrition plans, and regular preventive checkups.",
      audioRate: "0.95",
      audioPitch: "1.02",
    },
    {
      key: "ecommerce-care",
      sampleText: "नमस्ते! मैं ${name} हूँ, कस्टमर केयर से! आपके ऑर्डर, रिटर्न पिकअप और त्वरित रिफंड से जुड़ी सहायता के लिए मैं हमेशा तैयार हूँ।",
      sampleTextEn: "Hi there! I am ${name} from Customer Care. How may I assist you with your recent order, refund, or exchange today?",
      audioRate: "1.06",
      audioPitch: "1.08",
    },
    {
      key: "ecommerce-sales",
      sampleText: "नमस्ते! मैं ${name} बोल रहा हूँ। आपके ऑनलाइन कैश-ऑन-डिलीवरी ऑर्डर को तुरंत कन्फर्म करने और शिपमेंट प्रोसेस शुरू करने के लिए कॉल किया है।",
      sampleTextEn: "Hello, this is ${name}. I am calling to quickly confirm your Cash-on-Delivery order and initiate expedited dispatch.",
      audioRate: "1.06",
      audioPitch: "0.96",
    },
    {
      key: "education-counselor",
      sampleText: "नमस्ते! मैं ${name} बोल रही हूँ, करियर और एडमिशन काउंसलिंग से। आपके पसंदीदा कोर्सेज और यूनिवर्सिटी एडमिशन में गाइड करने के लिए मैं तैयार हूँ।",
      sampleTextEn: "Hello, I am ${name} from Admissions Counseling. I am excited to help you explore career roadmaps and university degree programs.",
      audioRate: "0.98",
      audioPitch: "1.04",
    },
    {
      key: "education-academic",
      sampleText: "नमस्ते, मैं ${name} बोल रही हूँ। आपकी स्किल अपग्रेड और प्रोफेशनल सर्टिफिकेशन प्रोग्राम्स की जानकारी देने के लिए मैंने संपर्क किया है।",
      sampleTextEn: "Hello, this is ${name} from the Academic Desk. I am here to help you select the ideal certification curriculum for your career milestones.",
      audioRate: "0.97",
      audioPitch: "1.00",
    },
    {
      key: "hr-recruitment",
      sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, लीडरशिप रिक्रूटमेंट से। आपकी प्रोफाइल के लिए एक एक्सक्लूसिव एग्जीक्यूटिव करियर अवसर पर चर्चा करने के लिए संपर्क किया है।",
      sampleTextEn: "Hello, this is ${name} from Executive Talent Acquisition. I am reaching out regarding a distinguished senior leadership opportunity.",
      audioRate: "0.94",
      audioPitch: "0.88",
    },
    {
      key: "hr-onboarding",
      sampleText: "नमस्ते! मैं ${name} हूँ, पीपुल ऑपरेशन्स टीम से। कंपनी में आपके पहले दिन के ओरिएंटेशन और आवश्यक डॉक्यूमेंट्स के लिए मैं आपकी सहायता करूँगी।",
      sampleTextEn: "Welcome aboard! I am ${name} from People Operations. I am here to guide you through your first day onboarding and workspace orientation.",
      audioRate: "1.02",
      audioPitch: "1.04",
    },
    {
      key: "b2b-sales",
      sampleText: "नमस्ते, मैं ${name} बात कर रहा हूँ। आपकी कंपनी के ऑपरेशन्स को ऑटोमेट करने और रेवेन्यू बढ़ाने के लिए हमारे एंटरप्राइज सॉल्यूशन्स पर चर्चा करना चाहता हूँ।",
      sampleTextEn: "Hello, this is ${name}. I am reaching out to discuss how our enterprise AI platform can streamline your business workflows and accelerate revenue.",
      audioRate: "1.02",
      audioPitch: "0.92",
    },
    {
      key: "executive-assistant",
      sampleText: "नमस्ते, मैं ${name} हूँ। लीडरशिप ब्रीफिंग, महत्वपूर्ण मीटिंग शेड्यूल्स और रणनीतिक प्राथमिकताओं के समन्वय के लिए मैं उपस्थित हूँ।",
      sampleTextEn: "Good day, I am ${name}. I manage executive briefings, strategic agenda coordination, and priority leadership communications.",
      audioRate: "0.92",
      audioPitch: "0.85",
    },
    {
      key: "professional",
      sampleText: "नमस्ते, मैं ${name} हूँ। आपके बिज़नेस कॉल्स और कस्टमर कम्युनिकेशन्स को पेशेवर तरीके से संभालने के लिए मैं तैयार हूँ।",
      sampleTextEn: "Hello, I am ${name}. I am ready to handle your business communications with utmost professionalism and clarity.",
      audioRate: "1.00",
      audioPitch: "1.00",
    },
  ];

  for (const t of toneUpdates) {
    await db.execute(sql`
      UPDATE system_tones 
      SET 
        sample_text = ${t.sampleText},
        sample_text_en = ${t.sampleTextEn},
        audio_rate = ${t.audioRate},
        audio_pitch = ${t.audioPitch},
        updated_at = NOW()
      WHERE key = ${t.key};
    `);
    console.log(`Updated tone: ${t.key}`);
  }

  console.log("All 19 system tones migrated with unique scripts and acoustic parameters!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
