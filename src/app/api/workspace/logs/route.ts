import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workspaceLogs, workspaceMembers, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logWorkspaceActivity } from "@/lib/workspace-logs";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("voxera_session")?.value;
    let workspaceId: string | null = null;
    let userId: string | null = null;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed.workspaceId) workspaceId = parsed.workspaceId;
        if (parsed.userId) userId = parsed.userId;
      } catch (e) {}
    }

    if (!userId && !workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
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
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Fetch all logs from PostgreSQL workspace_logs table
    const logs = await db
      .select({
        id: workspaceLogs.id,
        workspaceId: workspaceLogs.workspaceId,
        userId: workspaceLogs.userId,
        userEmail: workspaceLogs.userEmail,
        operation: workspaceLogs.operation,
        resource: workspaceLogs.resource,
        resourceId: workspaceLogs.resourceId,
        resourceType: workspaceLogs.resourceType,
        details: workspaceLogs.details,
        createdAt: workspaceLogs.createdAt,
      })
      .from(workspaceLogs)
      .where(eq(workspaceLogs.workspaceId, workspaceId))
      .orderBy(desc(workspaceLogs.createdAt));

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error("GET workspace/logs error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch workspace logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("voxera_session")?.value;
    let workspaceId: string | null = null;
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed.workspaceId) workspaceId = parsed.workspaceId;
        if (parsed.userId) userId = parsed.userId;
        if (parsed.email) userEmail = parsed.email;
      } catch (e) {}
    }

    if (!userId && !workspaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { operation, resource, resourceId, resourceType, details } = body;

    if (!operation || !resource) {
      return NextResponse.json(
        { success: false, error: "Operation and resource are required" },
        { status: 400 }
      );
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
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 });
    }

    const log = await logWorkspaceActivity({
      workspaceId,
      userId,
      userEmail,
      operation,
      resource,
      resourceId,
      resourceType,
      details,
    });

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error: any) {
    console.error("POST workspace/logs error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record log" },
      { status: 500 }
    );
  }
}
