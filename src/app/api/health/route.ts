import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only check database if it's configured
    if (db) {
      await db.execute(sql`select 1`);
      return Response.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        database: "connected" 
      });
    }
    
    // Return ok even without database
    return Response.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "not configured" 
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json({ 
      status: "error", 
      timestamp: new Date().toISOString(),
      error: "Health check failed" 
    }, { status: 500 });
  }
}
