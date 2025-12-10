// API route: GET /api/admin/logs

import { NextRequest, NextResponse } from "next/server";
import { logDb } from "@/lib/db";
import { logApiRequest, logError } from "@/lib/logger";

function checkAdminAuth(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return false; // No token configured, deny access
  }

  const providedToken = request.headers.get("x-admin-token");
  return providedToken === adminToken;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const callerIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  // Check admin authentication
  if (!checkAdminAuth(request)) {
    const duration = Date.now() - startTime;
    logApiRequest("/api/admin/logs", "GET", 403, duration, callerIp);
    return NextResponse.json(
      { status: "error", error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get("level") || undefined;
    const source = searchParams.get("source") || undefined;
    const limitParam = searchParams.get("limit");
    const beforeParam = searchParams.get("before");

    const limit = limitParam ? parseInt(limitParam, 10) : 100;
    const before = beforeParam ? parseInt(beforeParam, 10) : undefined;

    const logs = logDb.list({ level, source, limit, before });

    const duration = Date.now() - startTime;
    logApiRequest("/api/admin/logs", "GET", 200, duration, callerIp);

    return NextResponse.json({ status: "ok", logs });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApiRequest("/api/admin/logs", "GET", 500, duration, callerIp);
    logError("api", "Failed to get logs", {
      error: error instanceof Error ? error.message : String(error),
      callerIp,
    });
    return NextResponse.json(
      { status: "error", error: "Internal server error" },
      { status: 500 }
    );
  }
}

