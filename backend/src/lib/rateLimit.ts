/**
 * In-memory sliding-window rate limiter.
 * No Redis required — works on a single Node process (Render free-tier compatible).
 *
 * Usage:
 *   const allowed = rateLimit(request, { limit: 10, windowMs: 60_000 })
 *   if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface WindowEntry {
  count: number
  windowStart: number
}

const store = new Map<string, WindowEntry>()

// Clean up stale entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now - entry.windowStart > 15 * 60 * 1000) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  /** Max requests per window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
  /** Optional prefix to namespace different limiters */
  keyPrefix?: string
}

/**
 * Returns `true` if the request is within the rate limit, `false` if it should be blocked.
 * The key is derived from the client IP address.
 */
export function rateLimit(
  request: { headers: { get(name: string): string | null } },
  options: RateLimitOptions
): boolean {
  const { limit, windowMs, keyPrefix = 'rl' } = options

  // Derive client IP from standard headers (works behind Render/Vercel proxies)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const key = `${keyPrefix}:${ip}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= windowMs) {
    // Start a new window
    store.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= limit) {
    return false // blocked
  }

  entry.count++
  return true
}

// ─── Pre-configured limiters ─────────────────────────────────────────────────

/** General API endpoints — 100 requests per 15 minutes */
export const generalLimit: RateLimitOptions = {
  limit: 100,
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'general',
}

/** Auth endpoints (login, register) — 10 requests per minute */
export const authLimit: RateLimitOptions = {
  limit: 10,
  windowMs: 60 * 1000,
  keyPrefix: 'auth',
}

/** File upload — 20 uploads per 10 minutes */
export const uploadLimit: RateLimitOptions = {
  limit: 20,
  windowMs: 10 * 60 * 1000,
  keyPrefix: 'upload',
}

/** Order creation — 30 orders per 15 minutes */
export const orderLimit: RateLimitOptions = {
  limit: 30,
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'order',
}

/** Admin bulk operations — 20 per minute */
export const adminLimit: RateLimitOptions = {
  limit: 20,
  windowMs: 60 * 1000,
  keyPrefix: 'admin',
}
