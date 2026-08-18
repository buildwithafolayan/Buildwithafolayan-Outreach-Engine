import { NextResponse } from "next/server";
import { getConnectedGmailAccount } from "@/lib/gmail/oauth";

export async function GET() {
  try {
    const account = await getConnectedGmailAccount();
    return NextResponse.json({ account });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch account status" },
      { status: 500 }
    );
  }
}
