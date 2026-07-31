import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { cleanText, isTime, isHttpUrl } from "./validate"

/** Supabase server wiring — reads keys from .env (never logged). */

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const anonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ""

export function isSupabaseConfigured(): boolean {
  return Boolean(url() && anonKey() && serviceKey())
}

// Next.js patches global fetch with caching inside route handlers — force
// no-store so every Supabase read reflects the latest data.
const uncachedFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" })

let adminClient: SupabaseClient | null = null

/** Server-only client with full access (service role). Never import in client components. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured — add keys to .env (see .env.example).")
  }
  if (!adminClient) {
    adminClient = createClient(url(), serviceKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: uncachedFetch },
    })
  }
  return adminClient
}

/** Anon-key client, used server-side to verify email/password sign-ins. */
export function getSupabaseAuth(): SupabaseClient {
  return createClient(url(), anonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: uncachedFetch },
  })
}

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "careerofexcellence.learn@gmail.com").toLowerCase()

export type ApiSession = {
  token: string
  user_id: string | null
  email: string
  role: "admin" | "user"
}

/** Look up the app session for a request's x-auth-token header. */
export async function getApiSession(request: Request): Promise<ApiSession | null> {
  const token = request.headers.get("x-auth-token")
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return null
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from("sessions").select("*").eq("token", token).maybeSingle()
  return (data as ApiSession | null) ?? null
}

export async function requireAdminSession(request: Request): Promise<ApiSession | null> {
  const session = await getApiSession(request)
  return session?.role === "admin" ? session : null
}

// ── Row ↔ API mapping (DB is snake_case, the frontend expects camelCase) ──

export function serviceToApi(row: any, includeZoom: boolean) {
  const base = {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    objectives: row.objectives ?? [],
    duration: row.duration ?? "",
    price: Number(row.price ?? 0),
    offerPrice: row.offer_price === null || row.offer_price === undefined ? null : Number(row.offer_price),
    offerLabel: row.offer_label ?? "",
    classStart: row.class_start ?? "10:00",
    classEnd: row.class_end ?? "18:00",
    oneOnOneStart: row.one_on_one_start ?? "19:00",
    oneOnOneEnd: row.one_on_one_end ?? "20:00",
    certificateProvided: Boolean(row.certificate_provided),
  }
  return includeZoom ? { ...base, zoomLink: row.zoom_link ?? "" } : base
}

const MAX_PRICE = 10_000_000

/** Map request-body fields (camelCase) to DB columns — every field sanitised and clamped. */
export function serviceBodyToRow(body: any): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (body.title !== undefined) row.title = cleanText(body.title, 120)
  if (body.description !== undefined) row.description = cleanText(body.description, 600)
  if (body.objectives !== undefined)
    row.objectives = Array.isArray(body.objectives)
      ? body.objectives
          .slice(0, 12)
          .map((o: unknown) => cleanText(o, 200))
          .filter(Boolean)
      : []
  if (body.duration !== undefined) row.duration = cleanText(body.duration, 60)
  if (body.price !== undefined) row.price = Math.min(MAX_PRICE, Math.max(0, Number(body.price) || 0))
  if (body.offerPrice !== undefined)
    row.offer_price =
      body.offerPrice === null || body.offerPrice === ""
        ? null
        : Math.min(MAX_PRICE, Math.max(0, Number(body.offerPrice) || 0))
  if (body.offerLabel !== undefined) row.offer_label = cleanText(body.offerLabel, 40)
  if (body.classStart !== undefined && isTime(body.classStart)) row.class_start = body.classStart
  if (body.classEnd !== undefined && isTime(body.classEnd)) row.class_end = body.classEnd
  if (body.oneOnOneStart !== undefined && isTime(body.oneOnOneStart)) row.one_on_one_start = body.oneOnOneStart
  if (body.oneOnOneEnd !== undefined && isTime(body.oneOnOneEnd)) row.one_on_one_end = body.oneOnOneEnd
  if (body.zoomLink !== undefined) row.zoom_link = isHttpUrl(body.zoomLink) ? String(body.zoomLink) : ""
  if (body.certificateProvided !== undefined) row.certificate_provided = Boolean(body.certificateProvided)
  return row
}

// ── Short-lived services cache: makes the public home page fast ──
let servicesCache: { rows: any[]; at: number } | null = null
const SERVICES_CACHE_TTL = 30_000

export async function getServicesRows(fresh = false): Promise<any[]> {
  if (!fresh && servicesCache && Date.now() - servicesCache.at < SERVICES_CACHE_TTL) {
    return servicesCache.rows
  }
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw new Error("services query failed")
  servicesCache = { rows: data ?? [], at: Date.now() }
  return servicesCache.rows
}

export function invalidateServicesCache() {
  servicesCache = null
}

export function certificateToApi(row: any) {
  const { data } = getSupabaseAdmin().storage.from("materials").getPublicUrl(row.storage_path)
  return {
    id: row.id,
    registrationId: row.registration_id,
    name: row.name,
    path: data.publicUrl,
    uploadedAt: row.uploaded_at,
  }
}

export function materialToApi(row: any) {
  const { data } = getSupabaseAdmin().storage.from("materials").getPublicUrl(row.storage_path)
  return {
    id: row.id,
    serviceId: row.service_id,
    name: row.name,
    path: data.publicUrl,
    mime: row.mime ?? "",
    size: Number(row.size ?? 0),
    uploadedAt: row.uploaded_at,
  }
}
