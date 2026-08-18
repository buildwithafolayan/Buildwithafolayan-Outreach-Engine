import { NextRequest, NextResponse } from "next/server";
import { runFavourCopilot, FavourMessage, FavourContext } from "@/lib/ai/favour";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: FavourMessage[];
      context?: FavourContext;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    const response = await runFavourCopilot({
      messages,
      context,
    });

    return NextResponse.json({ success: true, message: response });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Favour chat endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process Favour copilot request" },
      { status: 500 }
    );
  }
}
