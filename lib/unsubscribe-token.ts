import crypto from "crypto";

const TOKEN_EXPIRY_DAYS = 30; // Tokens expire after 30 days

function getSecretKey(): string {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) {
    // Fallback to a derived key from other secrets for backwards compatibility
    const fallback = process.env.RESEND_API_KEY;
    if (!fallback) {
      throw new Error("UNSUBSCRIBE_TOKEN_SECRET is not configured");
    }
    return crypto.createHash("sha256").update(fallback).digest("hex");
  }
  return secret;
}

function createSignature(payload: string): string {
  return crypto
    .createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("hex");
}

export interface TokenPayload {
  email: string;
  timestamp: number;
}

/**
 * Creates a signed unsubscribe token for an email address.
 * The token encodes the email and timestamp, signed with HMAC-SHA256.
 */
export function createUnsubscribeToken(email: string): string {
  const payload: TokenPayload = {
    email: email.toLowerCase().trim(),
    timestamp: Date.now(),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = createSignature(payloadBase64);

  // Format: payload.signature (similar to JWT structure)
  return `${payloadBase64}.${signature}`;
}

export interface VerifyResult {
  valid: boolean;
  email?: string;
  error?: string;
}

/**
 * Verifies an unsubscribe token and extracts the email.
 * Returns the email if valid, or an error if invalid/expired.
 */
export function verifyUnsubscribeToken(token: string): VerifyResult {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Token is required" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid token format" };
  }

  const payloadBase64 = parts[0];
  const providedSignature = parts[1];

  if (!payloadBase64 || !providedSignature) {
    return { valid: false, error: "Invalid token format" };
  }

  // Verify signature
  const expectedSignature = createSignature(payloadBase64);
  if (!crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  )) {
    return { valid: false, error: "Invalid token signature" };
  }

  // Decode payload
  let payload: TokenPayload;
  try {
    const decoded = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    payload = JSON.parse(decoded) as TokenPayload;
  } catch {
    return { valid: false, error: "Invalid token payload" };
  }

  // Validate payload structure
  if (!payload.email || typeof payload.email !== "string") {
    return { valid: false, error: "Invalid email in token" };
  }

  if (!payload.timestamp || typeof payload.timestamp !== "number") {
    return { valid: false, error: "Invalid timestamp in token" };
  }

  // Check expiration
  const expiryMs = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - payload.timestamp > expiryMs) {
    return { valid: false, error: "Token has expired" };
  }

  return {
    valid: true,
    email: payload.email,
  };
}

/**
 * Generates an unsubscribe URL with a signed token.
 */
export function generateUnsubscribeUrl(email: string, baseUrl: string = "https://jomaendle.com"): string {
  const token = createUnsubscribeToken(email);
  return `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}
