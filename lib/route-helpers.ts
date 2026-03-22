import { NextRequest, NextResponse } from "next/server";

// ── Rate Limiting ──────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ipList = forwarded.split(",").map((ip) => ip.trim());
    return ipList[ipList.length - 1] || "unknown";
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Check rate limit for an App Router route handler.
 * Returns a 429 Response if rate limited, or null to proceed.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
    return null;
  }

  if (entry.count >= options.maxRequests) {
    return NextResponse.json(
      {
        error: options.message || "Too many requests",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      },
      { status: 429 },
    );
  }

  entry.count++;
  return null;
}

// ── CSRF Protection ────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://jomaendle.com",
  "https://www.jomaendle.com",
];

if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://127.0.0.1:3000");
}

function extractOrigin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

/**
 * Check CSRF protection for an App Router route handler.
 * Returns a 403 Response if CSRF validation fails, or null to proceed.
 */
export function checkCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) return null;
    return NextResponse.json(
      { error: "Forbidden", message: "CSRF validation failed" },
      { status: 403 },
    );
  }

  if (referer) {
    const refererOrigin = extractOrigin(referer);
    if (refererOrigin && ALLOWED_ORIGINS.includes(refererOrigin)) return null;
    return NextResponse.json(
      { error: "Forbidden", message: "CSRF validation failed" },
      { status: 403 },
    );
  }

  return NextResponse.json(
    { error: "Forbidden", message: "CSRF validation failed" },
    { status: 403 },
  );
}
