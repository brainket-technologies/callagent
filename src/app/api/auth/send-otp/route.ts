import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userOtpVerifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendOtpEmail } from "@/lib/mail-sender";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email format (e.g. name@domain.com)" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    const isNewUser = !existingUser;
    // User requested fixed OTP 1234
    const OTP_CODE = "1234";

    // Store in userOtpVerifications table
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await db.insert(userOtpVerifications).values({
      email: cleanEmail,
      otp: OTP_CODE,
      expiresAt,
    });

    // Send email using SMTP configured in Admin settings
    const emailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      otp: OTP_CODE,
      isNewUser,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      isNewUser,
      email: cleanEmail,
      devOtp: OTP_CODE, // provided for seamless dev & testing
      emailDelivered: emailResult.delivered,
    });
  } catch (error: any) {
    console.error("POST /api/auth/send-otp error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to dispatch verification code" },
      { status: 500 }
    );
  }
}
