import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paymentGateways } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/admin/payment-gateways - Fetch all payment gateway configs from PostgreSQL
export async function GET() {
  try {
    console.log("DEBUG: paymentGateways table is:", paymentGateways);
    const gateways = await db
      .select({
        id: paymentGateways.id,
        provider: paymentGateways.provider,
        name: paymentGateways.name,
        isEnabled: paymentGateways.isEnabled,
        mode: paymentGateways.mode,
        liveKeyId: paymentGateways.liveKeyId,
        liveSecret: paymentGateways.liveSecret,
        liveWebhookSecret: paymentGateways.liveWebhookSecret,
        testKeyId: paymentGateways.testKeyId,
        testSecret: paymentGateways.testSecret,
        testWebhookSecret: paymentGateways.testWebhookSecret,
        createdAt: paymentGateways.createdAt,
        updatedAt: paymentGateways.updatedAt,
      })
      .from(paymentGateways);

    return NextResponse.json({
      success: true,
      gateways,
    });
  } catch (error: any) {
    console.error("Failed to fetch payment gateways:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch payment gateways from database",
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/payment-gateways - Update payment gateway config in PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      provider,
      isEnabled,
      mode,
      liveKeyId,
      liveSecret,
      liveWebhookSecret,
      testKeyId,
      testSecret,
      testWebhookSecret,
    } = body;

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider is required" },
        { status: 400 }
      );
    }

    // Check if provider exists
    const [existing] = await db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.provider, provider));

    let updatedRecord;

    if (existing) {
      const [updated] = await db
        .update(paymentGateways)
        .set({
          isEnabled: isEnabled !== undefined ? isEnabled : existing.isEnabled,
          mode: mode || existing.mode,
          liveKeyId: liveKeyId !== undefined ? liveKeyId : existing.liveKeyId,
          liveSecret: liveSecret !== undefined ? liveSecret : existing.liveSecret,
          liveWebhookSecret:
            liveWebhookSecret !== undefined
              ? liveWebhookSecret
              : existing.liveWebhookSecret,
          testKeyId: testKeyId !== undefined ? testKeyId : existing.testKeyId,
          testSecret: testSecret !== undefined ? testSecret : existing.testSecret,
          testWebhookSecret:
            testWebhookSecret !== undefined
              ? testWebhookSecret
              : existing.testWebhookSecret,
          updatedAt: new Date(),
        })
        .where(eq(paymentGateways.provider, provider))
        .returning();

      updatedRecord = updated;
    } else {
      const [inserted] = await db
        .insert(paymentGateways)
        .values({
          provider,
          name: provider === "razorpay" ? "Razorpay" : "Stripe",
          isEnabled: isEnabled ?? true,
          mode: mode || "live",
          liveKeyId,
          liveSecret,
          liveWebhookSecret,
          testKeyId,
          testSecret,
          testWebhookSecret,
        })
        .returning();

      updatedRecord = inserted;
    }

    return NextResponse.json({
      success: true,
      message: `${provider} configuration saved to PostgreSQL successfully`,
      gateway: updatedRecord,
    });
  } catch (error) {
    console.error("Failed to update payment gateway:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payment gateway in database",
      },
      { status: 500 }
    );
  }
}
