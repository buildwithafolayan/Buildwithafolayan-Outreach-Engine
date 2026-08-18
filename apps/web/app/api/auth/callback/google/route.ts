import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, saveGmailSession } from "@/lib/gmail/oauth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const dynamicRedirectUri = `${baseUrl}/api/auth/callback/google`;

  if (error) {
    console.error("Google OAuth error from query param:", error);
    return NextResponse.redirect(`${baseUrl}/settings?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/settings?error=missing_code`);
  }

  try {
    const { tokens, profile } = await exchangeCodeForTokens(code, dynamicRedirectUri);

    await saveGmailSession({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    return NextResponse.redirect(`${baseUrl}/settings?connected=true`);
  } catch (err: unknown) {
    const e = err as Error;
    console.error("OAuth callback exchange failed:", e);
    return NextResponse.redirect(
      `${baseUrl}/settings?error=${encodeURIComponent(e.message || "exchange_failed")}`
    );
  }
}
