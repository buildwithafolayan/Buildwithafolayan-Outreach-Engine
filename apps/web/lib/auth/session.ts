/**
 * Cryptographic Server-Side Session Manager for Favour Outreach OS
 * Implemented with Web Crypto API for compatibility across Next.js Edge Middleware and Node.js runtime.
 */

export const SESSION_COOKIE_NAME = "outreach_os_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getAppSecret(): string {
  const secret =
    process.env.APP_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "favour-outreach-os-secure-vault-key-2026";
  return secret;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "favour2026!";
}

/**
 * Constant-time comparison to prevent timing attacks.
 * Unconditionally iterates across maxLen to avoid length-based timing leaks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    diff |= charA ^ charB;
  }
  return diff === 0;
}

/**
 * Helper to derive an AES-GCM key from APP_SECRET using SHA-256.
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const secretBytes = enc.encode(getAppSecret());
  const hash = await crypto.subtle.digest("SHA-256", secretBytes);
  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a string using AES-256-GCM with a randomized 12-byte IV.
 */
export async function encryptData(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const ivB64 = base64UrlEncode(iv);
  const dataB64 = base64UrlEncode(new Uint8Array(encrypted));
  return `${ivB64}.${dataB64}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string. Returns null if invalid or tampered with.
 */
export async function decryptData(cipherText: string): Promise<string | null> {
  try {
    const parts = cipherText.split(".");
    if (parts.length !== 2) return null;
    const [ivB64, dataB64] = parts;
    const iv = base64UrlDecode(ivB64);
    const data = base64UrlDecode(dataB64);
    const key = await getEncryptionKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      data.buffer as ArrayBuffer
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

/**
 * Verify if the submitted password matches the configured administrative password.
 */
export function verifyAdminPassword(candidate: string): boolean {
  if (!candidate) return false;
  const expected = getAdminPassword();
  return timingSafeEqual(candidate.trim(), expected.trim());
}

/**
 * Helper to get HMAC CryptoKey using Web Crypto API.
 */
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const secretBytes = enc.encode(getAppSecret());
  return await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Base64URL encoder helper.
 */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Base64URL decoder helper.
 */
function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface SessionPayload {
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Create a cryptographically signed session token.
 */
export async function createSessionToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: "admin",
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  };

  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(enc.encode(payloadJson));

  const key = await getCryptoKey();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadB64)
  );
  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBytes));

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verify a cryptographic session token and ensure it has not expired.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ valid: boolean; payload?: SessionPayload }> {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadB64, signatureB64] = parts;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const sigBytes = base64UrlDecode(signatureB64);
    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      enc.encode(payloadB64)
    );

    if (!verified) {
      return { valid: false };
    }

    const payloadBytes = base64UrlDecode(payloadB64);
    const payloadText = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadText) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false }; // Expired
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
