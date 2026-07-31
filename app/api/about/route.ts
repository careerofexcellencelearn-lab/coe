import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { DEFAULT_ABOUT, normalizeAbout } from "@/lib/content"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { data } = await getSupabaseAdmin().from("site_content").select("value").eq("key", "about").maybeSingle()
  const response = NextResponse.json({ about: data?.value ?? DEFAULT_ABOUT })
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
  const about = normalizeAbout(body)
  if (about.bio.length === 0) {
    return NextResponse.json({ error: "The about text cannot be empty." }, { status: 400 })
  }
  const { error } = await getSupabaseAdmin()
    .from("site_content")
    .upsert({ key: "about", value: about, updated_at: new Date().toISOString() }, { onConflict: "key" })
  if (error) {
    return NextResponse.json({ error: "Could not save the about page." }, { status: 500 })
  }
  return NextResponse.json({ about })
}
