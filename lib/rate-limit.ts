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

export function rateLimit(options: RateLimitOptions) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const ip = req.headers['x-forwarded-for'] as string || 
               req.headers['x-real-ip'] as string ||
               req.socket.remoteAddress ||
               'unknown';
    
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