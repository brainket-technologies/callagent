import { NextRequest, NextResponse } from "next/server";

// In-memory cache for ultra-fast repeating requests
const translationCache = new Map<string, string>();

// Pre-defined high-accuracy benchmark templates for standard prompts (No '.' in Indic languages to prevent TTS saying 'dot')
const BENCHMARK_TEMPLATES: Record<string, Record<string, string>> = {
  // 1. Default Business Intro
  default: {
    en: "Hello, I am ${name}. I am ready to handle your business communications with ease",
    hi: "नमस्ते, मैं ${name} हूँ, आपकी सभी व्यावसायिक कॉल्स को आसानी से संभालने के लिए मैं तैयार हूँ",
    mr: "नमस्कार, मी ${name} आहे, आपल्या सर्व व्यावसायिक कॉल्स सहजतेने सांभाळण्यासाठी मी सज्ज आहे",
    gu: "નમસ્તે, હું ${name} છું, તમારા વ્યવસાયિક સંદેશાવ્યવહારને સરળતાથી સંભાળવા માટે હું તૈયાર છું",
    bn: "নমস্কার, আমি ${name}, আপনার সমস্ত ব্যবসায়িক যোগাযোগ সহজে পরিচালনা করতে আমি প্রস্তুত",
    ta: "வணக்கம், நான் ${name}, உங்கள் வணிகத் தொடர்புகளை எளிதாகக் கையாள நான் தயாராக உள்ளேன்",
    te: "నమస్కారం, నేను ${name}, మీ వ్యాపార కమ్యూనికేషన్లను సులభంగా నిర్వహించడానికి నేను సిద్ధంగా ఉన్నాను",
    kn: "ನಮಸ್ಕಾರ, ನಾನು ${name}, ನಿಮ್ಮ ವ್ಯಾಪಾರ ಸಂವಹನಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ",
    ml: "നമസ്കാരം, ഞാൻ ${name}, നിങ്ങളുടെ ബിസിനസ്സ് ആശയവിനിമയങ്ങൾ എളുപ്പത്തിൽ കൈകാര്യം ചെയ്യാൻ ഞാൻ തയ്യാറാണ്",
    pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ${name} ਹਾਂ, ਤੁਹਾਡੇ ਕਾਰੋਬਾਰੀ ਸੰਚਾਰ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਸੰਭਾਲਣ ਲਈ ਮੈਂ ਤਿਆਰ ਹਾਂ",
    es: "Hola, soy ${name}, estoy listo para gestionar sus comunicaciones empresariales con facilidad",
    fr: "Bonjour, je suis ${name}, je suis prêt à gérer vos communications professionnelles avec facilité",
    de: "Hallo, ich bin ${name}, ich bin bereit, Ihre geschäftliche Kommunikation reibungslos zu übernehmen",
  },
  // 2. Customer Support
  support: {
    en: "Thank you for calling. My name is ${name}, your AI support assistant. How can I help you today?",
    hi: "कॉल करने के लिए धन्यवाद, मेरा नाम ${name} है, आपकी एआई सहायता सहायक, आज मैं आपकी क्या मदद कर सकती हूँ",
    mr: "कॉल केल्याबद्दल धन्यवाद, माझे नाव ${name} आहे, आपला एआय सपोर्ट असिस्टंट, आज मी आपल्याला कशी मदत करू शकेन",
    gu: "કૉલ કરવા બદલ આભાર, મારું નામ ${name} છે, તમારો એઆઈ સહાયક, આજે હું તમને કેવી રીતે મદદ કરી શકું",
    bn: "কল করার জন্য ধন্যবাদ, আমার নাম ${name}, আপনার এআই সহায়তা সহকারী, আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি",
    ta: "அழைத்ததற்கு நன்றி, என் பெயர் ${name}, உங்கள் ஏআই ஆதரவு உதவியாளர், இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்",
    te: "కాల్ చేసినందుకు ధన్యవాదాలు, నా పేరు ${name}, మీ AI సపోర్ట్ అసిస్టెంట్, ఈరోజు నేను మీకు ఎలా సహాయపడగలను",
  },
  // 3. Sales Outreach
  sales: {
    en: "Hi there! This is ${name} reaching out to see if you have any questions about our enterprise plans",
    hi: "नमस्ते, मैं ${name} हूँ, यह जानने के लिए संपर्क कर रही हूँ कि क्या हमारे एंटरप्राइज प्लान्स के बारे में आपका कोई सवाल है",
    mr: "नमस्कार, मी ${name} बोलत आहे, आमच्या एंटरप्राइझ योजनांबद्दल आपले काही प्रश्न आहेत का ते जाणून घेण्यासाठी संपर्क केला आहे",
    gu: "નમસ્તે, હું ${name} છું, અમારા એન્ટરપ્રાઇઝ પ્લાન વિશે તમને કોઈ પ્રશ્નો છે કે નહીં તે જાણવા માટે સંપર્ક કરી રહ્યો છું",
    bn: "নমস্কার, আমি ${name}, আমাদের এন্টারপ্রাইজ প্ল্যান সম্পর্কে আপনার কোনো প্রশ্ন আছে কিনা তা জানতে যোগাযোগ করছি",
  },
  // 4. Appointment Reminder
  appointment: {
    en: "Hello! This is a friendly reminder from ${name} about your scheduled consultation tomorrow at 10 AM",
    hi: "नमस्ते, कल सुबह 10 बजे आपके निर्धारित परामर्श के बारे में यह ${name} की ओर से एक अनुस्मारक है",
    mr: "नमस्कार, उद्या सकाळी १० वाजताच्या आपल्या नियोजित भेटीबद्दल ${name} कडून ही एक आठवण आहे",
    gu: "નમસ્તે, આવતીકાલે સવારે ૧૦ વાગ્યે તમારા નિર્ધારિત કન્સલ્ટેશન વિશે આ ${name} તરફથી એક સ્મૃતિપત્ર છે",
    bn: "নমস্কার, আগামীকাল সকাল ১০টায় আপনার নির্ধারিত পরামর্শের জন্য ${name}-এর পক্ষ থেকে একটি অনুস্মারক",
  },
  // 5. Order Status
  order: {
    en: "Your order has been confirmed successfully! ${name} is here to ensure speedy delivery to your doorstep",
    hi: "आपका ऑर्डर सफलतापूर्वक कन्फर्म हो गया है, ${name} आपके पते पर तेजी से डिलीवरी सुनिश्चित करने के लिए यहाँ है",
    mr: "तुमची ऑर्डर यशस्वीरित्या निश्चित झाली आहे, तुमच्या दारापर्यंत जलद वितरणाची खात्री करण्यासाठी ${name} सज्ज आहे",
    gu: "તમારો ઓર્ડર સફળતાપૂર્વક કન્ફર્મ થઈ ગયો છે, તમારા ઘર સુધી ઝડપી ડિલિવરી સુનિશ્ચિત કરવા માટે ${name} અહીં હાજર છે",
    bn: "আপনার অর্ডার সফলভাবে নিশ্চিত হয়েছে, আপনার দোরগোড়ায় দ্রুত ডেলিভারি নিশ্চিত করতে ${name} প্রস্তুত",
  },
};

