import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { verifyPassword, hashPassword } from "@/lib/auth-password";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 3) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 3 characters long" },
        { status: 400 }
      );
    }

    const targetEmail = (body.email || "admin").trim().toLowerCase();

    // Get master admin from database
    let [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, targetEmail))
      .limit(1);

    if (!admin) {
      // Fallback to first active admin in table
      [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.isActive, true))
        .limit(1);
    }

    if (!admin || !admin.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Admin account not found in database" },
        { status: 404 }
      );
    }

    // Verify current password with bcrypt
    const isCurrentValid = await verifyPassword(currentPassword, admin.passwordHash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password using bcrypt (10 rounds) - Strictly adhering to security rule
    const newHash = await hashPassword(newPassword);

    // Update admin password in PostgreSQL
    await db
      .update(admins)
      .set({
        passwordHash: newHash,
        updatedAt: new Date(),
      })
      .where(eq(admins.id, admin.id));

    return NextResponse.json({
      success: true,
      message: "Admin password successfully updated in PostgreSQL database!",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update password" },
      { status: 500 }
    );
  }
}
