import { getRedis } from "@/lib/redis";
import { getRateLimiter } from "@/lib/rate-limit";
import { withErrorResponse, withHeaders } from "../utils";
import type { Middleware } from "../types";
import { LIMIT_PER_WINDOW, WINDOW_IN_SECONDS } from "../config";

export const rateLimitMiddleware: Middleware = async (req, next) => {
  try {
    // Get cached clients for redis and rate limiting
    const redis = await getRedis();

    // Special handling for SSE endpoints - use higher limits
    const isSSEEndpoint = req.nextUrl.pathname.startsWith("/api/sse");
    const limit = isSSEEndpoint ? LIMIT_PER_WINDOW * 5 : LIMIT_PER_WINDOW; // 5x higher limit for SSE
    const windowSec = isSSEEndpoint ? WINDOW_IN_SECONDS * 2 : WINDOW_IN_SECONDS; // 2x longer window for SSE

    const limiter = await getRateLimiter(redis, {
      limit,
      windowSec,
    });

    // Identify client (IP or fallback)
    const ip =
      req.headers.get("x-forwarded-for")?.toString() ??
      req.headers.get("x-real-ip")?.toString() ??
      req.headers.get("host")?.toString() ??
      "unknown";

    // Check the rate limit
    const {
      success,
      limit: actualLimit,
      remaining,
      reset,
    } = await limiter.limit(ip);

    // Prepare common rate limit headers
    const responseHeaders = {
      "X-RateLimit-Limit": actualLimit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    };

    if (!success) {
      // If the limit is exceeded, return a 429 response
      console.warn(
        `Rate limit exceeded for IP: ${ip} on ${req.nextUrl.pathname}`,
      );
      return withErrorResponse("Rate limit exceeded", 429, {
        ...responseHeaders,
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      });
    }

    const resp = await next();
    return withHeaders(resp, responseHeaders);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      `[RateLimitMiddleware] Redis unavailable, allowing request to proceed: ${errorMessage}`,
    );

    return await next();
  }
};
