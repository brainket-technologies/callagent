import { db } from "./index";
import { systemTones, aiVoices, systemLanguages } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Seeding 6 New System Tones (Total 20) and 20 New AI Voices (Total 55+)...");

  // 1. Add 6 Brand New System Tones to reach 20 comprehensive tones
  const additionalTones = [
    {
      key: "inspirational",
      name: "Inspirational & Visionary",
      description: "Uplifting, high-charisma motivational tone for leadership, life coaching, and milestone announcements.",
      promptInstruction: "Speak with passionate conviction, uplifting cadence, and inspiring optimism that motivates action.",
      icon: "🚀",
      isDefault: false,
      isEnabled: true,
      sortOrder: 15,
    },
    {
      key: "luxury",
      name: "Sophisticated & Luxury",
      description: "Poised, elegant, refined cadence for high-net-worth banking, luxury hospitality, and premium jewelry.",
      promptInstruction: "Deliver with immaculate diction, leisurely and elegant spacing, and quiet, prestigious sophistication.",
      icon: "💎",
      isDefault: false,
      isEnabled: true,
      sortOrder: 16,
    },
    {
      key: "patient",
      name: "Patient & Step-by-Step",
      description: "Deliberate, unhurried cadence designed for elderly support, complex tech troubleshooting, and guided onboarding.",
      promptInstruction: "Speak deliberately with clear pauses between steps, ensuring the caller feels fully supported and never rushed.",
      icon: "🧘",
      isDefault: false,
      isEnabled: true,
      sortOrder: 17,
    },
    {
      key: "cheerful",
      name: "Cheerful & Welcoming",
      description: "Bright, sunny, smiling front-desk delivery for restaurants, hotel bookings, and festive campaigns.",
      promptInstruction: "Exude warmth and an audible smile, making every caller feel immediately welcomed and valued.",
      icon: "☀️",
      isDefault: false,
      isEnabled: true,
      sortOrder: 18,
    },
    {
      key: "assertive",
      name: "Firm & Assertive",
      description: "Polite yet unyielding, decisive delivery for collections, fraud alerts, and compliance verification.",
      promptInstruction: "Maintain a calm, firm, and authoritative tone that commands seriousness while remaining strictly courteous.",
      icon: "⚖️",
      isDefault: false,
      isEnabled: true,
      sortOrder: 19,
    },
    {
      key: "inquisitive",
      name: "Curious & Inquisitive",
      description: "Attentive, investigative, consultative cadence for customer research, surveys, and detailed KYC intake.",
      promptInstruction: "Engage with genuine curiosity and active listening cues, asking questions with natural warmth and precision.",
      icon: "🔍",
      isDefault: false,
      isEnabled: true,
      sortOrder: 20,
    },
  ];

  for (const t of additionalTones) {
    await db
      .insert(systemTones)
      .values(t)
      .onConflictDoUpdate({
        target: systemTones.key,
        set: {
          name: t.name,
          description: t.description,
          promptInstruction: t.promptInstruction,
          icon: t.icon,
          sortOrder: t.sortOrder,
          isEnabled: true,
          updatedAt: new Date(),
        },
      });
    console.log(`  Tone synced: ${t.icon} ${t.name} (${t.key})`);
  }

  // Fetch all tones and languages to map keys/codes to UUIDs
  const allTones = await db.select().from(systemTones);
  const toneKeyToId = new Map(allTones.map((t) => [t.key, t.id]));

  const allLanguages = await db.select().from(systemLanguages);
  const langCodeToId = new Map(allLanguages.map((l) => [l.code, l.id]));

  const hiId = langCodeToId.get("hi-IN") || "";
  const enInId = langCodeToId.get("en-IN") || "";
  const enUsId = langCodeToId.get("en-US") || "";
  const mrId = langCodeToId.get("mr-IN") || "";
  const guId = langCodeToId.get("gu-IN") || "";
  const bnId = langCodeToId.get("bn-IN") || "";
  const taId = langCodeToId.get("ta-IN") || "";
  const teId = langCodeToId.get("te-IN") || "";
  const paId = langCodeToId.get("pa-IN") || "";

  // 2. Add 20 New Diverse AI Voices across all providers
  const newVoices = [
    // --- Cartesia Sonic-3.5 ---
    {
      slug: "arjun-sonic-35",
      name: "Arjun (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-arjun",
      model: "Sonic-3.5",
      tag: "Most Used",
      gender: "male",
      languages: [hiId, enInId, paId].filter(Boolean),
      tone: toneKeyToId.get("authoritative") || "",
      description: "Commanding, articulate Indian male voice for executive outreach, banking & corporate comms.",
    },
    {
      slug: "neha-sonic-35",
      name: "Neha (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-neha",
      model: "Sonic-3.5",
      tag: "Most Used",
      gender: "female",
      languages: [hiId, enInId, guId].filter(Boolean),
      tone: toneKeyToId.get("cheerful") || "",
      description: "Sunny, upbeat female voice perfect for customer delight, hospitality, and event bookings.",
    },
    {
      slug: "dev-sonic-35",
      name: "Dev (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-dev",
      model: "Sonic-3.5",
      tag: "Neutral",
      gender: "male",
      languages: [hiId, enInId, bnId].filter(Boolean),
      tone: toneKeyToId.get("inspirational") || "",
      description: "Visionary, motivating male voice tailored for ed-tech coaching, fitness & webinars.",
    },
    {
      slug: "ishaan-sonic-35",
      name: "Ishaan (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-ishaan",
      model: "Sonic-3.5",
      tag: "Neutral",
      gender: "male",
      languages: [hiId, enInId].filter(Boolean),
      tone: toneKeyToId.get("direct") || "",
      description: "Crisp, fast, no-nonsense delivery suited for logistics, delivery tracking & urgent alerts.",
    },
    {
      slug: "aanya-sonic-35",
      name: "Aanya (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-aanya",
      model: "Sonic-3.5",
      tag: "Most Used",
      gender: "female",
      languages: [hiId, enInId, mrId].filter(Boolean),
      tone: toneKeyToId.get("patient") || "",
      description: "Deliberate, warm female voice ideal for patient onboarding, health checkups & IVR guidance.",
    },

    // --- ElevenLabs Voices ---
    {
      slug: "charlotte-multilingual-v2",
      name: "Charlotte (Multilingual v2)",
      provider: "ElevenLabs",
      voiceId: "eleven-charlotte",
      model: "Multilingual v2",
      tag: "Most Used",
      gender: "female",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("luxury") || "",
      description: "Refined, sophisticated European English female accent for luxury retail & private banking.",
    },
    {
      slug: "callum-multilingual-v2",
      name: "Callum (Multilingual v2)",
      provider: "ElevenLabs",
      voiceId: "eleven-callum",
      model: "Multilingual v2",
      tag: "Neutral",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("assertive") || "",
      description: "Intense, firm male tone for compliance, contract deadlines, and security confirmations.",
    },
    {
      slug: "freya-multilingual-v2",
      name: "Freya (Multilingual v2)",
      provider: "ElevenLabs",
      voiceId: "eleven-freya",
      model: "Multilingual v2",
      tag: "Most Used",
      gender: "female",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("cheerful") || "",
      description: "Youthful, sparkling delivery for lifestyle apps, retail rewards, and social promotions.",
    },
    {
      slug: "liam-turbo-25",
      name: "Liam (Turbo v2.5)",
      provider: "ElevenLabs",
      voiceId: "eleven-liam",
      model: "Turbo v2.5",
      tag: "Most Used",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("friendly") || "",
      description: "Approachable, conversational young professional male voice for SaaS sales & support.",
    },
    {
      slug: "charlie-turbo-25",
      name: "Charlie (Turbo v2.5)",
      provider: "ElevenLabs",
      voiceId: "eleven-charlie",
      model: "Turbo v2.5",
      tag: "Neutral",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("casual") || "",
      description: "Relaxed, natural conversational male delivery for podcasts, feedback, and informal chats.",
    },

    // --- Sarvam AI Indic Models ---
    {
      slug: "sarvam-anand-bulbul",
      name: "Anand (Bulbul v1)",
      provider: "Sarvam",
      voiceId: "bulbul-anand",
      model: "Bulbul v1",
      tag: "Most Used",
      gender: "male",
      languages: [hiId, taId, teId].filter(Boolean),
      tone: toneKeyToId.get("patient") || "",
      description: "Gentle South Indian male cadence for multilingual government schemes and utility billing.",
    },
    {
      slug: "sarvam-suman-bulbul",
      name: "Suman (Bulbul v1)",
      provider: "Sarvam",
      voiceId: "bulbul-suman",
      model: "Bulbul v1",
      tag: "Most Used",
      gender: "female",
      languages: [hiId, bnId, mrId].filter(Boolean),
      tone: toneKeyToId.get("sympathetic") || "",
      description: "Empathetic, caring female voice for healthcare follow-ups and maternal health support.",
    },
    {
      slug: "sarvam-rohit-bulbul",
      name: "Rohit (Bulbul v1)",
      provider: "Sarvam",
      voiceId: "bulbul-rohit",
      model: "Bulbul v1",
      tag: "Most Used",
      gender: "male",
      languages: [hiId, mrId, guId].filter(Boolean),
      tone: toneKeyToId.get("enthusiastic") || "",
      description: "High-octane, friendly Indian male voice for festival offers and promotional broadcasts.",
    },

    // --- OpenAI Voices (TTS-1 & TTS-1-HD) ---
    {
      slug: "openai-onyx",
      name: "Onyx (OpenAI)",
      provider: "OpenAI",
      voiceId: "onyx",
      model: "TTS-1-HD",
      tag: "Most Used",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("authoritative") || "",
      description: "Deep, resonant, baritone male voice designed for news broadcasts & leadership briefings.",
    },
    {
      slug: "openai-coral",
      name: "Coral (OpenAI)",
      provider: "OpenAI",
      voiceId: "coral",
      model: "TTS-1-HD",
      tag: "Most Used",
      gender: "female",
      languages: [enUsId, enInId, hiId].filter(Boolean),
      tone: toneKeyToId.get("cheerful") || "",
      description: "Warm, radiant, smiling voice with exceptional emotional nuance and clarity.",
    },
    {
      slug: "openai-sage",
      name: "Sage (OpenAI)",
      provider: "OpenAI",
      voiceId: "sage",
      model: "TTS-1-HD",
      tag: "Neutral",
      gender: "female",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("calm") || "",
      description: "Peaceful, meditative, soothing cadence for wellness apps and mental health hotlines.",
    },
    {
      slug: "openai-verse",
      name: "Verse (OpenAI)",
      provider: "OpenAI",
      voiceId: "verse",
      model: "TTS-1-HD",
      tag: "Neutral",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("inquisitive") || "",
      description: "Expressive, thoughtful male delivery ideal for podcast narration and survey interviews.",
    },

    // --- Google Cloud Next-Gen Voices ---
    {
      slug: "google-en-in-journey-f",
      name: "Google Journey en-IN F",
      provider: "Google",
      voiceId: "en-IN-Journey-F",
      model: "Journey",
      tag: "Most Used",
      gender: "female",
      languages: [enInId, hiId].filter(Boolean),
      tone: toneKeyToId.get("luxury") || "",
      description: "Ultra-realistic Google Journey voice model with human-like breathing and natural prosody.",
    },
    {
      slug: "google-en-in-journey-d",
      name: "Google Journey en-IN D",
      provider: "Google",
      voiceId: "en-IN-Journey-D",
      model: "Journey",
      tag: "Most Used",
      gender: "male",
      languages: [enInId, hiId].filter(Boolean),
      tone: toneKeyToId.get("professional") || "",
      description: "Next-gen Google Journey model with corporate poise and natural articulation.",
    },
    {
      slug: "google-hi-in-neural2-d",
      name: "Google hi-IN Neural2 D",
      provider: "Google",
      voiceId: "hi-IN-Neural2-D",
      model: "Neural2",
      tag: "Most Used",
      gender: "male",
      languages: [hiId, mrId].filter(Boolean),
      tone: toneKeyToId.get("direct") || "",
      description: "Clear, brisk Google Neural2 Hindi male voice for dispatch, OTP delivery, and confirmations.",
    },
  ];

  let order = 40;
  for (const v of newVoices) {
    const previewAudioUrl = `/uploads/voices/${v.slug}.wav`;
    await db
      .insert(aiVoices)
      .values({
        slug: v.slug,
        name: v.name,
        provider: v.provider,
        voiceId: v.voiceId,
        model: v.model,
        tag: v.tag,
        gender: v.gender,
        languages: v.languages,
        tone: v.tone,
        previewAudioUrl,
        description: v.description,
        isEnabled: true,
        sortOrder: order++,
      })
      .onConflictDoUpdate({
        target: aiVoices.slug,
        set: {
          name: v.name,
          provider: v.provider,
          voiceId: v.voiceId,
          model: v.model,
          tag: v.tag,
          gender: v.gender,
          languages: v.languages,
          tone: v.tone,
          previewAudioUrl,
          description: v.description,
          isEnabled: true,
          updatedAt: new Date(),
        },
      });
    console.log(`  Voice synced: [${v.provider}] ${v.name} -> tone: ${v.tone ? "assigned" : "default"}`);
  }

  const totalVoices = await db.select().from(aiVoices);
  const totalTones = await db.select().from(systemTones);
  console.log(`\n🎉 Success! Total AI Voices in DB: ${totalVoices.length}, Total System Tones: ${totalTones.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
