import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const startTime = Date.now();

    // Test raw query
    const result = await db.execute(sql`SELECT current_database(), current_user, version()`);
    const latencyMs = Date.now() - startTime;

    // Fetch counts from admins table
    const [adminsCount] = await db.select({ count: sql<number>`count(*)` }).from(schema.admins);

    return NextResponse.json({
      status: "connected",
      database: "PostgreSQL (Drizzle ORM)",
      latencyMs,
      details: result[0],
      tables: {
        admins: Number(adminsCount.count),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to connect to PostgreSQL",
      },
      { status: 500 }
    );
  }
}
