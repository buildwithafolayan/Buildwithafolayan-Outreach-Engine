import { cookies } from "next/headers";
import { encryptData, decryptData } from "@/lib/auth/session";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";

export const GMAIL_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export function getGoogleOAuthUrl(customRedirectUri?: string, state?: string): string {
  const clientId = (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ""
  ).trim();
  const redirectUri =
    customRedirectUri ||
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/callback/google";

  if (!clientId) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured in environment variables. Please add it to your Vercel project settings."
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  if (state) {
    params.set("state", state);
  }

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface GmailAccountInfo {
  email: string;
  name?: string;
  picture?: string;
  connectedAt: string;
  hasRefreshToken: boolean;
  status: "CONNECTED" | "DISCONNECTED" | "REAUTH_REQUIRED";
}

/**
 * Exchange the authorization code for access and refresh tokens.
 */
export async function exchangeCodeForTokens(
  code: string,
  customRedirectUri?: string
): Promise<{
  tokens: GoogleTokens;
  profile: { email: string; name?: string; picture?: string };
}> {
  const clientId = (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ""
  ).trim();
  const clientSecret = (
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ||
    ""
  ).trim();
  const redirectUri =
    customRedirectUri ||
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/callback/google";

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured in environment variables.");
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Token exchange failed:", errText);
    throw new Error(`Failed to exchange Google OAuth code: ${errText}`);
  }

  const tokens = (await tokenRes.json()) as GoogleTokens;

  // Fetch profile to get connected email
  const profileRes = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  let profile = { email: "", name: "", picture: "" };
  if (profileRes.ok) {
    profile = await profileRes.json();
  }

  return { tokens, profile };
}

/**
 * Refresh an expired access token using the stored refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials missing.");
  }

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh Gmail access token. Reauthorization may be required.");
  }

  const data = await res.json();
  return data.access_token;
}

const GMAIL_ACCOUNT_COOKIE = "gmail_account_session";

interface StoredGmailSession {
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  connectedAt: string;
  status: string;
}

/**
 * Retrieve and decrypt the raw session payload from the HTTP-only cookie.
 */
export async function getRawGmailSession(): Promise<StoredGmailSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(GMAIL_ACCOUNT_COOKIE);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  // Check if encrypted format (contains dot separating IV and ciphertext)
  if (sessionCookie.value.includes(".")) {
    const decrypted = await decryptData(sessionCookie.value);
    if (decrypted) {
      try {
        return JSON.parse(decrypted) as StoredGmailSession;
      } catch {
        return null;
      }
    }
  }

  // Fallback for legacy unencrypted JSON
  try {
    const data = JSON.parse(sessionCookie.value);
    // Upgrade legacy session to encrypted
    await saveGmailSession(data);
    return data as StoredGmailSession;
  } catch {
    return null;
  }
}

/**
 * Store connected Gmail account session with AES-GCM encrypted tokens in secure HTTP-only cookies.
 */
export async function saveGmailSession(account: {
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
}) {
  const cookieStore = await cookies();
  const sessionData: StoredGmailSession = {
    email: account.email,
    name: account.name,
    picture: account.picture,
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    connectedAt: new Date().toISOString(),
    status: "CONNECTED",
  };

  const encrypted = await encryptData(JSON.stringify(sessionData));

  cookieStore.set(GMAIL_ACCOUNT_COOKIE, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Retrieve the current connected Gmail account info (without exposing tokens).
 */
export async function getConnectedGmailAccount(): Promise<GmailAccountInfo | null> {
  const session = await getRawGmailSession();

  if (!session) {
    return null;
  }

  return {
    email: session.email,
    name: session.name,
    picture: session.picture,
    connectedAt: session.connectedAt,
    hasRefreshToken: Boolean(session.refreshToken),
    status: "CONNECTED",
  };
}

/**
 * Remove the connected Gmail account session.
 */
export async function clearGmailSession() {
  const cookieStore = await cookies();
  cookieStore.delete(GMAIL_ACCOUNT_COOKIE);
}

/**
 * Send an email through the Gmail API.
 */
export async function sendGmailMessage(params: {
  to: string;
  subject: string;
  bodyText: string;
  fromEmail?: string;
  inReplyTo?: string;
  references?: string;
  threadId?: string;
}): Promise<{ messageId: string; threadId: string }> {
  const session = await getRawGmailSession();

  if (!session) {
    throw new Error("No Gmail account connected. Please connect Gmail first.");
  }

  let accessToken = session.accessToken;

  // Build RFC 2822 email message
  const lines: string[] = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
  ];

  if (params.fromEmail || session.email) {
    lines.unshift(`From: ${params.fromEmail || session.email}`);
  }

  if (params.inReplyTo) {
    lines.push(`In-Reply-To: ${params.inReplyTo}`);
  }

  if (params.references) {
    lines.push(`References: ${params.references}`);
  }

  lines.push("", params.bodyText);
  const rawMessage = lines.join("\r\n");

  // Base64URL encode
  const base64Encoded = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  let res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: base64Encoded,
      ...(params.threadId ? { threadId: params.threadId } : {}),
    }),
  });

  // If unauthorized and we have a refresh token, refresh and retry once
  if (res.status === 401 && session.refreshToken) {
    accessToken = await refreshAccessToken(session.refreshToken);
    session.accessToken = accessToken;
    await saveGmailSession(session);

    res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: base64Encoded,
        ...(params.threadId ? { threadId: params.threadId } : {}),
      }),
    });
  }

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Gmail API send failed: ${errorData}`);
  }

  const result = await res.json();
  return {
    messageId: result.id,
    threadId: result.threadId,
  };
}
