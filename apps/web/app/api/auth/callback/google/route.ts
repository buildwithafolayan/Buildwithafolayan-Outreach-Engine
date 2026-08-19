import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, saveGmailSession } from "@/lib/gmail/oauth";
import { timingSafeEqual } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const dynamicRedirectUri = `${baseUrl}/api/auth/callback/google`;

  if (error) {
    console.error("Google OAuth error from query param:", error);
    return NextResponse.redirect(`${baseUrl}/settings?error=${encodeURIComponent(error)}`);
  }

  // Verify OAuth state parameter (CSRF protection)
  const savedState = req.cookies.get("oauth_state")?.value;
  if (!state || !savedState || !timingSafeEqual(state, savedState)) {
    console.error("OAuth state mismatch or missing state parameter.");
    return NextResponse.redirect(
      `${baseUrl}/settings?error=${encodeURIComponent("Security verification failed: OAuth state mismatch.")}`
    );
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

    const response = NextResponse.redirect(`${baseUrl}/settings?connected=true`);
    // Clear the oauth_state cookie
    response.cookies.delete("oauth_state");
    return response;
  } catch (err: unknown) {
    const e = err as Error;
    console.error("OAuth callback exchange failed:", e);
    return NextResponse.redirect(
      `${baseUrl}/settings?error=${encodeURIComponent(e.message || "exchange_failed")}`
    );
  }
}
