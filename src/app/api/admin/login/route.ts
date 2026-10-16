import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth-password";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Username/Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query admin from PostgreSQL admins table
    let [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, cleanEmail))
      .limit(1);

    // If not found by exact string, fallback to active master admin if 'admin' was entered
    if (!admin && (cleanEmail === "admin" || cleanEmail.startsWith("admin"))) {
      [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.isActive, true))
        .limit(1);
    }

    if (!admin || !admin.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Verify password strictly against bcrypt hash in PostgreSQL
    const isValid = await verifyPassword(password.trim(), admin.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // Update lastLoginAt in database
    await db
      .update(admins)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(admins.id, admin.id));

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Authentication error" },
      { status: 500 }
    );
  }
}
