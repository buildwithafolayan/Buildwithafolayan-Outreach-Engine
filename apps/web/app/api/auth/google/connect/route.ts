import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/gmail/oauth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const dynamicRedirectUri = `${origin}/api/auth/callback/google`;

  try {
    const state = crypto.randomUUID();
    const authUrl = getGoogleOAuthUrl(dynamicRedirectUri, state);

    const response = NextResponse.redirect(authUrl);
    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
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
