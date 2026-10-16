import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemTones } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industryFilter = searchParams.get("industry");

    const rows = await db
      .select()
      .from(systemTones)
      .where(eq(systemTones.isEnabled, true))
      .orderBy(asc(systemTones.sortOrder), asc(systemTones.name));

    const filtered = industryFilter
      ? rows.filter((r) => r.industry?.toLowerCase() === industryFilter.toLowerCase())
      : rows;

    return NextResponse.json({
      success: true,
      tones: filtered.map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        industry: r.industry || "General",
        description: r.description,
        promptInstruction: r.promptInstruction,
        icon: r.icon,
        audioRate: r.audioRate || "1.00",
        audioPitch: r.audioPitch || "1.00",
        isDefault: r.isDefault,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/tones error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load tones" },
      { status: 500 }
    );
  }
}
