import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/gmail/oauth";

export async function GET() {
  try {
    const authUrl = getGoogleOAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Google connect error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}
