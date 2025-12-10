// API route: POST /api/messages and GET /api/messages

import { NextRequest, NextResponse } from "next/server";
import { Message, StoredMessage } from "@/types";
import { validateMessage } from "@/lib/message";
import { messageDb, logDb } from "@/lib/db";
import { logInfo, logError, logApiRequest } from "@/lib/logger";

// POST /api/messages - Publish a message
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const callerIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  try {
    const body = await request.json();
    const message = body.message as Message;

    // Validate message structure
    if (!message || !message.id || !message.authorPublicKey || !message.signature) {
      logError("api", "Invalid message structure", { callerIp });
      return NextResponse.json(
        { status: "error", error: "Invalid message structure" },
        { status: 400 }
      );
    }

    // Validate and verify message
    const validation = await validateMessage(message);
    if (!validation.valid) {
      logError("api", "Message validation failed", {
        messageId: message.id,
        error: validation.error,
        callerIp,
      });
      return NextResponse.json(
        { status: "error", error: validation.error || "Message validation failed" },
        { status: 400 }
      );
    }

    // Check if message already exists
    const existing = messageDb.getById(message.id);
    if (existing) {
      logInfo("api", "Message already exists", { messageId: message.id });
      return NextResponse.json(
        { status: "ok", id: message.id },
        { status: 200 }
      );
    }

    // Store message
    const storedMessage: StoredMessage = {
      ...message,
      relayReceivedAt: Date.now(),
      relaySourceIp: callerIp,
    };

    messageDb.insert(storedMessage);
    logInfo("api", "Message published", { messageId: message.id, callerIp });

    const duration = Date.now() - startTime;
    logApiRequest("/api/messages", "POST", 200, duration, callerIp);

    return NextResponse.json({ status: "ok", id: message.id });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApiRequest("/api/messages", "POST", 500, duration, callerIp);
    logError("api", "Failed to publish message", {
      error: error instanceof Error ? error.message : String(error),
      callerIp,
    });
    return NextResponse.json(
      { status: "error", error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/messages - List messages
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const callerIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const beforeParam = searchParams.get("before");

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 200) : 50;
    const before = beforeParam ? parseInt(beforeParam, 10) : undefined;

    const messages = messageDb.list(limit, before);

    const duration = Date.now() - startTime;
    logApiRequest("/api/messages", "GET", 200, duration, callerIp);

    return NextResponse.json({ status: "ok", messages });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApiRequest("/api/messages", "GET", 500, duration, callerIp);
    logError("api", "Failed to list messages", {
      error: error instanceof Error ? error.message : String(error),
      callerIp,
    });
    return NextResponse.json(
      { status: "error", error: "Internal server error" },
      { status: 500 }
    );
  }
}

