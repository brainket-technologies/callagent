import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: tools.slug,
        name: tools.name,
        desc: tools.description,
        icon: tools.icon,
        isEnabled: tools.isEnabled,
        configKey: tools.configKey,
        createdAt: tools.createdAt,
      })
      .from(tools)
      .orderBy(asc(tools.createdAt));

    return NextResponse.json({
      success: true,
      tools: rows.map((r) => ({
        id: r.id,
        name: r.name,
        desc: r.desc || "",
        icon: r.icon || "",
        isEnabled: Boolean(r.isEnabled),
        configKey: r.configKey || "",
      })),
    });
  } catch (error: any) {
    console.error("GET /api/admin/tools-config error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load tools from database" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isEnabled, configKey } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Tool ID is required" },
        { status: 400 }
      );
    }

    // Check if tool exists in tools table
    const [existing] = await db
      .select()
      .from(tools)
      .where(eq(tools.slug, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Tool '${id}' not found in database` },
        { status: 404 }
      );
    }

    // Update the tool in PostgreSQL tools table
    await db
      .update(tools)
      .set({
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : existing.isEnabled,
        configKey: configKey !== undefined ? String(configKey) : existing.configKey,
        updatedAt: new Date(),
      })
      .where(eq(tools.slug, id));

    // Fetch updated tools list
    const updatedRows = await db
      .select({
        id: tools.slug,
        name: tools.name,
        desc: tools.description,
        icon: tools.icon,
        isEnabled: tools.isEnabled,
        configKey: tools.configKey,
      })
      .from(tools)
      .orderBy(asc(tools.createdAt));

    return NextResponse.json({
      success: true,
      message: `Tool '${existing.name}' updated in PostgreSQL database!`,
      tools: updatedRows.map((r) => ({
        id: r.id,
        name: r.name,
        desc: r.desc || "",
        icon: r.icon || "",
        isEnabled: Boolean(r.isEnabled),
        configKey: r.configKey || "",
      })),
    });
  } catch (error: any) {
    console.error("POST /api/admin/tools-config error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update tool in database" },
      { status: 500 }
    );
  }
}
