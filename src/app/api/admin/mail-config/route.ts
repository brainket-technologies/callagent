import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const SETTING_KEY = "mail";

const DEFAULT_MAIL_CONFIG = {
  smtpHost: "smtp.sendgrid.net",
  smtpPort: "587",
  smtpUser: "apikey",
  smtpPass: "••••••••••••••••••••",
  fromEmail: "notifications@voxera.ai",
  fromName: "Voxera AI Cloud",
};

export async function GET() {
  try {
    const [row] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, SETTING_KEY))
      .limit(1);

    if (!row || !row.data) {
      return NextResponse.json({
        success: true,
        config: DEFAULT_MAIL_CONFIG,
      });
    }

    const data = row.data as Record<string, any>;

    return NextResponse.json({
      success: true,
      config: {
        smtpHost: data.smtpHost || DEFAULT_MAIL_CONFIG.smtpHost,
        smtpPort: data.smtpPort || DEFAULT_MAIL_CONFIG.smtpPort,
        smtpUser: data.smtpUser || DEFAULT_MAIL_CONFIG.smtpUser,
        smtpPass: data.smtpPass || "",
        fromEmail: data.fromEmail || DEFAULT_MAIL_CONFIG.fromEmail,
        fromName: data.fromName || DEFAULT_MAIL_CONFIG.fromName,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/mail-config error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load mail configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName } = body;

    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, SETTING_KEY))
      .limit(1);

    const updatedData = {
      smtpHost: smtpHost !== undefined ? smtpHost : (existing?.data as any)?.smtpHost || DEFAULT_MAIL_CONFIG.smtpHost,
      smtpPort: smtpPort !== undefined ? String(smtpPort) : (existing?.data as any)?.smtpPort || DEFAULT_MAIL_CONFIG.smtpPort,
      smtpUser: smtpUser !== undefined ? smtpUser : (existing?.data as any)?.smtpUser || DEFAULT_MAIL_CONFIG.smtpUser,
      smtpPass: smtpPass !== undefined ? smtpPass : (existing?.data as any)?.smtpPass || "",
      fromEmail: fromEmail !== undefined ? fromEmail : (existing?.data as any)?.fromEmail || DEFAULT_MAIL_CONFIG.fromEmail,
      fromName: fromName !== undefined ? fromName : (existing?.data as any)?.fromName || DEFAULT_MAIL_CONFIG.fromName,
    };

    if (existing) {
      await db
        .update(systemSettings)
        .set({
          data: updatedData,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existing.id));
    } else {
      await db.insert(systemSettings).values({
        key: SETTING_KEY,
        data: updatedData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Custom SMTP settings successfully saved to PostgreSQL database!",
      config: updatedData,
    });
  } catch (error: any) {
    console.error("POST /api/admin/mail-config error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save mail configuration" },
      { status: 500 }
    );
  }
}