// Check if input matches one of our known presets (exact match)
function getBenchmarkMatch(rawText: string, targetLangPrefix: string, cleanName: string): string | null {
  const normalized = rawText.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!normalized) return null;

  const nameNorm = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const group of Object.values(BENCHMARK_TEMPLATES)) {
    for (const text of Object.values(group)) {
      const groupNorm = text.toLowerCase().replace(/\$\{name\}/g, "").replace(/[^a-z0-9]/g, "");
      const normalizedWithoutName = normalized.replace(nameNorm, "");
      if (normalizedWithoutName === groupNorm || normalized === groupNorm) {
        const targetTemplate = group[targetLangPrefix] || group["en"];
        if (targetTemplate) {
          return targetTemplate.replace(/\$\{name\}/g, cleanName);
        }
      }
    }
  }

  return null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/');
}

// Comprehensive localized phonetic mapping for AI assistant voice names across Indian languages
const INDIC_VOICE_NAMES: Record<string, { hi: string; mr: string; gu: string; bn: string; ta?: string; te?: string; kn?: string }> = {
  nova: { hi: "नोवा", mr: "नोव्हा", gu: "નોવા", bn: "নোভা", ta: "நோவா", te: "నోవా", kn: "ನೋವಾ" },
  shimmer: { hi: "शिमर", mr: "शिमर", gu: "શિમર", bn: "শিমার", ta: "ஷிம்மர்", te: "షిమ్మర్", kn: "ಶಿಮ್ಮರ್" },
  fable: { hi: "फेबल", mr: "फेबल", gu: "ફેબલ", bn: "ফেবল", ta: "ஃபேபிள்", te: "ఫేబుల్", kn: "ಫೇಬಲ್" },
  alloy: { hi: "अलॉय", mr: "अ‍ॅलॉय", gu: "એલોય", bn: "অ্যালয়", ta: "அலாய்", te: "అల్లాయ్", kn: "ಅಲಾಯ್" },
  echo: { hi: "इको", mr: "इको", gu: "ઇકો", bn: "ইকো", ta: "எக்கோ", te: "ఎకో", kn: "ಎಕೋ" },
  onyx: { hi: "ऑनिक्स", mr: "ऑक्सिस", gu: "ઓનિક્સ", bn: "অনিক্স", ta: "ஆனிக்ஸ்", te: "ఆనిక్స్", kn: "ಆನಿಕ್ಸ್" },
  coral: { hi: "कोरल", mr: "कोरल", gu: "કોરલ", bn: "কোরাল", ta: "கோரல்", te: "కోరల్", kn: "ಕೋರಲ್" },
  sage: { hi: "सेज", mr: "सेज", gu: "સેજ", bn: "সেজ", ta: "சேஜ்", te: "సేజ్", kn: "ಸೇಜ್" },
  verse: { hi: "वर्स", mr: "वर्स", gu: "વર્સ", bn: "ভার্স", ta: "வெர்ஸ்", te: "వెర్స్", kn: "ವರ್ಸ್" },
  aditi: { hi: "अदिति", mr: "अदिती", gu: "અદિતિ", bn: "অদিতি", ta: "அதிதி", te: "அదితి", kn: "ಅದಿತಿ" },
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
  kabir: { hi: "कबीर", mr: "कबीर", gu: "કબીર", bn: "কবীর", ta: "கபீர்", te: "కబీర్", kn: "ಕಬೀರ್" },
  adam: { hi: "एडम", mr: "अ‍ॅडम", gu: "એડમ", bn: "অ্যাডাম", ta: "ஆடம்", te: "ఆడమ్", kn: "ಆಡಮ್" },
  antoni: { hi: "अंटोनी", mr: "अँटोनी", gu: "એન્ટોની", bn: "অ্যান্টনি", ta: "அந்தோணி", te: "ఆంటోని", kn: "ಆಂಟோনি" },
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
  neha: { hi: "नेहा", mr: "नेहा", gu: "નેહા", bn: "নেহা", ta: "நேஹா", te: "నేహా", kn: "ನೇಹಾ" },
  anand: { hi: "आनंद", mr: "आनंद", gu: "આનંદ", bn: "আনন্দ", ta: "ஆனந்த்", te: "ఆనంద్", kn: "ಆನಂದ್" },
};

