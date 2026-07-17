/**
 * CORS Middleware for the ShopUncle API backend.
 *
 * Only the configured FRONTEND_URL (and optionally localhost) is allowed
 * to make cross-origin requests. All other origins receive a 403.
 */
import { NextRequest, NextResponse } from 'next/server'

const RAW_ALLOWED = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || ''

/** Build a Set of normalised, lowercase origins allowed to call this API. */
function buildAllowedSet(): Set<string> {
  const origins = new Set<string>()

  // Always allow same-origin and localhost in development
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://localhost:3001')
    origins.add('http://127.0.0.1:3000')
  }

  // Parse comma-separated env var  e.g. "https://shopuncle.vercel.app,https://www.shopuncle.in"
  RAW_ALLOWED.split(',')
    .map(o => o.trim().toLowerCase().replace(/\/$/, ''))
    .filter(Boolean)
    .forEach(o => origins.add(o))

  return origins
}

const ALLOWED_ORIGINS = buildAllowedSet()

/**
 * Call this at the top of every API route handler to:
 *  1. Reject disallowed cross-origin requests with 403.
 *  2. Respond to preflight (OPTIONS) immediately with 204.
 *  3. Add the appropriate `Access-Control-*` headers to the response.
 *
 * Usage:
 *   const corsResult = handleCors(request)
 *   if (corsResult) return corsResult          // preflight or blocked
 *   // … your handler logic …
 *   return addCorsHeaders(request, response)   // tag the final response
 */
export function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin') ?? ''
  const normalised = origin.toLowerCase().replace(/\/$/, '')
  const allowed = !origin || ALLOWED_ORIGINS.has(normalised)

  // Reject blocked origins
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Respond to preflight OPTIONS immediately
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: buildCorsHeaders(origin),
    })
  }

  return null // continue to the route handler
}

/** Attach CORS headers to an existing NextResponse. */
export function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin') ?? ''
  const headers = buildCorsHeaders(origin)
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

function buildCorsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-shop-owner-key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}
