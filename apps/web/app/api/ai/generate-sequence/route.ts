import { NextRequest, NextResponse } from "next/server";
import { generateSequenceWithGemini } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignName, targetAudience, productDescription, numSteps } = body;

    if (!campaignName || !targetAudience || !productDescription) {
      return NextResponse.json(
        { error: "campaignName, targetAudience, and productDescription are required" },
        { status: 400 }
      );
    }

    const steps = await generateSequenceWithGemini({
      campaignName,
      targetAudience,
      productDescription,
      numSteps: numSteps || 4,
    });

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("AI Sequence Generator API error:", error);
    return NextResponse.json(
      { error: "Failed to generate sequence with Gemini AI" },
      { status: 500 }
    );
  }
}
