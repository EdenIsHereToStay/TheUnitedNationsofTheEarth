// API route: GET /api/messages/:id

import { NextRequest, NextResponse } from "next/server";
import { messageDb } from "@/lib/db";
import { logApiRequest, logError } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const callerIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const { id } = await params;

  try {
    const message = messageDb.getById(id);

    if (!message) {
      const duration = Date.now() - startTime;
      logApiRequest(`/api/messages/${id}`, "GET", 404, duration, callerIp);
      return NextResponse.json(
        { status: "error", error: "Message not found" },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    logApiRequest(`/api/messages/${id}`, "GET", 200, duration, callerIp);

    return NextResponse.json({ status: "ok", message });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApiRequest(`/api/messages/${id}`, "GET", 500, duration, callerIp);
    logError("api", "Failed to get message", {
      messageId: id,
      error: error instanceof Error ? error.message : String(error),
      callerIp,
    });
    return NextResponse.json(
      { status: "error", error: "Internal server error" },
      { status: 500 }
    );
  }
}

