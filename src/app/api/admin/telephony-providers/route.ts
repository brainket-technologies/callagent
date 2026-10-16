import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { telephonyProviders, userTelephonyConfigs } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(telephonyProviders)
      .orderBy(asc(telephonyProviders.createdAt));

    // Get count of user configurations per provider
    const counts = await db
      .select({
        providerSlug: userTelephonyConfigs.providerSlug,
        count: sql<number>`count(*)::int`,
      })
      .from(userTelephonyConfigs)
      .groupBy(userTelephonyConfigs.providerSlug);

    const countMap: Record<string, number> = {};
    for (const c of counts) {
      countMap[c.providerSlug] = c.count;
    }

    return NextResponse.json({
      success: true,
      providers: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        logoUrl: r.logoUrl || "",
        description: r.description || "",
        authType: r.authType,
        docsUrl: r.docsUrl || "",
        isEnabled: Boolean(r.isEnabled),
        createdAt: r.createdAt,
        userCount: countMap[r.slug] || 0,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/admin/telephony-providers error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load telephony providers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, slug, id, name, description, logoUrl, isEnabled, authType, docsUrl } = body;

    // ACTION: TOGGLE ENABLED / DISABLED
    if (action === "toggle") {
      const targetSlug = slug || id;
      if (!targetSlug) {
        return NextResponse.json(
          { success: false, error: "Provider identifier (slug or id) is required" },
          { status: 400 }
        );
      }

      const [existing] = await db
        .select()
        .from(telephonyProviders)
        .where(eq(telephonyProviders.slug, targetSlug))
        .limit(1);

      if (!existing) {
        return NextResponse.json(
          { success: false, error: `Provider '${targetSlug}' not found` },
          { status: 404 }
        );
      }

      const newStatus = isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled;

      await db
        .update(telephonyProviders)
        .set({
          isEnabled: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(telephonyProviders.slug, targetSlug));

      return NextResponse.json({
        success: true,
        message: `Provider '${existing.name}' is now ${newStatus ? "enabled" : "disabled"} for users!`,
        isEnabled: newStatus,
      });
    }

    // ACTION: ADD NEW CARRIER PROVIDER
    if (action === "add" || !action) {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Provider name is required" },
          { status: 400 }
        );
      }

      const cleanSlug = (slug || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

      // Check for conflict
      const [existing] = await db
        .select()
        .from(telephonyProviders)
        .where(eq(telephonyProviders.slug, cleanSlug))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { success: false, error: `A provider with identifier '${cleanSlug}' already exists` },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(telephonyProviders)
        .values({
          slug: cleanSlug,
          name: name.trim(),
          logoUrl: logoUrl?.trim() || "",
          description: description?.trim() || `Enterprise telephony carrier ${name.trim()}`,
          authType: authType || "api_key_and_token",
          docsUrl: docsUrl?.trim() || "",
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: `Telephony carrier '${inserted.name}' added successfully!`,
        provider: inserted,
      });
    }

    // ACTION: UPDATE CARRIER PROVIDER
    if (action === "update") {
      const targetSlug = slug || id;
      if (!targetSlug) {
        return NextResponse.json(
          { success: false, error: "Provider identifier is required" },
          { status: 400 }
        );
      }

      await db
        .update(telephonyProviders)
        .set({
          name: name?.trim(),
          description: description?.trim(),
          logoUrl: logoUrl !== undefined ? logoUrl?.trim() : undefined,
          authType: authType,
          docsUrl: docsUrl?.trim(),
          isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(telephonyProviders.slug, targetSlug));

      return NextResponse.json({
        success: true,
        message: "Carrier provider updated successfully!",
      });
    }

    // ACTION: DELETE CARRIER PROVIDER
    if (action === "delete") {
      const targetSlug = slug || id;
      if (!targetSlug) {
        return NextResponse.json(
          { success: false, error: "Provider identifier is required" },
          { status: 400 }
        );
      }

      await db
        .delete(telephonyProviders)
        .where(eq(telephonyProviders.slug, targetSlug));

      return NextResponse.json({
        success: true,
        message: `Carrier provider removed successfully!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/telephony-providers error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process telephony provider action" },
      { status: 500 }
    );
  }
}
