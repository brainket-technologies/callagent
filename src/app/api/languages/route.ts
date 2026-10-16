import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemLanguages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(systemLanguages)
      .where(eq(systemLanguages.isEnabled, true))
      .orderBy(asc(systemLanguages.sortOrder), asc(systemLanguages.name));

    return NextResponse.json({
      success: true,
      languages: rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        nativeName: r.nativeName,
        flagEmoji: r.flagEmoji,
        sampleText: r.sampleText,
        isPrimary: r.isPrimary,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/languages error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load languages" },
      { status: 500 }
    );
  }
}
