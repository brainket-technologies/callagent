import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, workspaces, workspaceMembers, userOtpVerifications, billingTransactions } from "@/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, workspaceName, fullName, currency } = body;

    if (!email?.trim() || !otp?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email and 4-digit verification code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const assignedCurrency = (currency?.trim() || "INR").toUpperCase();

    // Check fixed OTP 1234 or verify against database record
    const isFixedDevOtp = cleanOtp === "1234";

    let isValidOtp = isFixedDevOtp;
    if (!isValidOtp) {
      const [record] = await db
        .select()
        .from(userOtpVerifications)
        .where(
          and(
            eq(userOtpVerifications.email, cleanEmail),
            eq(userOtpVerifications.otp, cleanOtp),
            gte(userOtpVerifications.expiresAt, new Date())
          )
        )
        .orderBy(desc(userOtpVerifications.createdAt))
        .limit(1);

      if (record) {
        isValidOtp = true;
      }
    }

    if (!isValidOtp) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    // Mark OTP as verified in DB
    await db
      .update(userOtpVerifications)
      .set({ isVerified: true })
      .where(eq(userOtpVerifications.email, cleanEmail));

    // Check if user already exists
    let [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    // Case 1: New user, but workspace name hasn't been provided yet
    if (!existingUser && (!workspaceName || !workspaceName.trim())) {
      const defaultName = cleanEmail.split("@")[0].replace(/[._]/g, " ");
      return NextResponse.json({
        success: true,
        verified: true,
        isNewUser: true,
        email: cleanEmail,
        suggestedName: defaultName,
        suggestedWorkspace: `${defaultName.charAt(0).toUpperCase() + defaultName.slice(1)}'s Workspace`,
        message: "Code verified! Please choose your workspace name to finish setup.",
      });
    }

    let activeUser = existingUser;
    let activeWorkspace: any = null;

    // Case 2: New user with workspace name provided -> Create User, Workspace, & Membership
    if (!existingUser) {
      const cleanName = fullName?.trim() || cleanEmail.split("@")[0].replace(/[._]/g, " ");
      const [createdUser] = await db
        .insert(users)
        .values({
          email: cleanEmail,
          name: cleanName,
          role: "user",
          status: "active",
          device: "Desktop · macOS",
          browser: "Chrome 155",
          lastLoginAt: new Date(),
        })
        .returning();

      activeUser = createdUser;

      const cleanWsName = workspaceName.trim();
      const slugBase = cleanWsName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const uniqueSlug = `${slugBase || "ws"}-${Math.random().toString(36).substring(2, 6)}`;

      const [createdWorkspace] = await db
        .insert(workspaces)
        .values({
          name: cleanWsName,
          slug: uniqueSlug,
          ownerId: createdUser.id,
          walletBalance: "200.00", // New user gets 200.00 starter balance
          currency: assignedCurrency,
          status: "active",
        })
        .returning();

      activeWorkspace = createdWorkspace;

      // Link in workspace_members
      await db.insert(workspaceMembers).values({
        workspaceId: createdWorkspace.id,
        userId: createdUser.id,
        role: "owner",
      });

      // Automatically record 200.00 "free_credit" transaction in billing_transactions
      const now = new Date();
      const timestampStr = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      await db.insert(billingTransactions).values({
        workspaceId: createdWorkspace.id,
        txnNumber: "TXN-" + Math.floor(100000 + Math.random() * 900000),
        type: "free_credit",
        serviceName: "Welcome Free Credit",
        amount: "200.00",
        balanceAfter: "200.00",
        billingUnit: "Free Credit",
        currency: createdWorkspace.currency || assignedCurrency,
        gateway: "System Bonus",
        status: "success",
        timestampStr,
      });
    } else {
      // Case 3: Existing user -> fetch their workspace
      const [membership] = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, existingUser.id))
        .limit(1);

      if (membership) {
        const [ws] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, membership.workspaceId))
          .limit(1);
        activeWorkspace = ws;
      }

      // If user had no workspace record yet, auto-provision one
      if (!activeWorkspace) {
        const fallbackName = `${existingUser.name || "Default"}'s Workspace`;
        const slug = `${existingUser.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "ws"}-${Math.random().toString(36).substring(2, 6)}`;
        const [ws] = await db
          .insert(workspaces)
          .values({
            name: fallbackName,
            slug,
            ownerId: existingUser.id,
            walletBalance: "200.00",
            currency: assignedCurrency,
            status: "active",
          })
          .returning();
        activeWorkspace = ws;

        await db.insert(workspaceMembers).values({
          workspaceId: ws.id,
          userId: existingUser.id,
          role: "owner",
        });

        // Record 200.00 Free Credit transaction
        const now = new Date();
        const timestampStr = now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        await db.insert(billingTransactions).values({
          workspaceId: ws.id,
          txnNumber: "TXN-" + Math.floor(100000 + Math.random() * 900000),
          type: "free_credit",
          serviceName: "Welcome Free Credit",
          amount: "200.00",
          balanceAfter: "200.00",
          billingUnit: "Free Credit",
          currency: ws.currency || assignedCurrency,
          gateway: "System Bonus",
          status: "success",
          timestampStr,
        });
      }

      // Update last login
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));
    }

    const sessionPayload = {
      userId: activeUser.id,
      email: activeUser.email,
      name: activeUser.name,
      workspaceId: activeWorkspace.id,
      workspaceName: activeWorkspace.name,
      walletBalance: activeWorkspace.walletBalance || "200.00",
      walletBalancePaise: Math.round(Number(activeWorkspace.walletBalance || 200) * 100),
      currency: activeWorkspace.currency,
      device: activeUser.device || "Desktop · macOS",
      browser: activeUser.browser || "Chrome 155",
    };

    const response = NextResponse.json({
      success: true,
      message: existingUser ? `Welcome back, ${activeUser.name}!` : `Account and workspace created successfully!`,
      isNewUser: !existingUser,
      user: activeUser,
      workspace: activeWorkspace,
      redirect: "/dashboard",
    });

    // Set HTTP session cookie for 30 days
    response.cookies.set("voxera_session", JSON.stringify(sessionPayload), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // accessible to client for store hydration
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("POST /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify code and authenticate" },
      { status: 500 }
    );
  }
}
