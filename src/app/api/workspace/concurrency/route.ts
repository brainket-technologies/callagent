import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workspaces, billingTransactions, servicePricing, users, workspaceMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logWorkspaceActivity } from "@/lib/workspace-logs";

async function getAuthContext(req: NextRequest) {
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

  if (userId && !userEmail) {
    const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (u) userEmail = u.email;
  }

  if (!workspaceId && userId) {
    const [membership] = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .limit(1);
    if (membership) workspaceId = membership.workspaceId;
  }

  if (!workspaceId) {
    const [ws] = await db.select({ id: workspaces.id }).from(workspaces).limit(1);
    if (ws) workspaceId = ws.id;
  }

  return { workspaceId, userId, userEmail };
}

// GET: Fetch current concurrency details and rate
export async function GET(req: NextRequest) {
  try {
    const { workspaceId } = await getAuthContext(req);
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 401 });
    }

    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 });
    }

    // Lookup concurrency line rate from service_pricing
    const [srv] = await db
      .select()
      .from(servicePricing)
      .where(eq(servicePricing.slug, "call-concurrency"))
      .limit(1);

    const channelRate = srv ? Number(srv.customerRate) : 999;
    const currentChannels = ws.concurrencyLimit || 2;
    const freeChannels = 2;
    const extraChannels = Math.max(0, currentChannels - freeChannels);
    const monthlyCost = extraChannels * channelRate;

    return NextResponse.json({
      success: true,
      channels: currentChannels,
      freeChannels,
      extraChannels,
      channelRate,
      monthlyCost,
      walletBalance: Number(ws.walletBalance || 0),
    });
  } catch (error: any) {
    console.error("GET /api/workspace/concurrency error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

// POST: Update concurrency and deduct monthly charges from wallet
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, userId, userEmail } = await getAuthContext(req);
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 401 });
    }

    const body = await req.json();
    const targetChannels = Number(body.channels);

    if (isNaN(targetChannels) || targetChannels < 2) {
      return NextResponse.json(
        { success: false, error: "Concurrency channels must be at least 2 (free tier)." },
        { status: 400 }
      );
    }

    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 });
    }

    // Lookup concurrency line rate from service_pricing
    const [srv] = await db
      .select()
      .from(servicePricing)
      .where(eq(servicePricing.slug, "call-concurrency"))
      .limit(1);

    const channelRate = srv ? Number(srv.customerRate) : 999;
    const currentChannels = ws.concurrencyLimit || 2;
    const freeChannels = 2;
    const currentWalletBalance = Number(ws.walletBalance || 0);

    // Calculate billing
    const targetExtraChannels = Math.max(0, targetChannels - freeChannels);
    const currentExtraChannels = Math.max(0, currentChannels - freeChannels);

    // If upgrading to more channels, charge for the additional lines
    const newlyAddedLines = Math.max(0, targetExtraChannels - currentExtraChannels);
    const chargeAmount = newlyAddedLines * channelRate;

    // Check wallet balance
    if (chargeAmount > 0 && currentWalletBalance < chargeAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient wallet balance! Upgrading to ${targetChannels} channels requires ₹${chargeAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}. Your current balance is ₹${currentWalletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}. Please recharge your wallet first.`,
          requiredAmount: chargeAmount,
          currentBalance: currentWalletBalance,
        },
        { status: 400 }
      );
    }

    const newBalance = (currentWalletBalance - chargeAmount).toFixed(2);
    const now = new Date();
    const timestampStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Update workspace in database
    await db
      .update(workspaces)
      .set({
        concurrencyLimit: targetChannels,
        concurrencyBilledAt: now,
        walletBalance: newBalance,
        updatedAt: now,
      })
      .where(eq(workspaces.id, workspaceId));

    let createdTx = null;

    // 2. If charge was deducted, create transaction in billing_transactions
    if (chargeAmount > 0) {
      const txnNumber = "TXN-" + Math.floor(100000 + Math.random() * 900000);
      const [inserted] = await db
        .insert(billingTransactions)
        .values({
          workspaceId,
          txnNumber,
          type: "debit_concurrency",
          serviceName: `Concurrency Upgrade: ${targetChannels} Channels (${newlyAddedLines} extra lines @ ₹${channelRate.toFixed(2)}/mo)`,
          amount: (-chargeAmount).toFixed(2),
          balanceAfter: newBalance,
          billingUnit: "Per month",
          currency: ws.currency || "INR",
          gateway: "Wallet Balance",
          status: "success",
          timestampStr,
        })
        .returning();

      createdTx = inserted;
    }

    // 3. Record in workspace_logs
    await logWorkspaceActivity({
      workspaceId,
      userId,
      userEmail,
      operation: "Updated concurrency",
      resource: `${targetChannels} Channels (${targetExtraChannels} extra lines)`,
      resourceId: workspaceId,
      resourceType: "workspace",
      details: {
        channels: targetChannels,
        previousChannels: currentChannels,
        extraChannels: targetExtraChannels,
        amountDeducted: chargeAmount,
        newBalance,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        chargeAmount > 0
          ? `Concurrency updated to ${targetChannels} channels! ₹${chargeAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} deducted from your wallet.`
          : `Concurrency updated to ${targetChannels} channels (2 Free Channels included).`,
      channels: targetChannels,
      newBalance: Number(newBalance),
      amountDeducted: chargeAmount,
      transaction: createdTx,
    });
  } catch (error: any) {
    console.error("POST /api/workspace/concurrency error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update concurrency" },
      { status: 500 }
    );
  }
}
