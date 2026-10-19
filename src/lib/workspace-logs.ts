import { db } from "@/db";
import { workspaceLogs, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface LogWorkspaceActionParams {
  workspaceId: string;
  userId?: string | null;
  userEmail?: string | null;
  operation: string; // e.g. "Edited workspace", "Created agent", "Edited agent", "Deleted agent", "Invited member"
  resource: string; // e.g. "Firozm613's Workspace", "dd"
  resourceId?: string | null;
  resourceType?: "workspace" | "agent" | "member" | "wallet" | "campaign" | "general";
  details?: Record<string, any>;
}

export async function logWorkspaceActivity({
  workspaceId,
  userId,
  userEmail,
  operation,
  resource,
  resourceId,
  resourceType = "general",
  details = {},
}: LogWorkspaceActionParams) {
  try {
    let email = userEmail;
    if (!email && userId) {
      const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
      if (u) email = u.email;
    }

    const [log] = await db
      .insert(workspaceLogs)
      .values({
        workspaceId,
        userId: userId || null,
        userEmail: email || null,
        operation,
        resource,
        resourceId: resourceId || null,
        resourceType,
        details,
      })
      .returning();

    return log;
  } catch (err) {
    console.error("Failed to record workspace log:", err);
    return null;
  }
}
