import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, workspaces, workspaceMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("voxera_session")?.value;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        // Refresh live data from PostgreSQL
        if (parsed.userId) {
          const [user] = await db.select().from(users).where(eq(users.id, parsed.userId)).limit(1);
          if (user) {
            let ws: any = null;
            if (parsed.workspaceId) {
              const [foundWs] = await db
                .select()
                .from(workspaces)
                .where(eq(workspaces.id, parsed.workspaceId))
                .limit(1);
              if (foundWs) ws = foundWs;
            }

            if (!ws) {
              const [membership] = await db
                .select()
                .from(workspaceMembers)
                .where(eq(workspaceMembers.userId, user.id))
                .limit(1);

              if (membership) {
                const [memberWs] = await db
                  .select()
                  .from(workspaces)
                  .where(eq(workspaces.id, membership.workspaceId))
                  .limit(1);
                if (memberWs) ws = memberWs;
              }
            }


            return NextResponse.json({
              success: true,
              authenticated: true,
              user,
              workspace: ws
                ? {
                    ...ws,
                    walletBalance: ws.walletBalance,
                    walletBalancePaise: Math.round(Number(ws.walletBalance || 200) * 100),
                  }
                : {
                    id: parsed.workspaceId,
                    name: parsed.workspaceName || `${user.name}'s Workspace`,
                    walletBalance: "200.00",
                    walletBalancePaise: 20000,
                    currency: "INR",
                  },
            });
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: false,
      user: null,
      workspace: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "Logged out successfully",
      });
      response.cookies.delete("voxera_session");
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Session action failed" },
      { status: 500 }
    );
  }
}
