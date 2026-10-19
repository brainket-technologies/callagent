import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userTelephonyConfigs, telephonyProviders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const workspaceIdParam = url.searchParams.get("workspaceId");

    let targetWorkspaceId = workspaceIdParam;
    if (!targetWorkspaceId) {
      const sessionCookie = req.cookies.get("voxera_session")?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(sessionCookie);
          if (parsed.workspaceId) targetWorkspaceId = parsed.workspaceId;
        } catch {}
      }
    }

    let query = db.select().from(userTelephonyConfigs);

    const configs = targetWorkspaceId
      ? await query
          .where(eq(userTelephonyConfigs.workspaceId, targetWorkspaceId))
          .orderBy(desc(userTelephonyConfigs.createdAt))
      : await query.orderBy(desc(userTelephonyConfigs.createdAt));

    return NextResponse.json({
      success: true,
      configs: configs.map((c) => ({
        id: c.id,
        workspaceId: c.workspaceId,
        userId: c.userId,
        providerSlug: c.providerSlug,
        name: c.name,
        phoneNumber: c.phoneNumber,
        status: c.status,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/user/telephony-configs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load user telephony configs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { providerSlug, name, phoneNumber, apiKey, authToken, workspaceId, userId } = body;

    // Auto-resolve workspaceId and userId from session if not explicitly provided
    if (!workspaceId || !userId) {
      const sessionCookie = req.cookies.get("voxera_session")?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(sessionCookie);
          if (!workspaceId && parsed.workspaceId) workspaceId = parsed.workspaceId;
          if (!userId && parsed.userId) userId = parsed.userId;
        } catch {}
      }
    }

    if (!providerSlug) {
      return NextResponse.json(
        { success: false, error: "Telephony provider is required" },
        { status: 400 }
      );
    }
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Account / Trunk name is required" },
        { status: 400 }
      );
    }
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { success: false, error: "API Key / Account SID is required" },
        { status: 400 }
      );
    }
    if (!authToken || !authToken.trim()) {
      return NextResponse.json(
        { success: false, error: "Auth Token / Secret is required" },
        { status: 400 }
      );
    }

    // Verify provider is supported and enabled
    const [provider] = await db
      .select()
      .from(telephonyProviders)
      .where(eq(telephonyProviders.slug, providerSlug))
      .limit(1);

    if (!provider || !provider.isEnabled) {
      return NextResponse.json(
        { success: false, error: "Selected provider is not currently active on this platform" },
        { status: 400 }
      );
    }

    const [saved] = await db
      .insert(userTelephonyConfigs)
      .values({
        workspaceId: workspaceId || null,
        userId: userId || null,
        providerSlug,
        name: name.trim(),
        phoneNumber: phoneNumber?.trim() || null,
        apiKey: apiKey.trim(),
        authToken: authToken.trim(),
        status: "active",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `${provider.name} credentials and number connected successfully!`,
      config: {
        id: saved.id,
        workspaceId: saved.workspaceId,
        userId: saved.userId,
        providerSlug: saved.providerSlug,
        name: saved.name,
        phoneNumber: saved.phoneNumber,
        status: saved.status,
      },
    });
  } catch (error: any) {
    console.error("POST /api/user/telephony-configs error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save telephony credentials" },
      { status: 500 }
    );
  }
}
