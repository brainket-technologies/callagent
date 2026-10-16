import { NextResponse } from "next/server";
import { db, schema } from "@/db";

export async function GET() {
  try {
    const allAdmins = await db
      .select({
        id: schema.admins.id,
        email: schema.admins.email,
        name: schema.admins.name,
        isActive: schema.admins.isActive,
        lastLoginAt: schema.admins.lastLoginAt,
        createdAt: schema.admins.createdAt,
      })
      .from(schema.admins);

    return NextResponse.json({ success: true, admins: allAdmins });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch admins" },
      { status: 500 }
    );
  }
}
