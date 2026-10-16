import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const SETTING_KEY = "firebase";

const DEFAULT_FIREBASE_CONFIG = {
  projectId: "voxera-voice-telephony-prod",
  apiKey: "•••••••••••••••••••••••••••••",
  fcmKey: "•••••••••••••••••••••••••••••",
  storageBucket: "voxera-voice-telephony-prod.appspot.com",
  serviceAccountJson: `{\n  "type": "service_account",\n  "project_id": "voxera-voice-telephony-prod",\n  "private_key_id": "•••••••••••••••••••••••••••••",\n  "client_email": "firebase-adminsdk@voxera-voice-telephony-prod.iam.gserviceaccount.com"\n}`,
};

export async function GET() {
  try {
    const [row] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, SETTING_KEY))
      .limit(1);

    if (!row || !row.data) {
      return NextResponse.json({
        success: true,
        config: DEFAULT_FIREBASE_CONFIG,
      });
    }

    const data = row.data as Record<string, any>;

    return NextResponse.json({
      success: true,
      config: {
        projectId: data.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
        apiKey: data.apiKey || "",
        fcmKey: data.fcmKey || "",
        storageBucket: data.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
        serviceAccountJson: data.serviceAccountJson || DEFAULT_FIREBASE_CONFIG.serviceAccountJson,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/firebase-config error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load firebase configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, apiKey, fcmKey, storageBucket, serviceAccountJson } = body;

    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, SETTING_KEY))
      .limit(1);

    const updatedData = {
      projectId: projectId !== undefined ? projectId : (existing?.data as any)?.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
      apiKey: apiKey !== undefined ? apiKey : (existing?.data as any)?.apiKey || "",
      fcmKey: fcmKey !== undefined ? fcmKey : (existing?.data as any)?.fcmKey || "",
      storageBucket: storageBucket !== undefined ? storageBucket : (existing?.data as any)?.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
      serviceAccountJson: serviceAccountJson !== undefined ? serviceAccountJson : (existing?.data as any)?.serviceAccountJson || "",
    };

    if (existing) {
      await db
        .update(systemSettings)
        .set({
          data: updatedData,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existing.id));
    } else {
      await db.insert(systemSettings).values({
        key: SETTING_KEY,
        data: updatedData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Firebase configuration successfully saved to PostgreSQL database!",
      config: updatedData,
    });
  } catch (error: any) {
    console.error("POST /api/admin/firebase-config error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save firebase configuration" },
      { status: 500 }
    );
  }
}
