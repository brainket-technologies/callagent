import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, workspaces, workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

    // If workspaceId was not in session, find workspace from user's membership
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

    // Fetch live members joined with real user profiles from PostgreSQL
    const membersList = await db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
        name: users.name,
        email: users.email,
        status: users.status,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId))
      .orderBy(workspaceMembers.createdAt);

    return NextResponse.json({
      success: true,
      members: membersList,
    });
  } catch (error: any) {
    console.error("GET workspace/members error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load members" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("voxera_session")?.value;
    let workspaceId: string | null = null;
    let currentUserId: string | null = null;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed.workspaceId) workspaceId = parsed.workspaceId;
        if (parsed.userId) currentUserId = parsed.userId;
      } catch (e) {}
    }

    if (!currentUserId && !workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, role = "member" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Resolve workspaceId if needed
    if (!workspaceId && currentUserId) {
      const [membership] = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, currentUserId))
        .limit(1);

      if (membership) workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 400 }
      );
    }

    // Check if target user exists, or create a new user profile
    let [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (!targetUser) {
      const fallbackName = cleanEmail.split("@")[0].replace(/[._]/g, " ");
      const [newUser] = await db
        .insert(users)
        .values({
          email: cleanEmail,
          name: fallbackName,
          role: "user",
          status: "active",
        })
        .returning();
      targetUser = newUser;
    }

    // Check if user is already a member of this workspace
    const [existingMembership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUser.id)
        )
      )
      .limit(1);

    if (existingMembership) {
      return NextResponse.json(
        { success: false, error: "User is already a member of this workspace" },
        { status: 400 }
      );
    }

    // Add to workspace_members table
    const [newMember] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId: targetUser.id,
        role: role === "admin" ? "admin" : "member",
      })
      .returning();

    await logWorkspaceActivity({
      workspaceId,
      userId: currentUserId,
      operation: "Invited member",
      resource: targetUser.name || cleanEmail,
      resourceId: newMember.id,
      resourceType: "member",
      details: { email: cleanEmail, role },
    });

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${cleanEmail}`,
      member: {
        id: newMember.id,
        workspaceId: newMember.workspaceId,
        userId: targetUser.id,
        role: newMember.role,
        createdAt: newMember.createdAt,
        name: targetUser.name,
        email: targetUser.email,
        status: targetUser.status,
      },
    });
  } catch (error: any) {
    console.error("POST workspace/members error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to invite member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("voxera_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json({ success: false, error: "Member ID is required" }, { status: 400 });
    }

    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId))
      .limit(1);

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    }

    if (member.role === "owner") {
      return NextResponse.json(
        { success: false, error: "Cannot remove the workspace owner" },
        { status: 400 }
      );
    }

    await db.delete(workspaceMembers).where(eq(workspaceMembers.id, memberId));

    await logWorkspaceActivity({
      workspaceId: member.workspaceId,
      operation: "Removed member",
      resource: member.userId,
      resourceId: memberId,
      resourceType: "member",
    });

    return NextResponse.json({
      success: true,
      message: "Member removed from workspace",
    });
  } catch (error: any) {
    console.error("DELETE workspace/members error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
