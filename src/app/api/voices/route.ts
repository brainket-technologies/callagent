import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiVoices, systemLanguages, systemTones } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    const [rows, allLanguages, allTones] = await Promise.all([
      provider && provider.toLowerCase() !== "all"
        ? db
            .select()
            .from(aiVoices)
            .where(
              and(
                eq(aiVoices.isEnabled, true),
                eq(aiVoices.provider, provider)
              )
            )
            .orderBy(asc(aiVoices.sortOrder), desc(aiVoices.createdAt))
        : db
            .select()
            .from(aiVoices)
            .where(eq(aiVoices.isEnabled, true))
            .orderBy(asc(aiVoices.sortOrder), desc(aiVoices.createdAt)),
      db.select().from(systemLanguages),
      db.select().from(systemTones),
    ]);

    const langMap = new Map();
    allLanguages.forEach((l) => {
      langMap.set(l.id, l);
      langMap.set(l.code, l);
    });

    const toneMap = new Map();
    allTones.forEach((t) => {
      toneMap.set(t.id, t);
      toneMap.set(t.key, t);
    });

    return NextResponse.json({
      success: true,
      voices: rows.map((r) => {
        const langIds = (r.languages as string[]) || [];
        const resolvedLanguages = langIds.map((id) => {
          const l = langMap.get(id);
          return {
            id: l?.id || id,
            code: l?.code || id,
            name: l?.name || id,
            nativeName: l?.nativeName || "",
            flagEmoji: l?.flagEmoji || "🌐",
            sampleText: l?.sampleText || "",
          };
        });

        const toneObj = r.tone ? toneMap.get(r.tone) : null;
        const resolvedTone = toneObj
          ? {
              id: toneObj.id || r.tone,
              key: toneObj.key || "",
              name: toneObj.name || "",
              icon: toneObj.icon || "",
            }
          : null;

        return {
          id: r.id,
          slug: r.slug,
          name: r.name,
          provider: r.provider,
          voiceId: r.voiceId,
          model: r.model,
          tag: r.tag,
          gender: r.gender,
          languages: langIds,
          resolvedLanguages,
          tone: r.tone || "",
          resolvedTone,
          previewAudioUrl: r.previewAudioUrl,
          description: r.description,
        };
      }),
    });
  } catch (error: any) {
    console.error("GET /api/voices error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch voices" },
      { status: 500 }
    );
  }
}
