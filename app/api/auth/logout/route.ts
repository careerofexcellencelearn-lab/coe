import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const token = request.headers.get("x-auth-token")
  if (token && /^[0-9a-f-]{36}$/i.test(token)) {
    await getSupabaseAdmin().from("sessions").delete().eq("token", token)
  }
  return NextResponse.json({ ok: true })
}
