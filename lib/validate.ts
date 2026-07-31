// Input validation, sanitisation and rate limiting for API routes

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const PHONE_RE = /^[+\d][\d\s\-()]{6,19}$/

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value)
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 320 && EMAIL_RE.test(value.trim())
}

export function isTime(value: unknown): value is string {
  return typeof value === "string" && TIME_RE.test(value)
}

export function isDate(value: unknown): value is string {
  return typeof value === "string" && DATE_RE.test(value)
}

export function isPhone(value: unknown): value is string {
  return typeof value === "string" && PHONE_RE.test(value.trim())
}

/** Trim, strip control characters and cap the length of a free-text field */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return ""
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength)
}

export function isHttpUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.length > 2000) return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

/** Strip anything path-like from an uploaded file name */
export function safeFileName(name: unknown): string {
  return cleanText(name, 150).replace(/[/\\<>:"|?*]/g, "_") || "file"
}

// ── Simple in-memory rate limiter (per key, fixed window) ────────
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  bucket.count++
  if (buckets.size > 10_000) {
    // prevent unbounded growth
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k)
  }
  return bucket.count <= limit
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded ? forwarded.split(",")[0].trim() : "local"
}
