import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workspaceApiKeys, workspaces, users, workspaceMembers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logWorkspaceActivity } from "@/lib/workspace-logs";
import crypto from "crypto";

function generateSecureApiKey(): string {
  // Generates clean alphanumeric live secret key with 32-char entropy
  const randomPart = crypto.randomBytes(24).toString("base64url").replace(/[^a-zA-Z0-9]/g, "x");
  return `sk_live_${randomPart}`;
}

export function formatMaskedKey(key: string): string {
  if (!key) return "";
  const prefixMatch = key.match(/^([a-z]+_[a-z]+_)/i);
  const prefix = prefixMatch ? prefixMatch[1] : "sk_live_";
  const last4 = key.slice(-4);
  return `${prefix}••••••••••••••••••••••••••••••••${last4}`;
}

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
    } catch (e) {}
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

  // Fallback to primary active workspace in DB if needed
  if (!workspaceId) {
    const [ws] = await db.select({ id: workspaces.id }).from(workspaces).limit(1);
    if (ws) workspaceId = ws.id;
  }

  return { workspaceId, userId, userEmail };
}

// GET: Fetch active API key for workspace (does not auto-generate if none exists)
export async function GET(req: NextRequest) {
  try {
    const { workspaceId } = await getAuthContext(req);

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Workspace not found. Please log in." },
        { status: 401 }
      );
    }

    // Look for active key
    const [activeKey] = await db
      .select()
      .from(workspaceApiKeys)
      .where(
        and(
          eq(workspaceApiKeys.workspaceId, workspaceId),
          eq(workspaceApiKeys.status, "active")
        )
      )
      .orderBy(desc(workspaceApiKeys.createdAt))
      .limit(1);

    if (!activeKey) {
      return NextResponse.json({
        success: true,
        hasKey: false,
        apiKey: null,
        maskedKey: null,
      });
    }

    return NextResponse.json({
      success: true,
      hasKey: true,
      apiKey: activeKey.key,
      maskedKey: formatMaskedKey(activeKey.key),
      name: activeKey.name,
      createdAt: activeKey.createdAt,
      lastUsedAt: activeKey.lastUsedAt,
    });
  } catch (error: any) {
    console.error("GET /api/workspace/api-key error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve API key" },
      { status: 500 }
    );
  }
}

// POST: Generate (first time) or Regenerate API key with audit logging
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, userId, userEmail } = await getAuthContext(req);

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Workspace not found. Please log in." },
        { status: 401 }
      );
    }

    // Check if an active key already exists
    const [existingActiveKey] = await db
      .select()
      .from(workspaceApiKeys)
      .where(
        and(
          eq(workspaceApiKeys.workspaceId, workspaceId),
          eq(workspaceApiKeys.status, "active")
        )
      )
      .limit(1);

    const isFirstTime = !existingActiveKey;

    // If active keys exist, mark them as revoked
    if (existingActiveKey) {
      await db
        .update(workspaceApiKeys)
        .set({
          status: "revoked",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(workspaceApiKeys.workspaceId, workspaceId),
            eq(workspaceApiKeys.status, "active")
          )
        );
    }

    // Generate fresh secret key
    const freshKey = generateSecureApiKey();
    const [inserted] = await db
      .insert(workspaceApiKeys)
      .values({
        workspaceId,
        name: "Default Secret Key",
        key: freshKey,
        status: "active",
      })
      .returning();

    // Record mandatory workspace audit log
    const operationName = isFirstTime ? "Generated API key" : "Regenerated API key";
    await logWorkspaceActivity({
      workspaceId,
      userId,
      userEmail,
      operation: operationName,
      resource: "Secret API Key",
      resourceId: inserted.id,
      resourceType: "workspace",
      details: {
        name: inserted.name,
        keyEnding: inserted.key.slice(-4),
        isFirstTime,
        action: isFirstTime ? "Initial key generation" : "Invalidated old keys and created new secret key",
      },
    });

    return NextResponse.json({
      success: true,
      hasKey: true,
      isFirstTime,
      message: isFirstTime
        ? "Secret API key generated successfully"
        : "Secret API key regenerated successfully",
      apiKey: inserted.key,
      maskedKey: formatMaskedKey(inserted.key),
      createdAt: inserted.createdAt,
    });
  } catch (error: any) {
    console.error("POST /api/workspace/api-key error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process API key" },
      { status: 500 }
    );
  }
}
