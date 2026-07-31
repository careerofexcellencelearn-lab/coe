import { NextResponse } from "next/server"
import {
  getSupabaseAdmin,
  requireAdminSession,
  serviceToApi,
  serviceBodyToRow,
  getServicesRows,
  invalidateServicesCache,
} from "@/lib/supabase"

export const dynamic = "force-dynamic"

// Public list (cached for 30s) — zoom link is only included for the admin
export async function GET(request: Request) {
  try {
    const isAdmin = request.headers.get("x-auth-token") ? Boolean(await requireAdminSession(request)) : false
    const rows = await getServicesRows(isAdmin) // admin always reads fresh
    const response = NextResponse.json({ services: rows.map((row) => serviceToApi(row, isAdmin)) })
    // Anonymous responses are safe to cache on the CDN edge; admin requests use
    // a distinct URL (?fresh=1) plus the auth header, so they never share a
    // cache entry with the public response.
    if (!isAdmin && !request.headers.get("x-auth-token")) {
      response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    }
    return response
  } catch {
    return NextResponse.json({ error: "Could not load services." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const row = serviceBodyToRow(body)
  if (!row.title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 })
  }
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("services").insert(row).select().single()
  if (error || !data) {
    return NextResponse.json({ error: "Could not create service." }, { status: 500 })
  }
  invalidateServicesCache()
  return NextResponse.json({ service: serviceToApi(data, true) })
}
