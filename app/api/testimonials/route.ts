import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { cleanText } from "@/lib/validate"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { data, error } = await getSupabaseAdmin()
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) {
    return NextResponse.json({ error: "Could not load stories." }, { status: 500 })
  }
  const response = NextResponse.json({ testimonials: data ?? [] })
  if (!request.headers.get("x-auth-token")) {
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  }
  return response
}

export async function POST(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  const quote = cleanText(body.quote, 500)
  const name = cleanText(body.name, 80)
  const role = cleanText(body.role, 80)
  if (!quote || !name) {
    return NextResponse.json({ error: "Quote and name are required." }, { status: 400 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from("testimonials")
    .insert({ quote, name, role })
    .select()
    .single()
  if (error || !data) {
    return NextResponse.json({ error: "Could not save the story." }, { status: 500 })
  }
  return NextResponse.json({ testimonial: data })
}
