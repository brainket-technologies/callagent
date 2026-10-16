import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiVoices, systemLanguages, systemTones, systemSettings } from "@/db/schema";
import { eq, or, ilike, inArray, asc } from "drizzle-orm";

interface VoiceEngineDbConfig {
  indicVoiceNames: Record<string, { hi: string; mr: string; gu: string; bn: string; ta?: string; te?: string; kn?: string }>;
  noveltyVoices: string[];
  femaleVoices: string[];
  maleVoices: string[];
  toneAudioProfiles: Record<string, { rate: string | number; pitch: string | number }>;
}

async function loadDbEngineConfig(): Promise<{
  config: VoiceEngineDbConfig;
  languages: Array<{ id: string; code: string; name: string; nativeName?: string | null; flagEmoji?: string | null; sampleText?: string | null }>;
  tones: Array<{ id: string; key: string; name: string; icon?: string | null; audioRate?: string | null; audioPitch?: string | null }>;
}> {
  const [settingsRow, allLangs, allTones] = await Promise.all([
    db.select().from(systemSettings).where(eq(systemSettings.key, "voice_engine_config")).limit(1),
    db.select().from(systemLanguages).where(eq(systemLanguages.isEnabled, true)).orderBy(asc(systemLanguages.sortOrder)),
    db.select().from(systemTones).where(eq(systemTones.isEnabled, true)).orderBy(asc(systemTones.sortOrder)),
  ]);

  const rawConfig = (settingsRow[0]?.data as any) || {};

  // Build tone audio profiles directly from system_tones table in DB
  const toneAudioProfiles: Record<string, { rate: number; pitch: number }> = {};
  allTones.forEach((t) => {
    toneAudioProfiles[t.key] = {
      rate: Number(t.audioRate || 1.0),
      pitch: Number(t.audioPitch || 1.0),
    };
  });

  const config: VoiceEngineDbConfig = {
    indicVoiceNames: rawConfig.indicVoiceNames || {},
    noveltyVoices: rawConfig.noveltyVoices || [],
    femaleVoices: rawConfig.femaleVoices || [],
    maleVoices: rawConfig.maleVoices || [],
    toneAudioProfiles: {
      ...(rawConfig.toneAudioProfiles || {}),
      ...toneAudioProfiles,
    },
  };

  return {
    config,
    languages: allLangs,
    tones: allTones,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voiceIdQuery = searchParams.get("voiceId") || searchParams.get("slug") || searchParams.get("id");

    const { config, languages, tones } = await loadDbEngineConfig();

    let matchedVoice: any = null;
    if (voiceIdQuery) {
      const rows = await db
        .select()
        .from(aiVoices)
        .where(
          or(
            eq(aiVoices.id, voiceIdQuery as any),
            eq(aiVoices.voiceId, voiceIdQuery),
            eq(aiVoices.slug, voiceIdQuery),
            ilike(aiVoices.name, `%${voiceIdQuery}%`)
          )
        )
        .limit(1);

      if (rows.length > 0) {
        matchedVoice = rows[0];
      }
    }

    return NextResponse.json({
      success: true,
      config,
      languages: languages.map((l) => ({
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
        flagEmoji: l.flagEmoji,
        sampleText: l.sampleText,
      })),
      tones: tones.map((t) => ({
        key: t.key,
        name: t.name,
        icon: t.icon,
        rate: Number(t.audioRate || 1.0),
        pitch: Number(t.audioPitch || 1.0),
      })),
      voice: matchedVoice,
    });
  } catch (err: any) {
    console.error("GET /api/voice-engine/resolve error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load voice engine config" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voiceId, voiceSlug, voiceName, language, tone, gender, text } = body;

    const { config, languages, tones } = await loadDbEngineConfig();

    const langMapByCode = new Map(languages.map((l) => [l.code.toLowerCase(), l]));
    const langMapById = new Map(languages.map((l) => [l.id, l]));

    const toneMapByKey = new Map(tones.map((t) => [t.key.toLowerCase(), t]));
    const toneMapById = new Map(tones.map((t) => [t.id, t]));

    // 1. Resolve Voice from DB using voiceId / voiceSlug / voiceName
    let dbVoice: any = null;
    const lookupTarget = voiceId || voiceSlug || voiceName;

    if (lookupTarget) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lookupTarget);

      const conditions = [
        eq(aiVoices.voiceId, lookupTarget),
        eq(aiVoices.slug, lookupTarget),
        ilike(aiVoices.name, `%${lookupTarget}%`),
      ];
      if (isUuid) {
        conditions.push(eq(aiVoices.id, lookupTarget as any));
      }

      const rows = await db
        .select()
        .from(aiVoices)
        .where(or(...conditions))
        .limit(1);

      if (rows.length > 0) {
        dbVoice = rows[0];
      }
    }

    // 2. Connect voice with DB Languages and DB Tone
    let resolvedVoiceName = dbVoice?.name || voiceName || "Assistant";
    let resolvedGender = (gender || dbVoice?.gender || "female").toLowerCase();
    let resolvedPreviewAudioUrl = dbVoice?.previewAudioUrl || "";
    let resolvedVoiceSlug = dbVoice?.slug || voiceSlug || "";

    // Resolve Connected Tone from DB
    let resolvedToneKey = (tone || "").toLowerCase().trim();
    if (!resolvedToneKey && dbVoice?.tone) {
      const toneFromId = toneMapById.get(dbVoice.tone);
      const toneFromKey = toneMapByKey.get(dbVoice.tone.toLowerCase());
      resolvedToneKey = toneFromId?.key || toneFromKey?.key || dbVoice.tone;
    }
    if (!resolvedToneKey) {
      resolvedToneKey = "professional";
    }

    const matchedToneObj = toneMapByKey.get(resolvedToneKey) || toneMapById.get(resolvedToneKey);
    const resolvedTone = {
      key: resolvedToneKey,
      name: matchedToneObj?.name || resolvedToneKey,
      icon: matchedToneObj?.icon || "💼",
      rate: Number(matchedToneObj?.audioRate || config.toneAudioProfiles[resolvedToneKey]?.rate || 1.0),
      pitch: Number(matchedToneObj?.audioPitch || config.toneAudioProfiles[resolvedToneKey]?.pitch || 1.0),
    };

    // Resolve Connected Language from DB
    let resolvedLangCode = (language || "").trim();
    if (!resolvedLangCode && dbVoice?.languages) {
      const voiceLangIds = (dbVoice.languages as string[]) || [];
      if (voiceLangIds.length > 0) {
        const firstLangObj = langMapById.get(voiceLangIds[0]) || langMapByCode.get(voiceLangIds[0].toLowerCase());
        if (firstLangObj) {
          resolvedLangCode = firstLangObj.code;
        }
      }
    }
    if (!resolvedLangCode) {
      resolvedLangCode = "en-US";
    }

    const matchedLangObj =
      langMapByCode.get(resolvedLangCode.toLowerCase()) ||
      langMapByCode.get(resolvedLangCode.toLowerCase().split("-")[0]);

    const resolvedLanguage = {
      code: resolvedLangCode,
      name: matchedLangObj?.name || resolvedLangCode,
      nativeName: matchedLangObj?.nativeName || "",
      flagEmoji: matchedLangObj?.flagEmoji || "🌐",
      sampleText: matchedLangObj?.sampleText || "",
    };

    // 3. Localize voice name for Indic languages from DB config
    const cleanVoiceName = resolvedVoiceName.replace(/\(.*?\)/g, "").trim();
    const langPrefix = resolvedLangCode.toLowerCase().split("-")[0];
    const isIndic = ["hi", "mr", "gu", "bn", "ta", "te", "kn", "ml", "pa"].includes(langPrefix);

    const nameKey = cleanVoiceName.toLowerCase().trim();
    const localizedMap = config.indicVoiceNames[nameKey];
    let effectiveLocalizedName = cleanVoiceName;
    if (localizedMap) {
      if (langPrefix === "gu" && localizedMap.gu) effectiveLocalizedName = localizedMap.gu;
      else if (langPrefix === "mr" && localizedMap.mr) effectiveLocalizedName = localizedMap.mr;
      else if (langPrefix === "bn" && localizedMap.bn) effectiveLocalizedName = localizedMap.bn;
      else if (langPrefix === "ta" && localizedMap.ta) effectiveLocalizedName = localizedMap.ta;
      else if (langPrefix === "te" && localizedMap.te) effectiveLocalizedName = localizedMap.te;
      else if (langPrefix === "kn" && localizedMap.kn) effectiveLocalizedName = localizedMap.kn;
      else if (localizedMap.hi) effectiveLocalizedName = localizedMap.hi;
    }

    // 4. Interpolate and Sanitize Text directly from DB
    let spokenText = (text || "").trim();
    if (!spokenText) {
      spokenText = matchedLangObj?.sampleText || (
        isIndic
          ? `नमस्ते, मैं ${effectiveLocalizedName} हूँ, आपकी सभी व्यावसायिक कॉल्स को आसानी से संभालने के लिए मैं तैयार हूँ`
          : `Hello, I am ${cleanVoiceName}. I am ready to handle your business communications with ease`
      );
    }

    spokenText = spokenText
      .replace(/\$\{\s*name\s*\}/gi, isIndic ? effectiveLocalizedName : cleanVoiceName)
      .replace(/\$\(\s*name\s*\)/gi, isIndic ? effectiveLocalizedName : cleanVoiceName)
      .replace(/\{\s*name\s*\}/gi, isIndic ? effectiveLocalizedName : cleanVoiceName)
      .replace(/\$name\b/gi, isIndic ? effectiveLocalizedName : cleanVoiceName);

    return NextResponse.json({
      success: true,
      voice: {
        id: dbVoice?.id || null,
        slug: resolvedVoiceSlug,
        name: cleanVoiceName,
        fullName: resolvedVoiceName,
        localizedName: effectiveLocalizedName,
        gender: resolvedGender,
        provider: dbVoice?.provider || "System",
        previewAudioUrl: resolvedPreviewAudioUrl,
      },
      resolvedLanguage,
      resolvedTone,
      spokenText,
      config,
    });
  } catch (err: any) {
    console.error("POST /api/voice-engine/resolve error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to resolve voice parameters from database" },
      { status: 500 }
    );
  }
}
