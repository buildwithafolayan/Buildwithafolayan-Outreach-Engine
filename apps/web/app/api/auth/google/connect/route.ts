import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/gmail/oauth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const dynamicRedirectUri = `${origin}/api/auth/callback/google`;

  try {
    const authUrl = getGoogleOAuthUrl(dynamicRedirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Google connect error:", err);
    return NextResponse.redirect(
      `${origin}/settings?error=${encodeURIComponent(
        err.message || "Failed to initiate Google OAuth"
      )}`
    );
  }
}
