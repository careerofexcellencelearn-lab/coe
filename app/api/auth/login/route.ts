import { NextResponse } from "next/server"
import { getSupabaseAdmin, getSupabaseAuth, ADMIN_EMAIL } from "@/lib/supabase"
import { isEmail, cleanText, rateLimit, clientIp } from "@/lib/validate"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  // Brute-force protection: 10 attempts per minute per IP
  if (!rateLimit(`login:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many login attempts. Please wait a minute." }, { status: 429 })
  }

  const body = await request.json().catch(() => ({}))
  const email = cleanText(body.email, 320).toLowerCase()
  const password = typeof body.password === "string" ? body.password.slice(0, 72) : ""
  const requestedRole = body.role === "admin" ? "admin" : "user"

  if (!isEmail(email) || password.length < 6) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }

  // Verify credentials against Supabase Auth
  const auth = getSupabaseAuth()
  const { data: signIn, error: signInError } = await auth.auth.signInWithPassword({ email, password })
  if (signInError || !signIn.user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  let { data: profile } = await admin.from("profiles").select("*").eq("id", signIn.user.id).maybeSingle()
  if (!profile) {
    const { data: created } = await admin
      .from("profiles")
      .insert({ id: signIn.user.id, email, name: email.split("@")[0] })
      .select()
      .single()
    profile = created
  }

  const isAdmin = profile?.role === "admin" || email === ADMIN_EMAIL
  if (requestedRole === "admin" && !isAdmin) {
    return NextResponse.json({ error: "This account does not have admin access." }, { status: 403 })
  }

  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .insert({ user_id: signIn.user.id, email, role: requestedRole })
    .select()
    .single()
  if (sessionError || !session) {
    return NextResponse.json({ error: "Could not create session. Please try again." }, { status: 500 })
  }

  return NextResponse.json({
    token: session.token,
    role: requestedRole,
    email,
    name: profile?.name ?? email.split("@")[0],
  })
}
