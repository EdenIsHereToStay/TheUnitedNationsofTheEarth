// API route: POST /api/ai/summarize-feed

import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types";
import { getAIProvider } from "@/lib/ai-provider";
import { logApiRequest, logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const callerIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  // Check if AI summary is enabled
  const enableAI = process.env.ENABLE_AI_SUMMARY !== "false";

  if (!enableAI) {
    return NextResponse.json(
      { status: "error", error: "AI summarization is disabled" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const messages = body.messages as Message[];
    const maxWords = body.maxWords || 100;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { status: "error", error: "Invalid messages array" },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const summary = await provider.summarize(messages, maxWords);

    const duration = Date.now() - startTime;
    logApiRequest("/api/ai/summarize-feed", "POST", 200, duration, callerIp);

    return NextResponse.json({ status: "ok", summary });
  } catch (error) {
    const duration = Date.now() - startTime;
    logApiRequest("/api/ai/summarize-feed", "POST", 500, duration, callerIp);
    logError("api", "Failed to summarize feed", {
      error: error instanceof Error ? error.message : String(error),
      callerIp,
    });
    return NextResponse.json(
      { status: "error", error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

