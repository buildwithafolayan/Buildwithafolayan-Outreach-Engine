import { NextRequest, NextResponse } from "next/server";
import { classifyReplyWithGemini } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailBody, subject, senderName, companyName, campaignContext } = body;

    if (!emailBody) {
      return NextResponse.json(
        { error: "emailBody is required" },
        { status: 400 }
      );
    }

    const result = await classifyReplyWithGemini({
      emailBody,
      subject,
      senderName,
      companyName,
      campaignContext,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Classify API error:", error);
    return NextResponse.json(
      { error: "Failed to classify reply with Gemini AI" },
      { status: 500 }
    );
  }
}
