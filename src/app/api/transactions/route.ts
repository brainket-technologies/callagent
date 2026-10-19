import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { billingTransactions, workspaces } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");
    const query = searchParams.get("q");
    const workspaceIdParam = searchParams.get("workspaceId");

    let queryBuilder = db
      .select({
        id: billingTransactions.id,
        workspaceId: billingTransactions.workspaceId,
        workspaceName: workspaces.name,
        txnNumber: billingTransactions.txnNumber,
        type: billingTransactions.type,
        serviceName: billingTransactions.serviceName,
        amount: billingTransactions.amount,
        balanceAfter: billingTransactions.balanceAfter,
        billingUnit: billingTransactions.billingUnit,
        currency: billingTransactions.currency,
        gateway: billingTransactions.gateway,
        status: billingTransactions.status,
        timestampStr: billingTransactions.timestampStr,
        invoiceUrl: billingTransactions.invoiceUrl,
        createdAt: billingTransactions.createdAt,
        updatedAt: billingTransactions.updatedAt,
      })
      .from(billingTransactions)
      .leftJoin(workspaces, eq(billingTransactions.workspaceId, workspaces.id))
      .orderBy(desc(billingTransactions.createdAt));

    let transactions = await queryBuilder;

    if (workspaceIdParam) {
      transactions = transactions.filter((t) => t.workspaceId === workspaceIdParam);
    }
    if (typeFilter && typeFilter !== "all") {
      transactions = transactions.filter((t) => t.type === typeFilter);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      transactions = transactions.filter(
        (t) =>
          t.txnNumber.toLowerCase().includes(q) ||
          t.serviceName.toLowerCase().includes(q) ||
          (t.workspaceName && t.workspaceName.toLowerCase().includes(q))
      );
    }

    const mapped = transactions.map((t) => ({
      ...t,
      workspaceName: t.workspaceName || "Workspace",
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      amountPaise: Math.round(Number(t.amount || 0) * 100),
      balanceAfterPaise: Math.round(Number(t.balanceAfter || 0) * 100),
    }));

    return NextResponse.json({
      success: true,
      transactions: mapped,
      total: mapped.length,
    });
  } catch (error: any) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      workspaceId,
      type,
      serviceName,
      amount,
      amountPaise,
      balanceAfter,
      balanceAfterPaise,
      billingUnit,
      currency,
      gateway,
      status,
      invoiceUrl,
    } = body;

    // Resolve workspaceId from session if not passed
    if (!workspaceId) {
      const sessionCookie = req.cookies.get("voxera_session")?.value;
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(sessionCookie);
          if (parsed.workspaceId) workspaceId = parsed.workspaceId;
        } catch {}
      }
    }

    const txnNumber = "TXN-" + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const timestampStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const finalAmount =
      amount !== undefined
        ? Number(amount).toFixed(2)
        : ((Number(amountPaise) || 0) / 100).toFixed(2);

    const finalBalanceAfter =
      balanceAfter !== undefined
        ? Number(balanceAfter).toFixed(2)
        : ((Number(balanceAfterPaise) || 0) / 100).toFixed(2);

    const [inserted] = await db
      .insert(billingTransactions)
      .values({
        workspaceId: workspaceId || null,
        txnNumber,
        type,
        serviceName,
        amount: finalAmount,
        balanceAfter: finalBalanceAfter,
        billingUnit: billingUnit || null,
        currency: currency || null,
        gateway: gateway || null,
        status,
        timestampStr,
        invoiceUrl: invoiceUrl || null,
      })
      .returning();

    // Update workspace wallet balance in database
    if (workspaceId && finalBalanceAfter) {
      await db
        .update(workspaces)
        .set({
          walletBalance: finalBalanceAfter,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId))
        .catch(() => {});
    }


    return NextResponse.json({
      success: true,
      message: "Transaction recorded successfully",
      transaction: {
        ...inserted,
        amount: inserted.amount,
        balanceAfter: inserted.balanceAfter,
        amountPaise: Math.round(Number(inserted.amount) * 100),
        balanceAfterPaise: Math.round(Number(inserted.balanceAfter) * 100),
      },
    });
  } catch (error: any) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record transaction" },
      { status: 500 }
    );
  }
}
