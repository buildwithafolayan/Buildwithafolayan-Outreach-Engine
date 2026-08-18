import { NextResponse } from "next/server";
import { clearGmailSession } from "@/lib/gmail/oauth";

export async function POST() {
  try {
    await clearGmailSession();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to disconnect Gmail" },
      { status: 500 }
    );
  }
}
