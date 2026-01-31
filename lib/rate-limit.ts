import { NextApiRequest, NextApiResponse } from "next";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

/**
 * Extract the client IP address from request headers.
 * Handles x-forwarded-for as array or comma-separated string.
 * Takes the rightmost IP (closest to server) as it's most trustworthy.
 */
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    // Handle both array and string formats
    const ips = Array.isArray(forwarded) ? forwarded[0] ?? "" : forwarded;
    if (ips) {
      // Split by comma and get the rightmost (most trusted) IP
      const ipList = ips.split(",").map((ip) => ip.trim());
      return ipList[ipList.length - 1] || "unknown";
    }
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    const ip = Array.isArray(realIp) ? realIp[0] : realIp;
    if (ip) return ip;
  }

  return req.socket.remoteAddress || "unknown";
}

export function rateLimit(options: RateLimitOptions) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const ip = getClientIp(req);
    
    const key = `${ip}:${req.url}`;
    const now = Date.now();
    
    const entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Reset window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return next();
    }
    
    if (entry.count >= options.maxRequests) {
      res.status(429).json({
        error: options.message || "Too many requests",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
      return;
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    next();
  };
}

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  options: RateLimitOptions
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      rateLimit(options)(req, res, () => {
        try {
          const result = handler(req, res);
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}