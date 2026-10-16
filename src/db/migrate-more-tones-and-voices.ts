import { db } from "./index";
import { systemTones, aiVoices, systemLanguages } from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Seeding additional System Tones and AI Voices...");

  // 1. New Tones to insert
  const newTones = [
    {
      key: "authoritative",
      name: "Authoritative & Confident",
      description: "Commanding, expert executive tone for banking, legal, and strategic advisory.",
      promptInstruction: "Speak with unwavering confidence, decisive executive phrasing, and clear authority.",
      icon: "🏛️",
      isDefault: false,
      isEnabled: true,
      sortOrder: 8,
    },
    {
      key: "enthusiastic",
      name: "Enthusiastic & High-Energy",
      description: "Vibrant, high-energy, exciting delivery for sales events and promotional offers.",
      promptInstruction: "Deliver messages with infectious enthusiasm, positive momentum, and dynamic pitch.",
      icon: "🌟",
      isDefault: false,
      isEnabled: true,
      sortOrder: 9,
    },
    {
      key: "direct",
      name: "Direct & Concise",
      description: "Straightforward, fluff-free, crisp communication for high-efficiency enterprise calls.",
      promptInstruction: "Be concise, precise, and direct to the point without filler phrases or preamble.",
      icon: "⏱️",
      isDefault: false,
      isEnabled: true,
      sortOrder: 10,
    },
    {
      key: "sympathetic",
      name: "Gentle & Comforting",
      description: "Ultra-soft, reassuring tone designed for healthcare clinics and customer care.",
      promptInstruction: "Speak softly with reassuring compassion, gentle cadence, and deep care for caller comfort.",
      icon: "🕊️",
      isDefault: false,
      isEnabled: true,
      sortOrder: 11,
    },
    {
      key: "humorous",
      name: "Witty & Engaging",
      description: "Light-hearted, witty, playful flow ideal for consumer apps and youth brands.",
      promptInstruction: "Maintain an upbeat, playful, and conversational wit while addressing questions promptly.",
      icon: "😄",
      isDefault: false,
      isEnabled: true,
      sortOrder: 12,
    },
    {
      key: "formal",
      name: "Formal & Regulatory",
      description: "Strictly official, legal compliance, policy verification, and institutional disclosures.",
      promptInstruction: "Follow strict corporate protocol, precise formal terminology, and measured objective pace.",
      icon: "📜",
      isDefault: false,
      isEnabled: true,
      sortOrder: 13,
    },
    {
      key: "playful",
      name: "Playful & Charismatic",
      description: "Charming, delightful, charismatic persona for lifestyle, wellness, and personal assistants.",
      promptInstruction: "Be charming, warm, and engaging with creative expression and pleasant melody.",
      icon: "✨",
      isDefault: false,
      isEnabled: true,
      sortOrder: 14,
    },
  ];

  for (const t of newTones) {
    await db.execute(sql`
      INSERT INTO "system_tones" (
        "key", "name", "description", "prompt_instruction", "icon", "is_default", "is_enabled", "sort_order"
      ) VALUES (
        ${t.key}, ${t.name}, ${t.description}, ${t.promptInstruction}, ${t.icon}, ${t.isDefault}, ${t.isEnabled}, ${t.sortOrder}
      )
      ON CONFLICT ("key") DO UPDATE
      SET "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "prompt_instruction" = EXCLUDED."prompt_instruction",
          "icon" = EXCLUDED."icon",
          "updated_at" = now();
    `);
    console.log(`  🌱 Seeded tone: [${t.key}] ${t.name}`);
  }

  // Fetch updated tones & languages map
  const allTones = await db.select().from(systemTones);
  const toneKeyToId = new Map(allTones.map((t) => [t.key, t.id]));

  const allLangs = await db.select().from(systemLanguages);
  const langCodeToId = new Map(allLangs.map((l) => [l.code, l.id]));

  const hiId = langCodeToId.get("hi-IN") || "";
  const enInId = langCodeToId.get("en-IN") || "";
  const enUsId = langCodeToId.get("en-US") || "";
  const mrId = langCodeToId.get("mr-IN") || "";
  const guId = langCodeToId.get("gu-IN") || "";
  const bnId = langCodeToId.get("bn-IN") || "";
  const paId = langCodeToId.get("pa-IN") || "";
  const taId = langCodeToId.get("ta-IN") || "";
  const teId = langCodeToId.get("te-IN") || "";

  // 2. New Voices to insert
  const newVoices = [
    // Cartesia Voices
    {
      slug: "pooja-sonic-35",
      name: "Pooja (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-pooja",
      model: "Sonic-3.5",
      tag: "Most Used",
      gender: "female",
      languages: [hiId, enInId, paId].filter(Boolean),
      tone: toneKeyToId.get("friendly") || "",
      description: "Warm, polite North-Indian female voice suited for customer support & bookings.",
    },
    {
      slug: "vikram-sonic-35",
      name: "Vikram (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-vikram",
      model: "Sonic-3.5",
      tag: "Most Used",
      gender: "male",
      languages: [hiId, enInId, guId].filter(Boolean),
      tone: toneKeyToId.get("authoritative") || "",
      description: "Authoritative, confident male tone for corporate banking & investment advisory.",
    },
    {
      slug: "ananya-sonic-35",
      name: "Ananya (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-ananya",
      model: "Sonic-3.5",
      tag: "Most Used",
      gender: "female",
      languages: [hiId, enInId, bnId].filter(Boolean),
      tone: toneKeyToId.get("enthusiastic") || "",
      description: "High-energy, cheerful female voice for marketing, promotions & retail sales.",
    },
    {
      slug: "rohan-sonic-35",
      name: "Rohan (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-rohan",
      model: "Sonic-3.5",
      tag: "Neutral",
      gender: "male",
      languages: [hiId, enInId, mrId].filter(Boolean),
      tone: toneKeyToId.get("casual") || "",
      description: "Conversational, tech-savvy young male voice for onboarding & technical queries.",
    },
    {
      slug: "meera-sonic-35",
      name: "Meera (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-meera",
      model: "Sonic-3.5",
      tag: "Neutral",
      gender: "female",
      languages: [hiId, enInId, taId].filter(Boolean),
      tone: toneKeyToId.get("sympathetic") || "",
      description: "Gentle, comforting female tone designed for hospital appointments & wellness.",
    },
    {
      slug: "kabir-sonic-35",
      name: "Kabir (Sonic-3.5)",
      provider: "Cartesia",
      voiceId: "sonic-kabir",
      model: "Sonic-3.5",
      tag: "Most Used",
      gender: "male",
      languages: [hiId, enInId, teId].filter(Boolean),
      tone: toneKeyToId.get("direct") || "",
      description: "Deep, crisp, straight-to-the-point male voice for executive alerts & updates.",
    },

    // ElevenLabs Voices
    {
      slug: "antoni-turbo-25",
      name: "Antoni (Turbo v2.5)",
      provider: "ElevenLabs",
      voiceId: "eleven-antoni",
      model: "Turbo v2.5",
      tag: "Most Used",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("enthusiastic") || "",
      description: "Dynamic, charismatic male voice with strong clarity for outbound demos.",
    },
    {
      slug: "bella-multilingual-v2",
      name: "Bella (Multilingual v2)",
      provider: "ElevenLabs",
      voiceId: "eleven-bella",
      model: "Multilingual v2",
      tag: "Most Used",
      gender: "female",
      languages: [enUsId, enInId, hiId].filter(Boolean),
      tone: toneKeyToId.get("playful") || "",
      description: "Charming, playful brand ambassador female voice with natural inflections.",
    },
    {
      slug: "domi-turbo-25",
      name: "Domi (Turbo v2.5)",
      provider: "ElevenLabs",
      voiceId: "eleven-domi",
      model: "Turbo v2.5",
      tag: "Neutral",
      gender: "female",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("direct") || "",
      description: "Strong, assertive, professional female voice for critical enterprise notifications.",
    },
    {
      slug: "elli-multilingual-v2",
      name: "Elli (Multilingual v2)",
      provider: "ElevenLabs",
      voiceId: "eleven-elli",
      model: "Multilingual v2",
      tag: "Neutral",
      gender: "female",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("sympathetic") || "",
      description: "Soft-spoken, pleasant, patient guide for self-service IVR and coaching.",
    },
    {
      slug: "josh-multilingual-v2",
      name: "Josh (Multilingual v2)",
      provider: "ElevenLabs",
      voiceId: "eleven-josh",
      model: "Multilingual v2",
      tag: "Most Used",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("calm") || "",
      description: "Deep, warm, trustworthy male narrator voice for luxury brands & fintech.",
    },

    // Sarvam AI Voices
    {
      slug: "sarvam-dhruv-bulbul",
      name: "Dhruv (Bulbul v1)",
      provider: "Sarvam",
      voiceId: "bulbul-dhruv",
      model: "Bulbul v1",
      tag: "Most Used",
      gender: "male",
      languages: [hiId, guId, mrId].filter(Boolean),
      tone: toneKeyToId.get("enthusiastic") || "",
      description: "Energetic, youthful Indian male voice with natural bilingual Hindi cadence.",
    },
    {
      slug: "sarvam-priya-bulbul",
      name: "Priya (Bulbul v1)",
      provider: "Sarvam",
      voiceId: "bulbul-priya",
      model: "Bulbul v1",
      tag: "Most Used",
      gender: "female",
      languages: [hiId, mrId, bnId].filter(Boolean),
      tone: toneKeyToId.get("friendly") || "",
      description: "Polite, culturally nuanced Indian female voice suited for public sector & retail.",
    },
    {
      slug: "sarvam-tara-bulbul",
      name: "Tara (Bulbul v1)",
      provider: "Sarvam",
      voiceId: "bulbul-tara",
      model: "Bulbul v1",
      tag: "Neutral",
      gender: "female",
      languages: [hiId, taId, teId].filter(Boolean),
      tone: toneKeyToId.get("authoritative") || "",
      description: "Clear, articulate multilingual Indian executive voice.",
    },

    // Google Cloud Voices
    {
      slug: "google-hi-in-wavenet-b",
      name: "Google hi-IN Wavenet B",
      provider: "Google",
      voiceId: "hi-IN-Wavenet-B",
      model: "WaveNet",
      tag: "Neutral",
      gender: "male",
      languages: [hiId, enInId].filter(Boolean),
      tone: toneKeyToId.get("formal") || "",
      description: "Standard Google Cloud WaveNet male voice for automated call routing.",
    },
    {
      slug: "google-en-in-neural2-b",
      name: "Google en-IN Neural2 B",
      provider: "Google",
      voiceId: "en-IN-Neural2-B",
      model: "Neural2",
      tag: "Most Used",
      gender: "male",
      languages: [enInId, hiId].filter(Boolean),
      tone: toneKeyToId.get("authoritative") || "",
      description: "High-definition Google Neural2 Indian male voice with corporate clarity.",
    },
    {
      slug: "google-hi-in-neural2-c",
      name: "Google hi-IN Neural2 C",
      provider: "Google",
      voiceId: "hi-IN-Neural2-C",
      model: "Neural2",
      tag: "Most Used",
      gender: "female",
      languages: [hiId, mrId].filter(Boolean),
      tone: toneKeyToId.get("friendly") || "",
      description: "Expressive Google Neural2 Hindi female voice for interactive voice response.",
    },

    // OpenAI Voices
    {
      slug: "openai-alloy",
      name: "Alloy (OpenAI)",
      provider: "OpenAI",
      voiceId: "alloy",
      model: "TTS-1",
      tag: "Most Used",
      gender: "female",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("professional") || "",
      description: "Neutral, versatile, and well-balanced flagship OpenAI synthetic voice.",
    },
    {
      slug: "openai-echo",
      name: "Echo (OpenAI)",
      provider: "OpenAI",
      voiceId: "echo",
      model: "TTS-1",
      tag: "Most Used",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("calm") || "",
      description: "Smooth, resonant, and reassuring male voice for customer service.",
    },
    {
      slug: "openai-nova",
      name: "Nova (OpenAI)",
      provider: "OpenAI",
      voiceId: "nova",
      model: "TTS-1",
      tag: "Most Used",
      gender: "female",
      languages: [enUsId, enInId, hiId].filter(Boolean),
      tone: toneKeyToId.get("playful") || "",
      description: "Energetic, bright, and delightful female assistant voice.",
    },
    {
      slug: "openai-shimmer",
      name: "Shimmer (OpenAI)",
      provider: "OpenAI",
      voiceId: "shimmer",
      model: "TTS-1",
      tag: "Neutral",
      gender: "female",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("enthusiastic") || "",
      description: "Clear, optimistic, and uplifting female voice for marketing assistants.",
    },
    {
      slug: "openai-fable",
      name: "Fable (OpenAI)",
      provider: "OpenAI",
      voiceId: "fable",
      model: "TTS-1",
      tag: "Neutral",
      gender: "male",
      languages: [enUsId, enInId].filter(Boolean),
      tone: toneKeyToId.get("authoritative") || "",
      description: "Expressive, poised international male voice with commanding presence.",
    },
  ];

  for (const v of newVoices) {
    const audioUrl = `/uploads/voices/${v.slug}.wav`;
    await db.execute(sql`
      INSERT INTO "ai_voices" (
        "slug", "name", "provider", "voice_id", "model", "tag", "gender",
        "languages", "tone", "preview_audio_url", "description", "is_enabled", "sort_order"
      ) VALUES (
        ${v.slug}, ${v.name}, ${v.provider}, ${v.voiceId}, ${v.model}, ${v.tag}, ${v.gender},
        ${JSON.stringify(v.languages)}::jsonb, ${v.tone}, ${audioUrl}, ${v.description}, true, 0
      )
      ON CONFLICT ("slug") DO UPDATE
      SET "name" = EXCLUDED."name",
          "provider" = EXCLUDED."provider",
          "model" = EXCLUDED."model",
          "tag" = EXCLUDED."tag",
          "gender" = EXCLUDED."gender",
          "languages" = EXCLUDED."languages",
          "tone" = EXCLUDED."tone",
          "description" = EXCLUDED."description",
          "updated_at" = now();
    `);
    console.log(`  🎙️ Seeded voice: [${v.provider}] ${v.name} (${v.slug})`);
  }

  console.log("\n🎉 All additional tones and voices seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
