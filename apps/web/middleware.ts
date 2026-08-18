import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Whitelist static assets & OAuth callback
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/callback/google";

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { valid } = await verifySessionToken(sessionCookie);

  // 2. If logged in and visiting /login -> redirect to /
  if (valid && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. If public route -> allow through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. If invalid session:
  if (!valid) {
    // If requesting an API route, reject with 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized: Private Outreach OS Access Required." },
        { status: 401 }
      );
    }

    // If requesting a page, redirect to the access gate
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. Authenticated access granted
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
