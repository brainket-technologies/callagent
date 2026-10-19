import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workspaceCompanyDetails, workspaces, users, workspaceMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logWorkspaceActivity } from "@/lib/workspace-logs";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("voxera_session")?.value;
    let workspaceId: string | null = null;
    let userId: string | null = null;
    let userEmail: string = "";
    let userName: string = "";
    let wsName: string = "";

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed.workspaceId) workspaceId = parsed.workspaceId;
        if (parsed.userId) userId = parsed.userId;
        if (parsed.email) userEmail = parsed.email || "";
        if (parsed.name) userName = parsed.name || "";
        if (parsed.workspaceName) wsName = parsed.workspaceName || "";
      } catch (e) {}
    }

    // Refresh live user profile from PostgreSQL
    if (userId) {
      const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (u) {
        userEmail = u.email;
        userName = u.name;
      }
    }

    // Refresh live workspace from PostgreSQL
    if (workspaceId) {
      const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
      if (ws) wsName = ws.name;
    } else if (userId) {
      const [membership] = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, userId))
        .limit(1);

      if (membership) {
        workspaceId = membership.workspaceId;
        const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
        if (ws) wsName = ws.name;
      }
    }

    if (!userId && !workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const contactName = userName || "";

    if (!workspaceId) {
      return NextResponse.json({
        success: true,
        details: {
          isBusiness: false,
          gstin: "",
          entityType: "",
          companyName: "",
          pan: "",
          address: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
          name: contactName,
          email: userEmail,
        },
      });
    }

    // Fetch existing KYC details from database
    const [details] = await db
      .select()
      .from(workspaceCompanyDetails)
      .where(eq(workspaceCompanyDetails.workspaceId, workspaceId))
      .limit(1);

    if (details) {
      return NextResponse.json({
        success: true,
        details: {
          ...details,
          companyName: details.companyName || "",
          // Point of contact merged into single name from logged-in user profile
          name: contactName,
          email: userEmail,
        },
      });
    }

    // Default initial data if never saved before
    const defaultDetails = {
      workspaceId,
      isBusiness: false,
      gstin: "",
      entityType: "",
      companyName: "",
      pan: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      name: contactName,
      email: userEmail,
    };

    return NextResponse.json({
      success: true,
      details: defaultDetails,
    });
  } catch (error: any) {
    console.error("GET company-details error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load company details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionCookie = req.cookies.get("voxera_session")?.value;
    let workspaceId: string | null = body.workspaceId || null;
    let userId: string | null = null;

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (!workspaceId && parsed.workspaceId) workspaceId = parsed.workspaceId;
        if (parsed.userId) userId = parsed.userId;
      } catch (e) {}
    }

    // If workspaceId is not provided in body, lookup workspace for the authenticated user
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
        { success: false, error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const {
      isBusiness = false,
      gstin = "",
      entityType = "",
      companyName = "",
      pan = "",
      address = "",
      city = "",
      state = "",
      country = "",
      pincode = "",
      name = "",
      fullName = "",
      firstName = "",
      lastName = "",
    } = body;

    const mergedName = (name || fullName || `${firstName} ${lastName}`).trim();

    // Check if record already exists for this workspace
    const [existing] = await db
      .select()
      .from(workspaceCompanyDetails)
      .where(eq(workspaceCompanyDetails.workspaceId, workspaceId))
      .limit(1);

    let savedRecord;

    if (existing) {
      // Update company details
      const [updated] = await db
        .update(workspaceCompanyDetails)
        .set({
          isBusiness: Boolean(isBusiness),
          gstin: gstin?.trim() || null,
          entityType: entityType?.trim() || null,
          companyName: companyName?.trim() || existing.companyName,
          pan: pan?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          country: country?.trim() || null,
          pincode: pincode?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(workspaceCompanyDetails.id, existing.id))
        .returning();

      savedRecord = updated;
    } else {
      // Insert company details
      const [inserted] = await db
        .insert(workspaceCompanyDetails)
        .values({
          workspaceId,
          isBusiness: Boolean(isBusiness),
          gstin: gstin?.trim() || null,
          entityType: entityType?.trim() || null,
          companyName: companyName?.trim() || "",
          pan: pan?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          country: country?.trim() || null,
          pincode: pincode?.trim() || null,
        })
        .returning();

      savedRecord = inserted;
    }

    // Update logged in user's profile name in users table if changed
    if (userId && mergedName) {
      await db
        .update(users)
        .set({ name: mergedName, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .catch(() => {});
    }

    await logWorkspaceActivity({
      workspaceId,
      userId,
      operation: "Edited workspace",
      resource: companyName?.trim() || "Workspace KYC",
      resourceId: workspaceId,
      resourceType: "workspace",
      details: { companyName, isBusiness },
    });

    return NextResponse.json({
      success: true,
      message: "Company KYC details saved successfully",
      details: {
        ...savedRecord,
        name: mergedName,
      },
    });
  } catch (error: any) {
    console.error("POST company-details error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save company details" },
      { status: 500 }
    );
  }
}
