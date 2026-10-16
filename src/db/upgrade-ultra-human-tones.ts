import { db } from "./index";
import { sql } from "drizzle-orm";
import { systemTones } from "./schema";

const ultraHumanTones: Record<string, {
  sampleText: string;
  sampleTextEn: string;
  audioRate: string;
  audioPitch: string;
}> = {
  // 1. Logistics Dispatch (Arjun)
  "logistics-dispatch": {
    sampleText: "नमस्ते जी! मैं ${name} बोल रहा हूँ डिलीवरी टीम से। आपके पार्सल का लाइव स्टेटस आ गया है, बस डिलीवरी लोकेशन कन्फर्म करनी थी।",
    sampleTextEn: "Hi there! This is ${name} from the dispatch team. Your package is out for delivery today, just wanted to confirm your delivery address real quick.",
    audioRate: "1.02",
    audioPitch: "1.00",
  },
  // 2. Logistics Support (Rajesh)
  "logistics-support": {
    sampleText: "हाँजी सर! मैं ${name} बात कर रहा हूँ डिलीवरी सपोर्ट से। आपके पैकेज का लाइव लोकेशन अभी नज़दीकी हब पर है, क्या आपको कोई डिलीवरी निर्देश देना है?",
    sampleTextEn: "Hey! This is ${name} from Delivery Support. Your package just arrived at the local transit hub, any specific delivery instructions for the rider?",
    audioRate: "1.01",
    audioPitch: "1.00",
  },
  // 3. Logistics NDR (Ishaan)
  "logistics-ndr": {
    sampleText: "हेलो सर! मैं डिलीवरी पार्टनर ${name} बोल रहा हूँ। आपका एक पार्सल अटका हुआ था, तो आज किस समय डिलीवरी करवा दें आपके पास?",
    sampleTextEn: "Hey there! This is ${name} from delivery support. We had a delivery attempt earlier—what time works best for you today for a quick drop-off?",
    audioRate: "1.03",
    audioPitch: "1.00",
  },
  // 4. Financial Advisory (Kabir)
  "financial-advisory": {
    sampleText: "नमस्ते! मैं ${name} बात कर रहा हूँ वेल्थ डेस्क से। आपके इन्वेस्टमेंट्स और पोर्टफोलियो को लेकर कुछ ज़रूरी अपडेट्स हैं, क्या अभी दो मिनट बात हो सकती है?",
    sampleTextEn: "Good morning! This is ${name} from Wealth Advisory. I was reviewing your portfolio updates and wanted to see if you had a couple of minutes to talk?",
    audioRate: "0.99",
    audioPitch: "1.00",
  },
  // 5. Financial Sales (Aarav)
  "financial-sales": {
    sampleText: "नमस्ते सर! मैं ${name} बात कर रहा हूँ। आपके अकाउंट पर एक स्पेशल प्री-अप्रूव्ड क्रेडिट लिमिट एक्टिव हुई है, क्या मैं डिटेल्स शेयर कर दूँ?",
    sampleTextEn: "Hi! This is ${name} here. You have a pre-approved zero-fee credit line unlocked on your profile, mind if I share the quick highlights with you?",
    audioRate: "1.02",
    audioPitch: "1.00",
  },
  // 6. Financial Collections (Priya)
  "financial-collections": {
    sampleText: "नमस्ते जी, मैं ${name} बात कर रही हूँ। आपकी आगामी ईएमआई ड्यू डेट को लेकर एक जेंटल रिमाइंडर था, क्या पेमेंट लिंक आपके व्हाट्सएप पर भेज दूँ?",
    sampleTextEn: "Hello, this is ${name}. Just a friendly reminder regarding your upcoming installment due this week—would you like me to send the payment link on WhatsApp?",
    audioRate: "1.00",
    audioPitch: "1.00",
  },
  // 7. Financial KYC (Aditya)
  "financial-kyc": {
    sampleText: "नमस्ते सर, मैं बैंक सिक्योरिटी डेस्क से ${name} बात कर रहा हूँ। आपके अकाउंट की सुरक्षा और डिजिटल वेरिफिकेशन के लिए एक क्विक कन्फर्मेशन चाहिए था।",
    sampleTextEn: "Hello, this is ${name} from Banking Security. I'm calling with a quick security check to help you complete your seamless digital verification.",
    audioRate: "1.00",
    audioPitch: "1.00",
  },
  // 8. Healthcare Empathetic (Aditi)
  "healthcare-empathetic": {
    sampleText: "नमस्ते! मैं केयर टीम से ${name} बात कर रही हूँ। बस आपकी तबीयत और दवाइयों का हालचाल पूछने के लिए कॉल किया था, अब कैसा महसूस कर रहे हैं आप?",
    sampleTextEn: "Hello! This is ${name} from Patient Care. I'm just checking in to see how you're feeling today and if you need any help with your medications?",
    audioRate: "0.99",
    audioPitch: "1.00",
  },
  // 9. Healthcare Wellness (Sneha)
  "healthcare-wellness": {
    sampleText: "नमस्ते! मैं वेलनेस टीम से ${name} बोल रही हूँ। आपके डाइट प्लान और लाइफस्टाइल गोल्स को रिव्यू करने के लिए कॉल किया था, बताइए कैसा चल रहा है सब?",
    sampleTextEn: "Hi! This is ${name} from Wellness Care. I'm following up on your weekly health and lifestyle routine, how is everything going so far?",
    audioRate: "1.00",
    audioPitch: "1.00",
  },
  // 10. Healthcare Clinic (Shreya)
  "healthcare-clinic": {
    sampleText: "नमस्ते! मैं क्लिनिक से ${name} बात कर रही हूँ। आपके डॉक्टर अपॉइंटमेंट और हेल्थ रिपोर्ट्स को लेकर कॉल किया था, क्या सब ठीक है?",
    sampleTextEn: "Hello! This is ${name} calling from the clinic. I'm following up regarding your doctor consultation and lab reports, how are you feeling today?",
    audioRate: "0.99",
    audioPitch: "1.00",
  },
  // 11. eCommerce Sales (Pooja)
  "ecommerce-sales": {
    sampleText: "हेलो जी! मैं ${name} बोल रही हूँ। आपके कार्ट में कुछ फेवरेट आइटम्स छूटे हुए थे, तो आज के एक्सक्लूसिव डिस्काउंट कोड के साथ आपका ऑर्डर प्रोसेस कर दें?",
    sampleTextEn: "Hey there! This is ${name}. I noticed a few great items waiting in your bag, and we just unlocked a special discount code for you today!",
    audioRate: "1.02",
    audioPitch: "1.00",
  },
  // 12. eCommerce Care (Riya)
  "ecommerce-care": {
    sampleText: "नमस्ते! मैं कस्टमर सपोर्ट से ${name} बोल रही हूँ। आपके रीसेंट ऑर्डर और रिटर्न को लेकर कोई दिक्कत तो नहीं आ रही? बताइए मैं क्या मदद करूँ?",
    sampleTextEn: "Hey! This is ${name} from Customer Support. I saw you had a question about your recent order and return—how can I help you out today?",
    audioRate: "1.01",
    audioPitch: "1.00",
  },
  // 13. eCommerce Verification (Arvind)
  "ecommerce-verification": {
    sampleText: "नमस्ते जी! मैं ${name} बोल रहा हूँ। आपका ऑनलाइन कैश-ऑन-डिलीवरी ऑर्डर डिस्पैच होने को तैयार है, बस डिलीवरी अड्रेस एक बार कन्फर्म कर लेते?",
    sampleTextEn: "Hi there! This is ${name}. Your cash-on-delivery order is packed and ready to ship, just wanted to quickly verify your address so we can send it out!",
    audioRate: "1.02",
    audioPitch: "1.00",
  },
  // 14. Education Counselor (Ananya)
  "education-counselor": {
    sampleText: "नमस्ते! मैं एडमिशन डेस्क से ${name} बोल रही हूँ। आपके पसंद के कोर्स और यूनिवर्सिटी ऑप्शन्स को लेकर कुछ जानकारी देनी थी, क्या अभी बात कर सकते हैं?",
    sampleTextEn: "Hello! This is ${name} from Admissions. I wanted to share a few curated course and scholarship recommendations based on your profile!",
    audioRate: "1.00",
    audioPitch: "1.00",
  },
  // 15. Education Academic
  "education-academic": {
    sampleText: "नमस्ते! मैं ${name} बात कर रही हूँ एकेडमिक सपोर्ट से। आपके एग्ज़ाम शेड्यूल और स्टडी मटीरियल को लेकर कोई सवाल था आपका?",
    sampleTextEn: "Hi! This is ${name} from Academic Support. Just reaching out to see if you had any questions regarding your upcoming schedule or course materials?",
    audioRate: "0.99",
    audioPitch: "1.00",
  },
  // 16. Education EdTech (Meera)
  "education-edtech": {
    sampleText: "नमस्ते! मैं ${name} बोल रही हूँ लर्निंग एडवाइजरी से। आपके करियर गोल्स के हिसाब से एक प्रैक्टिकल सर्टिफिकेशन प्रोग्राम सजेस्ट करना था, क्या मैं दो मिनट ले सकती हूँ?",
    sampleTextEn: "Hi there! This is ${name} from Learning Advisory. I looked at your career goals and found a hands-on certification track that might be a great fit!",
    audioRate: "1.01",
    audioPitch: "1.00",
  },
  // 17. HR Onboarding (Kavya)
  "hr-onboarding": {
    sampleText: "नमस्ते! मैं एचआर टीम से ${name} बोल रही हूँ। कंपनी में आपका बहुत-बहुत स्वागत है! आपके पहले दिन के ओरिएंटेशन की तैयारी शुरू करें?",
    sampleTextEn: "Welcome aboard! I'm ${name} from the People team. We are super excited to have you join us—ready to walk through your first-day setup?",
    audioRate: "1.01",
    audioPitch: "1.00",
  },
  // 18. HR Screening (Rohan)
  "hr-screening": {
    sampleText: "नमस्ते, मैं ${name} बात कर रहा हूँ टैलेंट टीम से। आपकी प्रोफाइल हमारी नई ओपनिंग के लिए शॉर्टलिस्ट हुई है, क्या एक क्विक 5-मिनट कॉल कर सकते हैं?",
    sampleTextEn: "Hello, this is ${name} from Talent Acquisition. Your profile stood out for our new open role, would you be free for a quick 5-minute chat?",
    audioRate: "1.01",
    audioPitch: "1.00",
  },
  // 19. HR Headhunter (Dev / Sanjay)
  "hr-headhunter": {
    sampleText: "नमस्ते, मैं ${name} बात कर रहा हूँ एग्जीक्यूटिव सर्च से। आपके एक्सपीरियंस को देखते हुए एक लीडरशिप रोल पर आपसे चर्चा करनी थी, क्या इस हफ़्ते समय मिल पाएगा?",
    sampleTextEn: "Good day, this is ${name} from Executive Search. Given your impressive background, I wanted to discuss an exclusive leadership opportunity with you.",
    audioRate: "0.99",
    audioPitch: "1.00",
  },
};

async function run() {
  console.log("Upgrading all 19 system tones with ultra-human conversational scripts...");

  const existingTones = await db.select().from(systemTones);
  for (const tone of existingTones) {
    const data = ultraHumanTones[tone.key];
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
      console.log(`[UPGRADED] ${tone.key} -> "${data.sampleText.slice(0, 45)}..."`);
    }
  }

  console.log("All 19 system tones now contain ultra-realistic, human conversational scripts!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
