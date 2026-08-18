import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  verifyAdminPassword,
} from "@/lib/auth/session";

// In-memory rate limiting for login attempts
const attemptTracker = new Map<string, { attempts: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remainingWait?: number } {
  const now = Date.now();
  const entry = attemptTracker.get(ip);

  if (!entry || entry.resetAt < now) {
    attemptTracker.set(ip, { attempts: 1, resetAt: now + 60 * 1000 });
    return { allowed: true };
  }

  if (entry.attempts >= 5) {
    const waitSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remainingWait: waitSec };
  }

  entry.attempts += 1;
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please wait ${rateLimit.remainingWait} seconds before retrying.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Access denied. Please check your credentials." },
        { status: 401 }
      );
    }

    // Reset rate limiter on success
    attemptTracker.delete(ip);

    // Create cryptographic session token
    const token = await createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Access granted.",
    });

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login authentication error:", error);
    return NextResponse.json(
      { error: "Authentication system error. Please try again." },
      { status: 500 }
    );
  }
}