function getLocalizedVoiceName(cleanName: string, targetLangPrefix: string): string {
  const key = cleanName.toLowerCase().trim();
  const match = INDIC_VOICE_NAMES[key];
  if (!match) return cleanName;
  if (targetLangPrefix === "gu") return match.gu || match.hi;
  if (targetLangPrefix === "bn") return match.bn || match.hi;
  if (targetLangPrefix === "mr") return match.mr || match.hi;
  if (targetLangPrefix === "ta") return match.ta || match.hi;
  if (targetLangPrefix === "te") return match.te || match.hi;
  if (targetLangPrefix === "kn") return match.kn || match.hi;
  return match.hi || cleanName;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetLang, voiceName, gender } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanName = (voiceName || "Assistant")
      .replace(/\(.*?\)/g, "")
      .replace(/google\s+[a-z]{2}-[a-z]{2}\s+/i, "Google ")
      .trim();

    const targetCode = (targetLang || "en-US").toLowerCase().split("-")[0]; // "hi", "mr", "gu", "bn", "en", etc.
    const isIndicTarget = ["hi", "mr", "gu", "bn", "ta", "te", "kn", "ml", "pa"].includes(targetCode);

    // Resolve native localized voice name for Indic languages (e.g. Nova -> नोवा, Shimmer -> शिमर)
    const effectiveName =
      isIndicTarget || /[\u0900-\u0D7F]/.test(text)
        ? getLocalizedVoiceName(cleanName, targetCode)
        : cleanName;

    // Helper to sanitize output for smooth, uninterrupted speech synthesis (Completely eliminates "dot" sound)
    const cleanOutput = (raw: string) => {
      let cleaned = raw
        .replace(/\$\{\s*name\s*\}/gi, effectiveName)
        .replace(/\$\(\s*name\s*\)/gi, effectiveName)
        .replace(/\{\s*name\s*\}/gi, effectiveName)
        .replace(/\$name\b/gi, effectiveName)
        .replace(/\$\{\s*voice\s*\}/gi, effectiveName)
        .replace(/\$\(\s*voice\s*\)/gi, effectiveName)
        .replace(/\{\s*voice\s*\}/gi, effectiveName)
        .replace(/\$voice\b/gi, effectiveName)
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        .replace(/[\u200B\uFEFF\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
        .replace(/[()[\]{}<>]/g, " ")
        .replace(/[@#$%^&*_+=\\~`|/\\"'“”‘’«»„•·°±§©®™✓✔✕✖★☆♥❤♦♠♣►◄▲▼]/g, " ");

      const hasIndicScript = /[\u0900-\u0D7F]/.test(cleaned);

      // If text already has raw English voice name inside Indic script (e.g. "मैं Nova हूँ"), replace with effective Indic name
      if ((isIndicTarget || hasIndicScript) && effectiveName !== cleanName && cleanName.length > 1) {
        const nameWordRegex = new RegExp(`\\b${cleanName}\\b`, "gi");
        cleaned = cleaned.replace(nameWordRegex, effectiveName);
      }

      if (isIndicTarget || hasIndicScript) {
        // Indic TTS engines (e.g. Google हिन्दी in Chrome) pronounce ASCII '.' as the spoken word "dot".
        // Using comma ',' creates a natural speech pause without uttering any punctuation words.
        cleaned = cleaned
          .replace(/[।॥!?;.]/g, ", ")
          .replace(/[:]/g, ", ")
          .replace(/,{2,}/g, ",")
          .replace(/\s*,\s*/g, ", ")
          .replace(/\s+/g, " ")
          .replace(/^[,.\s]+/, "")
          .replace(/[,.\s]+$/, ""); // Strip trailing comma/dot so sentence finishes cleanly with zero "dot" sound
      } else {
        cleaned = cleaned
          .replace(/[।॥!?;]/g, ".")
          .replace(/[:]/g, ", ")
          .replace(/\.{2,}/g, ".")
          .replace(/\s+\./g, ".")
          .replace(/\s+/g, " ")
          .replace(/^[.,\s]+/, "")
          .replace(/[,.\s]+$/, "");
      }

      return cleaned.trim();
    };

    // 1. If target is English, replace ${name} and return
    if (targetCode === "en") {
      const enText = cleanOutput(text);
      return NextResponse.json({ success: true, translatedText: enText, targetLang: "en-US" });
    }

    // 2. Check if text is ALREADY in the target script (e.g. Devanagari for Hindi/Marathi)
    const isDevanagari = /[\u0900-\u097F]/.test(text);
    const isGujarati = /[\u0A80-\u0AFF]/.test(text);
    const isBengali = /[\u0980-\u09FF]/.test(text);
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    const isTelugu = /[\u0C00-\u0C7F]/.test(text);
    const isKannada = /[\u0C80-\u0CFF]/.test(text);

    if (
      (targetCode === "hi" && isDevanagari) ||
      (targetCode === "mr" && isDevanagari) ||
      (targetCode === "gu" && isGujarati) ||
      (targetCode === "bn" && isBengali) ||
      (targetCode === "ta" && isTamil) ||
      (targetCode === "te" && isTelugu) ||
      (targetCode === "kn" && isKannada)
    ) {
      const directText = cleanOutput(text);
      return NextResponse.json({ success: true, translatedText: directText, targetLang });
    }

    // 3. Check benchmark preset templates
    const benchmarkMatch = getBenchmarkMatch(text, targetCode, effectiveName);
    if (benchmarkMatch) {
      return NextResponse.json({
        success: true,
        translatedText: cleanOutput(benchmarkMatch),
        targetLang,
        cached: true,
      });
    }

    // 4. Check cache for custom text
    const cacheKey = `${targetCode}:${cleanName}:${gender || "f"}:${text.trim()}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        translatedText: translationCache.get(cacheKey)!,
        targetLang,
        cached: true,
      });
    }

    // 5. Dynamic Translation for any custom user text via MyMemory API
    let preprocessed = text
      .replace(/\$\{\s*name\s*\}/gi, cleanName)
      .replace(/\$\(\s*name\s*\)/gi, cleanName)
      .replace(/\{\s*name\s*\}/gi, cleanName)
      .replace(/\$name\b/gi, cleanName)
      .replace(/\$\{\s*voice\s*\}/gi, cleanName)
      .replace(/\$\(\s*voice\s*\)/gi, cleanName)
      .replace(/\{\s*voice\s*\}/gi, cleanName)
      .replace(/\$voice\b/gi, cleanName);

    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        preprocessed
      )}&langpair=en|${encodeURIComponent(targetCode)}`;

      const res = await fetch(myMemoryUrl, {
        headers: {
          "User-Agent": "Voxera-AI-Voice-Platform/1.0",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.responseData?.translatedText) {
          const translated = cleanOutput(decodeHtmlEntities(data.responseData.translatedText));
          translationCache.set(cacheKey, translated);
          return NextResponse.json({ success: true, translatedText: translated, targetLang });
        }
      }
    } catch (apiErr) {
      console.warn("MyMemory Translation API request failed, falling back to benchmark:", apiErr);
    }

    // 6. Safe Fallback to standard benchmark in target language
    const fallbackTemplate =
      BENCHMARK_TEMPLATES.default[targetCode] || BENCHMARK_TEMPLATES.default["en"];
    const fallbackResult = cleanOutput(fallbackTemplate);

    return NextResponse.json({
      success: true,
      translatedText: fallbackResult,
      targetLang,
      fallback: true,
    });
  } catch (err: any) {
    console.error("Translation route error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process translation" },
      { status: 500 }
    );
  }
}
