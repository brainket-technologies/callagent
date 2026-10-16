import { NextResponse } from "next/server";
import { db } from "@/db";
import { telephonyProviders } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: telephonyProviders.id,
        slug: telephonyProviders.slug,
        name: telephonyProviders.name,
        logoUrl: telephonyProviders.logoUrl,
        description: telephonyProviders.description,
        authType: telephonyProviders.authType,
        docsUrl: telephonyProviders.docsUrl,
      })
      .from(telephonyProviders)
      .where(eq(telephonyProviders.isEnabled, true))
      .orderBy(asc(telephonyProviders.name));

    return NextResponse.json({
      success: true,
      providers: rows,
    });
  } catch (error: any) {
    console.error("GET /api/telephony-providers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load active telephony providers" },
      { status: 500 }
    );
  }
}
