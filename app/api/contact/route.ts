import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { DEFAULT_CONTACT, normalizeContact } from "@/lib/content"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { data } = await getSupabaseAdmin().from("site_content").select("value").eq("key", "contact").maybeSingle()
  const response = NextResponse.json({ contact: data?.value ?? DEFAULT_CONTACT })
  if (!request.headers.get("x-auth-token")) {
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  }
  return response
}

export async function PUT(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const contact = normalizeContact(body)
  const { error } = await getSupabaseAdmin()
    .from("site_content")
    .upsert({ key: "contact", value: contact, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) {
    return NextResponse.json({ error: "Could not save contact details." }, { status: 500 })
  }
  return NextResponse.json({ contact })
}
