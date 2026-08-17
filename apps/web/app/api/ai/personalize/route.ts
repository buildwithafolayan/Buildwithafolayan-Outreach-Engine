import { NextRequest, NextResponse } from "next/server";
import { personalizeEmailWithGemini } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact, templateSubject, templateBody, valueProposition } = body;

    if (!contact || !templateSubject || !templateBody) {
      return NextResponse.json(
        { error: "contact, templateSubject, and templateBody are required" },
        { status: 400 }
      );
    }

    const result = await personalizeEmailWithGemini({
      contact,
      templateSubject,
      templateBody,
      valueProposition,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Personalize API error:", error);
    return NextResponse.json(
      { error: "Failed to personalize email with Gemini AI" },
      { status: 500 }
    );
  }
}
