import { db } from "./index";
import { sql } from "drizzle-orm";
import { systemTones } from "./schema";

const allTonesData: Record<string, {
  sampleText: string;
  sampleTextEn: string;
  audioRate: string;
  audioPitch: string;
}> = {
  // 1. Logistics Dispatch
  "logistics-dispatch": {
    sampleText: "नमस्ते! मैं ${name} बोल रहा हूँ, लॉजिस्टिक्स डिस्पैच से। आपके पार्सल का लाइव डिस्पैच और डिलीवरी रूट कन्फर्म करने के लिए मैंने कॉल किया है।",
    sampleTextEn: "Hello! This is ${name} from Logistics Dispatch. I'm calling with a live update regarding your shipment transit and delivery schedule.",
    audioRate: "1.08",
    audioPitch: "0.94",
  },
  // 2. Logistics Support
  "logistics-support": {
    sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, पार्सल ट्रैकिंग सपोर्ट से। आपके शिपमेंट का रियल-टाइम स्टेटस और लोकेशन बताने के लिए मैं उपस्थित हूँ।",
    sampleTextEn: "Hello, this is ${name} from Delivery Support. I am here to help track your live shipment status and resolve transit queries.",
    audioRate: "1.03",
    audioPitch: "0.94",
  },
  // 3. Logistics NDR
  "logistics-ndr": {
    sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ। आपके पेंडिंग पार्सल का डिलीवरी अड्रेस कन्फर्म करने और तुरंत री-डिलीवरी टाइम स्लॉट बुक करने के लिए मैंने संपर्क किया है।",
    sampleTextEn: "Hello, this is ${name}. I am calling regarding your pending package to confirm your delivery address and schedule an immediate re-delivery.",
    audioRate: "1.08",
    audioPitch: "0.98",
  },
  // 4. Financial Advisory
  "financial-advisory": {
    sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, वेल्थ एडवाइजरी टीम से। आपके पोर्टफोलियो रिटर्न और सुरक्षित फाइनेंशियल प्लानिंग में सहायता के लिए मैं उपस्थित हूँ।",
    sampleTextEn: "Hello, this is ${name} from Wealth Advisory. I am here to assist you with portfolio optimization and strategic financial planning.",
    audioRate: "0.92",
    audioPitch: "0.88",
  },
  // 5. Financial Sales
  "financial-sales": {
    sampleText: "नमस्ते, मैं ${name} बात कर रहा हूँ। आपके प्री-अप्रूव्ड बिज़नेस लोन और सबसे कम ब्याज दर के ऑफर्स शेयर करने के लिए मैंने कॉल किया है।",
    sampleTextEn: "Hello! This is ${name}. I'm reaching out with exciting details regarding your pre-approved credit line and low-interest loan options.",
    audioRate: "1.10",
    audioPitch: "1.00",
  },
  // 6. Financial Collections
  "financial-collections": {
    sampleText: "नमस्ते, मैं ${name} बात कर रही हूँ। आपकी आगामी ईएमआई ड्यू डेट और आसान ऑनलाइन पेमेंट ऑप्शन्स के बारे में आपको सूचित करने के लिए कॉल किया है।",
    sampleTextEn: "Hello, this is ${name} with a courteous reminder regarding your upcoming EMI installment and secure instant payment confirmation.",
    audioRate: "0.96",
    audioPitch: "0.96",
  },
  // 7. Financial KYC
  "financial-kyc": {
    sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, बैंकिंग सिक्योरिटी डेस्क से। आपके बैंक खाते के त्वरित और सुरक्षित डिजिटल केवाईसी सत्यापन के लिए यह कॉल है।",
    sampleTextEn: "Hello, this is ${name} from Banking Security. I am assisting you with confidential account verification and seamless digital KYC completion.",
    audioRate: "0.97",
    audioPitch: "0.92",
  },
  // 8. Healthcare Empathetic
  "healthcare-empathetic": {
    sampleText: "नमस्ते, मैं ${name} बात कर रही हूँ, केयर टीम से। आपकी सेहत, दवाईयों के समय और नियमित फॉलो-अप का ध्यान रखने के लिए मैंने संपर्क किया है।",
    sampleTextEn: "Hello, this is ${name} from Patient Care. I am following up gently on your recovery, health checkup, and prescription schedule today.",
    audioRate: "0.90",
    audioPitch: "0.98",
  },
  // 9. Healthcare Wellness
  "healthcare-wellness": {
    sampleText: "नमस्ते, मैं ${name} बात कर रही हूँ, वेलनेस एडवाइजरी से। आपकी डाइट, लाइफस्टाइल और प्रिवेंटिव हेल्थ चेकअप्स के बारे में चर्चा करने के लिए मैं उपस्थित हूँ।",
    sampleTextEn: "Hello, this is ${name} from Wellness Care. I am delighted to support your holistic lifestyle goals, nutrition plans, and regular preventive checkups.",
    audioRate: "0.95",
    audioPitch: "1.02",
  },
  // 10. Healthcare Clinic
  "healthcare-clinic": {
    sampleText: "नमस्ते, मैं ${name} बोल रही हूँ, क्लिनिक रिसेप्शन से। डॉक्टर कंसल्टेशन, अपॉइंटमेंट शेड्यूलिंग और लैब रिपोर्ट्स की जानकारी के लिए मैं उपलब्ध हूँ।",
    sampleTextEn: "Hello, I am ${name} from Clinic Care. I'm here to assist you with doctor appointments, consultation schedules, and medical reports.",
    audioRate: "0.92",
    audioPitch: "1.04",
  },
  // 11. eCommerce Sales
  "ecommerce-sales": {
    sampleText: "नमस्ते! मैं ${name} बोल रहा हूँ। आपके ऑनलाइन कार्ट के स्पेशल डिस्काउंट और लिमिटेड टाइम ऑफर्स की जानकारी देने के लिए मैंने संपर्क किया है।",
    sampleTextEn: "Hello! This is ${name}. I'm reaching out with an exclusive limited-time discount on the items in your shopping cart.",
    audioRate: "1.06",
    audioPitch: "0.96",
  },
  // 12. eCommerce Care
  "ecommerce-care": {
    sampleText: "नमस्ते! मैं ${name} हूँ, कस्टमर केयर से! आपके ऑर्डर, रिटर्न पिकअप और त्वरित रिफंड से जुड़ी सहायता के लिए मैं हमेशा तैयार हूँ।",
    sampleTextEn: "Hi there! I am ${name} from Customer Care. How may I assist you with your recent order, refund, or exchange today?",
    audioRate: "1.06",
    audioPitch: "1.08",
  },
  // 13. eCommerce Verification (COD)
  "ecommerce-verification": {
    sampleText: "नमस्ते! मैं ${name} बोल रहा हूँ। आपके ऑनलाइन कैश-ऑन-डिलीवरी ऑर्डर का शिपिंग पता कन्फर्म करने और तुरंत डिस्पैच करने के लिए मैंने कॉल किया है।",
    sampleTextEn: "Hello, this is ${name}. I am calling to quickly verify your shipping address and confirm dispatch for your Cash-on-Delivery order.",
    audioRate: "1.05",
    audioPitch: "0.96",
  },
  // 14. Education Counselor
  "education-counselor": {
    sampleText: "नमस्ते! मैं ${name} बोल रही हूँ, करियर और एडमिशन काउंसलिंग से। आपके पसंदीदा कोर्सेज और यूनिवर्सिटी एडमिशन में गाइड करने के लिए मैं तैयार हूँ।",
    sampleTextEn: "Hello, I am ${name} from Admissions Counseling. I am excited to help you explore career roadmaps and university degree programs.",
    audioRate: "0.98",
    audioPitch: "1.04",
  },
  // 15. Education Academic
  "education-academic": {
    sampleText: "नमस्ते, मैं ${name} बोल रही हूँ। आपकी फीस स्ट्रक्चर, स्कॉलरशिप ऑप्शन्स और एकेडमिक सिलेबस की जानकारी के लिए मैंने संपर्क किया है।",
    sampleTextEn: "Hello, this is ${name} from Academic Support. I am here to assist you with syllabus details, course fees, and scholarship applications.",
    audioRate: "0.97",
    audioPitch: "1.00",
  },
  // 16. Education EdTech
  "education-edtech": {
    sampleText: "नमस्ते! मैं ${name} बोल रही हूँ, एडटेक लर्निंग एडवाइजरी से। आपके स्किल अपग्रेड और लाइव कोडिंग डेमो सेशन के लिए मैंने संपर्क किया है।",
    sampleTextEn: "Hello! This is ${name} from EdTech Learning Advisory. I am reaching out to schedule your personalized live demo and curriculum review.",
    audioRate: "0.98",
    audioPitch: "1.01",
  },
  // 17. HR Onboarding
  "hr-onboarding": {
    sampleText: "नमस्ते! मैं ${name} हूँ, पीपुल ऑपरेशन्स टीम से। कंपनी में आपके पहले दिन के ओरिएंटेशन और आवश्यक डॉक्यूमेंट्स के लिए मैं आपकी सहायता करूँगी।",
    sampleTextEn: "Welcome aboard! I am ${name} from People Operations. I am here to guide you through your first day onboarding and workspace orientation.",
    audioRate: "1.02",
    audioPitch: "1.04",
  },
  // 18. HR Screening
  "hr-screening": {
    sampleText: "नमस्ते, मैं ${name} बात कर रहा हूँ, टैलेंट एक्विजिशन टीम से। आपकी जॉब एप्लिकेशन और प्रारंभिक इंटरव्यू राउंड के समन्वय के लिए मैंने कॉल किया है।",
    sampleTextEn: "Hello, this is ${name} from Talent Acquisition. I'm following up on your recent application to coordinate your preliminary screening round.",
    audioRate: "1.02",
    audioPitch: "0.98",
  },
  // 19. HR Headhunter
  "hr-headhunter": {
    sampleText: "नमस्ते, मैं ${name} बोल रहा हूँ, एग्जीक्यूटिव लीडरशिप सर्च से। आपकी प्रोफाइल के लिए एक एक्सक्लूसिव डायरेक्टर लेवल अवसर पर गोपनीय चर्चा के लिए संपर्क किया है।",
    sampleTextEn: "Good day, this is ${name} from Executive Leadership Search. I am reaching out confidentially regarding a distinguished senior leadership appointment.",
    audioRate: "0.94",
    audioPitch: "0.88",
  },
};

async function run() {
  console.log("Checking and updating all 19 system tones...");

  const existingTones = await db.select().from(systemTones);
  console.log(`Found ${existingTones.length} tones in system_tones table.`);

  for (const tone of existingTones) {
    const data = allTonesData[tone.key];
    if (data) {
      await db.execute(sql`
        UPDATE system_tones 
        SET 
          sample_text = ${data.sampleText},
          sample_text_en = ${data.sampleTextEn},
          audio_rate = ${data.audioRate},
          audio_pitch = ${data.audioPitch},
          updated_at = NOW()
        WHERE id = ${tone.id};
      `);
      console.log(`[UPDATED] Key: ${tone.key} | Name: ${tone.name}`);
    } else {
      console.warn(`[NOT MATCHED] Key: ${tone.key}`);
    }
  }

  // Verify none have NULL
  const checkAfter = await db.select().from(systemTones);
  const nullCount = checkAfter.filter(t => !t.sampleText).length;
  console.log(`\nVERIFICATION: ${checkAfter.length} total tones, ${nullCount} NULLs.`);

  process.exit(0);
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
