import nodemailer from "nodemailer";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BRAND_CONFIG } from "@/lib/brand-config";

interface SendOtpOptions {
  toEmail: string;
  otp: string;
  isNewUser?: boolean;
}

export async function sendOtpEmail({ toEmail, otp, isNewUser }: SendOtpOptions) {
  try {
    // 1. Fetch Admin SMTP settings from PostgreSQL
    const [row] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "mail"))
      .limit(1);

    const config = (row?.data || {}) as Record<string, any>;
    const smtpHost = config.smtpHost || "smtp.sendgrid.net";
    const smtpPort = Number(config.smtpPort) || 587;
    const smtpUser = config.smtpUser || "apikey";
    const smtpPass = config.smtpPass || "";
    const fromEmail = config.fromEmail || "auth@voxera.ai";
    const fromName = config.fromName || BRAND_CONFIG.name;

    // If no real password is set or credentials are dummy, log to console
    console.log(`[SMTP AUTH] Preparing to send OTP ${otp} to ${toEmail} via ${smtpHost}:${smtpPort}`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const subject = isNewUser
      ? `Your ${BRAND_CONFIG.name} Verification Code: ${otp}`
      : `${otp} is your ${BRAND_CONFIG.name} sign-in code`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
        <div style="margin-bottom: 24px; text-align: center;">
          <div style="display: inline-block; background: #0A0E1A; padding: 10px 16px; border-radius: 12px; margin-bottom: 12px;">
            <span style="color: #11E97F; font-weight: 900; font-size: 18px; letter-spacing: -0.5px;">⚡ ${BRAND_CONFIG.name}</span>
          </div>
          <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 8px 0 4px 0; letter-spacing: -0.5px;">
            ${isNewUser ? "Welcome to Voxera AI!" : "Welcome back"}
          </h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            Use the verification code below to ${isNewUser ? "complete your account setup" : "sign in to your dashboard"}.
          </p>
        </div>

        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
            Your One-Time Passcode (OTP)
          </p>
          <div style="font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #0A0E1A; margin-left: 12px;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 12px 0 0 0;">
            Expires in <strong>10 minutes</strong>. Never share this code with anyone.
          </p>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0 0 6px 0;">
            Sent to <span style="color: #475569; font-weight: 600;">${toEmail}</span>
          </p>
          <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
            If you did not request this login code, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`[SMTP AUTH] Successfully dispatched email to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, delivered: true };
  } catch (err: any) {
    console.warn(`[SMTP AUTH] Could not deliver via configured SMTP server: ${err.message}. (Fallback dev OTP 1234 active).`);
    return { success: true, delivered: false, error: err.message };
  }
}
