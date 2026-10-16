import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemTones } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(systemTones)
      .orderBy(asc(systemTones.sortOrder), asc(systemTones.name));

    return NextResponse.json({
      success: true,
      tones: rows.map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        industry: r.industry || "General",
        description: r.description || "",
        promptInstruction: r.promptInstruction || "",
        sampleText: r.sampleText || "",
        sampleTextEn: r.sampleTextEn || "",
        icon: r.icon || "💼",
        audioRate: r.audioRate || "1.00",
        audioPitch: r.audioPitch || "1.00",
        isDefault: Boolean(r.isDefault),
        isEnabled: Boolean(r.isEnabled),
        sortOrder: r.sortOrder ?? 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/admin/tones error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load tones" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, key, name, industry, description, promptInstruction, sampleText, sampleTextEn, icon, audioRate, audioPitch, isDefault, isEnabled, sortOrder } = body;

    // 1. ACTION: TOGGLE
    if (action === "toggle") {
      const targetKey = key || id;
      if (!targetKey) {
        return NextResponse.json(
          { success: false, error: "Tone identifier is required" },
          { status: 400 }
        );
      }

      const [existing] = await db
        .select()
        .from(systemTones)
        .where(eq(systemTones.key, targetKey))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: `Tone '${targetKey}' not found` },
          { status: 404 }
        );
      }

      const newStatus = isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled;

      await db
        .update(systemTones)
        .set({
          isEnabled: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(systemTones.key, targetKey));

      return NextResponse.json({
        success: true,
        message: `Tone '${existing.name}' is now ${newStatus ? "enabled" : "disabled"} for assistants!`,
        isEnabled: newStatus,
      });
    }

    // 2. ACTION: ADD NEW TONE
    if (action === "add" || !action) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Tone name is required" },
          { status: 400 }
        );
      }

      const cleanKey = (key || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const [existing] = await db
        .select()
        .from(systemTones)
        .where(eq(systemTones.key, cleanKey))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { success: false, error: `Tone with key '${cleanKey}' already exists` },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(systemTones)
        .values({
          key: cleanKey,
          name: name.trim(),
          industry: industry?.trim() || "General",
          description: description?.trim() || "",
          promptInstruction: promptInstruction?.trim() || "",
          sampleText: sampleText?.trim() || null,
          sampleTextEn: sampleTextEn?.trim() || null,
          icon: icon?.trim() || "💼",
          audioRate: audioRate?.trim() || "1.00",
          audioPitch: audioPitch?.trim() || "1.00",
          isDefault: Boolean(isDefault),
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: `Tone '${inserted.name}' added successfully!`,
        tone: inserted,
      });
    }

    // 3. ACTION: UPDATE
    if (action === "update") {
      const targetKey = key || id;
      if (!targetKey) {
        return NextResponse.json(
          { success: false, error: "Tone identifier is required" },
          { status: 400 }
        );
      }

      await db
        .update(systemTones)
        .set({
          name: name?.trim(),
          industry: industry !== undefined ? industry?.trim() : undefined,
          description: description?.trim(),
          promptInstruction: promptInstruction?.trim(),
          sampleText: sampleText !== undefined ? sampleText?.trim() : undefined,
          sampleTextEn: sampleTextEn !== undefined ? sampleTextEn?.trim() : undefined,
          icon: icon?.trim(),
          audioRate: audioRate !== undefined ? String(audioRate).trim() : undefined,
          audioPitch: audioPitch !== undefined ? String(audioPitch).trim() : undefined,
          isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
          sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
          updatedAt: new Date(),
        })
        .where(eq(systemTones.key, targetKey));

      return NextResponse.json({
        success: true,
        message: `Tone updated successfully!`,
      });
    }

    // 4. ACTION: DELETE
    if (action === "delete") {
      const targetKey = key || id;
      if (!targetKey) {
        return NextResponse.json(
          { success: false, error: "Tone identifier is required" },
          { status: 400 }
        );
      }

      await db
        .delete(systemTones)
        .where(eq(systemTones.key, targetKey));

      return NextResponse.json({
        success: true,
        message: `Tone removed successfully!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/tones error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process tone action" },
      { status: 500 }
    );
  }
}
