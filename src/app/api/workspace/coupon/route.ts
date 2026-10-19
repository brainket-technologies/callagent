import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workspaces, billingTransactions, users, workspaceMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logWorkspaceActivity } from "@/lib/workspace-logs";

const VALID_COUPONS: Record<string, { amount: number; label: string }> = {
  WELCOME100: { amount: 100, label: "Welcome Promo Credit" },
  VOXERA50: { amount: 50, label: "Special Community Credit" },
  STARTUP500: { amount: 500, label: "Startup Accelerator Credit" },
  DIWALI2026: { amount: 250, label: "Festive Bonus Credit" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: "Please enter a coupon code" }, { status: 400 });
    }

    const coupon = VALID_COUPONS[code];
    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired coupon code. Try WELCOME100 or VOXERA50.",
        },
        { status: 400 }
      );
    }

    // Resolve workspace and user from session
    const sessionCookie = req.cookies.get("voxera_session")?.value;
    let workspaceId: string | null = null;
    let userId: string | null = null;
    let userEmail: string = "";

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed.workspaceId) workspaceId = parsed.workspaceId;
        if (parsed.userId) userId = parsed.userId;
        if (parsed.email) userEmail = parsed.email || "";
      } catch {}
    }

    if (!workspaceId && userId) {
      const [membership] = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, userId))
        .limit(1);
      if (membership) workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
      const [ws] = await db.select().from(workspaces).limit(1);
      if (ws) workspaceId = ws.id;
    }

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 401 });
    }

    // Get current workspace balance
    const [currentWs] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
    if (!currentWs) {
      return NextResponse.json({ success: false, error: "Workspace record not found" }, { status: 404 });
    }

    const currentBalance = Number(currentWs.walletBalance || 0);
    const newBalance = (currentBalance + coupon.amount).toFixed(2);
    const txnNumber = "TXN-" + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const timestampStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Update workspace balance in DB
    await db
      .update(workspaces)
      .set({
        walletBalance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));

    // Record in billing_transactions
    const [insertedTxn] = await db
      .insert(billingTransactions)
      .values({
        workspaceId,
        txnNumber,
        type: "coupon_credit",
        serviceName: `Coupon ${code} Applied (${coupon.label})`,
        amount: coupon.amount.toFixed(2),
        balanceAfter: newBalance,
        billingUnit: "Promo Credit",
        gateway: "Coupon",
        status: "success",
        timestampStr,
      })
      .returning();

    // Log in workspace_logs
    await logWorkspaceActivity({
      workspaceId,
      userId,
      userEmail,
      operation: "Redeemed coupon",
      resource: `Coupon ${code}`,
      resourceId: insertedTxn.id,
      resourceType: "wallet",
      details: {
        code,
        creditedAmount: coupon.amount,
        newBalance,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Coupon ${code} redeemed successfully! ₹${coupon.amount}.00 added to your wallet.`,
      creditedAmount: coupon.amount,
      newBalance,
      transaction: insertedTxn,
    });
  } catch (error: any) {
    console.error("Coupon redemption error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to redeem coupon" },
      { status: 500 }
    );
  }
}
