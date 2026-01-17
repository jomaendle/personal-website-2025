import { NextApiRequest, NextApiResponse } from "next";

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

const ALLOWED_ORIGINS = [
  "https://jomaendle.com",
  "https://www.jomaendle.com",
];

// Add localhost for development
if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:3000");
  ALLOWED_ORIGINS.push("http://127.0.0.1:3000");
}

/**
 * Extracts the origin from a URL string.
 * Returns null if the URL is invalid.
 */
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
 * Validates the request origin against allowed origins.
 * Checks both Origin and Referer headers.
 */
function isValidOrigin(req: NextApiRequest): boolean {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Origin header takes precedence (sent by browsers for POST/PUT/DELETE)
  if (origin) {
    return ALLOWED_ORIGINS.includes(origin);
  }

  // Fall back to Referer header
  if (referer) {
    const refererOrigin = extractOrigin(referer);
    return refererOrigin !== null && ALLOWED_ORIGINS.includes(refererOrigin);
  }

  // If neither header is present, reject the request
  // This may happen with curl or non-browser clients
  // For API endpoints that need to be accessible from other sources,
  // consider using a different auth mechanism
  return false;
}

export interface CsrfOptions {
  /** Custom error message when CSRF validation fails */
  message?: string;
  /** HTTP methods that require CSRF validation (default: POST, PUT, PATCH, DELETE) */
  methods?: string[];
  /** Skip validation for these paths */
  skipPaths?: string[];
}

/**
 * CSRF protection middleware using Origin/Referer validation.
 * Wraps an API handler to validate the request origin.
 */
export function withCsrfProtection(
  handler: ApiHandler,
  options: CsrfOptions = {}
): ApiHandler {
  const {
    message = "CSRF validation failed",
    methods = ["POST", "PUT", "PATCH", "DELETE"],
  } = options;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method?.toUpperCase();

    // Only validate specified HTTP methods
    if (method && methods.includes(method)) {
      if (!isValidOrigin(req)) {
        return res.status(403).json({
          error: "Forbidden",
          message,
        });
      }
    }

    return handler(req, res);
  };
}

/**
 * Combines multiple middleware functions.
 * Executes them in order, stopping if any returns a response.
 */
export function composeMiddleware(
  ...middlewares: ((handler: ApiHandler) => ApiHandler)[]
): (handler: ApiHandler) => ApiHandler {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
