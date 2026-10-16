import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemLanguages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(systemLanguages)
      .orderBy(asc(systemLanguages.sortOrder), asc(systemLanguages.name));

    return NextResponse.json({
      success: true,
      languages: rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        nativeName: r.nativeName || "",
        flagEmoji: r.flagEmoji || "🇮🇳",
        sampleText: r.sampleText || "",
        isPrimary: Boolean(r.isPrimary),
        isEnabled: Boolean(r.isEnabled),
        sortOrder: r.sortOrder ?? 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/admin/languages error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load languages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, code, name, nativeName, flagEmoji, sampleText, isPrimary, isEnabled, sortOrder } = body;

    // 1. ACTION: TOGGLE ENABLED / DISABLED
    if (action === "toggle") {
      const targetCode = code || id;
      if (!targetCode) {
        return NextResponse.json(
          { success: false, error: "Language identifier is required" },
          { status: 400 }
        );
      }

      const [existing] = await db
        .select()
        .from(systemLanguages)
        .where(eq(systemLanguages.code, targetCode))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: `Language '${targetCode}' not found` },
          { status: 404 }
        );
      }

      const newStatus = isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled;

      await db
        .update(systemLanguages)
        .set({
          isEnabled: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(systemLanguages.code, targetCode));

      return NextResponse.json({
        success: true,
        message: `Language '${existing.name}' is now ${newStatus ? "enabled" : "disabled"} for assistants!`,
        isEnabled: newStatus,
      });
    }

    // 2. ACTION: ADD NEW LANGUAGE
    if (action === "add" || !action) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Language name is required" },
          { status: 400 }
        );
      }

      if (!code || !code.trim()) {
        return NextResponse.json(
          { success: false, error: "Language locale code (e.g. mr-IN, hi-IN) is required" },
          { status: 400 }
        );
      }

      const cleanCode = code.trim();

      // Check conflict
      const [existing] = await db
        .select()
        .from(systemLanguages)
        .where(eq(systemLanguages.code, cleanCode))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { success: false, error: `Language with code '${cleanCode}' already exists` },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(systemLanguages)
        .values({
          code: cleanCode,
          name: name.trim(),
          nativeName: nativeName?.trim() || name.trim(),
          flagEmoji: flagEmoji?.trim() || "🇮🇳",
          sampleText: sampleText?.trim() || null,
          isPrimary: Boolean(isPrimary),
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: `Language '${inserted.name}' added successfully!`,
        language: inserted,
      });
    }

    // 3. ACTION: UPDATE EXISTING LANGUAGE
    if (action === "update") {
      const targetCode = code || id;
      if (!targetCode) {
        return NextResponse.json(
          { success: false, error: "Language identifier is required" },
          { status: 400 }
        );
      }

      await db
        .update(systemLanguages)
        .set({
          name: name?.trim(),
          nativeName: nativeName?.trim(),
          flagEmoji: flagEmoji?.trim(),
          sampleText: sampleText !== undefined ? (sampleText?.trim() || null) : undefined,
          isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : undefined,
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
          sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
          updatedAt: new Date(),
        })
        .where(eq(systemLanguages.code, targetCode));

      return NextResponse.json({
        success: true,
        message: `Language updated successfully!`,
      });
    }

    // 4. ACTION: DELETE LANGUAGE
    if (action === "delete") {
      const targetCode = code || id;
      if (!targetCode) {
        return NextResponse.json(
          { success: false, error: "Language identifier is required" },
          { status: 400 }
        );
      }

      await db
        .delete(systemLanguages)
        .where(eq(systemLanguages.code, targetCode));

      return NextResponse.json({
        success: true,
        message: `Language removed successfully!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/languages error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process language action" },
      { status: 500 }
    );
  }
}
