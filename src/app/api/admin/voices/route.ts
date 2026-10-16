import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiVoices, systemLanguages, systemTones } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    const [rows, allLanguages, allTones] = await Promise.all([
      provider && provider.toLowerCase() !== "all"
        ? db
            .select()
            .from(aiVoices)
            .where(eq(aiVoices.provider, provider))
            .orderBy(asc(aiVoices.sortOrder), desc(aiVoices.createdAt))
        : db
            .select()
            .from(aiVoices)
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
              rate: Number(toneObj.audioRate || 1.0),
              pitch: Number(toneObj.audioPitch || 1.0),
              promptInstruction: toneObj.promptInstruction || "",
              description: toneObj.description || "",
            }
          : null;

        return {
          id: r.id,
          slug: r.slug,
          name: r.name,
          provider: r.provider,
          voiceId: r.voiceId,
          model: r.model || "",
          tag: r.tag || "",
          gender: r.gender || "",
          languages: langIds,
          resolvedLanguages,
          tone: r.tone || "",
          resolvedTone,
          previewAudioUrl: r.previewAudioUrl || "",
          description: r.description || "",
          isEnabled: Boolean(r.isEnabled),
          sortOrder: r.sortOrder ?? 0,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }),
    });
  } catch (error: any) {
    console.error("GET /api/admin/voices error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load voices" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      id,
      slug,
      name,
      provider,
      voiceId,
      model,
      tag,
      gender,
      languages,
      tone,
      previewAudioUrl,
      description,
      isEnabled,
      sortOrder,
    } = body;

    // 1. ACTION: TOGGLE ENABLED / DISABLED
    if (action === "toggle") {
      const targetSlug = slug || id;
      if (!targetSlug) {
        return NextResponse.json(
          { success: false, error: "Voice identifier is required" },
          { status: 400 }
        );
      }

      const [existing] = await db
        .select()
        .from(aiVoices)
        .where(eq(aiVoices.slug, targetSlug))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: `Voice '${targetSlug}' not found` },
          { status: 404 }
        );
      }

      const newStatus = isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled;

      await db
        .update(aiVoices)
        .set({
          isEnabled: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(aiVoices.slug, targetSlug));

      return NextResponse.json({
        success: true,
        message: `Voice '${existing.name}' is now ${newStatus ? "enabled" : "disabled"} for assistants!`,
        isEnabled: newStatus,
      });
    }

    // 2. ACTION: ADD NEW VOICE
    if (action === "add" || !action) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Voice name is required" },
          { status: 400 }
        );
      }

      if (!provider || !provider.trim()) {
        return NextResponse.json(
          { success: false, error: "Voice provider is required" },
          { status: 400 }
        );
      }

      const cleanSlug = (slug || `${provider}-${name}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check conflict
      const [existing] = await db
        .select()
        .from(aiVoices)
        .where(eq(aiVoices.slug, cleanSlug))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { success: false, error: `Voice with slug '${cleanSlug}' already exists` },
          { status: 400 }
        );
      }

      const assignedLanguages = Array.isArray(languages) ? languages : [];
      const assignedTone = tone?.trim() || "";

      let resolvedAudioUrl = previewAudioUrl?.trim() || "";
      if (!resolvedAudioUrl && assignedTone) {
        const [targetTone] = await db
          .select()
          .from(systemTones)
          .where(eq(systemTones.id, assignedTone))
          .limit(1);
        if (targetTone) {
          resolvedAudioUrl = `/uploads/voices/${cleanSlug}-${targetTone.key}.wav`;
        }
      }

      const [inserted] = await db
        .insert(aiVoices)
        .values({
          slug: cleanSlug,
          name: name.trim(),
          provider: provider.trim(),
          voiceId: voiceId?.trim() || cleanSlug,
          model: model?.trim() || "",
          tag: tag?.trim() || "",
          gender: gender?.trim() || "",
          languages: assignedLanguages,
          tone: assignedTone,
          previewAudioUrl: resolvedAudioUrl,
          description: description?.trim() || "",
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: `Voice '${inserted.name}' added successfully!`,
        voice: inserted,
      });
    }

    // 3. ACTION: UPDATE EXISTING VOICE
    if (action === "update") {
      const targetSlug = slug || id;
      if (!targetSlug) {
        return NextResponse.json(
          { success: false, error: "Voice identifier is required" },
          { status: 400 }
        );
      }

      let resolvedAudioUrl = previewAudioUrl !== undefined ? previewAudioUrl?.trim() : undefined;
      if (tone !== undefined && (!resolvedAudioUrl || resolvedAudioUrl.startsWith("/uploads/voices/"))) {
        const [targetTone] = await db
          .select()
          .from(systemTones)
          .where(eq(systemTones.id, tone))
          .limit(1);
        if (targetTone) {
          resolvedAudioUrl = `/uploads/voices/${targetSlug}-${targetTone.key}.wav`;
        }
      }

      await db
        .update(aiVoices)
        .set({
          name: name?.trim(),
          provider: provider?.trim(),
          voiceId: voiceId?.trim(),
          model: model?.trim(),
          tag: tag?.trim(),
          gender: gender,
          languages: Array.isArray(languages) ? languages : undefined,
          tone: tone !== undefined ? tone?.trim() : undefined,
          previewAudioUrl: resolvedAudioUrl,
          description: description?.trim(),
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
          sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
          updatedAt: new Date(),
        })
        .where(eq(aiVoices.slug, targetSlug));

      return NextResponse.json({
        success: true,
        message: `Voice updated successfully!`,
      });
    }

    // 4. ACTION: DELETE VOICE
    if (action === "delete") {
      const targetSlug = slug || id;
      if (!targetSlug) {
        return NextResponse.json(
          { success: false, error: "Voice identifier is required" },
          { status: 400 }
        );
      }

      await db
        .delete(aiVoices)
        .where(eq(aiVoices.slug, targetSlug));

      return NextResponse.json({
        success: true,
        message: `Voice removed successfully!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/voices error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process voice action" },
      { status: 500 }
    );
  }
}
