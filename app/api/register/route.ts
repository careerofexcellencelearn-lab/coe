import { NextResponse } from "next/server"
import { getSupabaseAdmin, getSupabaseAuth } from "@/lib/supabase"
import { isEmail, isPhone, isUuid, cleanText, rateLimit, clientIp } from "@/lib/validate"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  // Abuse protection: 5 registrations per minute per IP
  if (!rateLimit(`register:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 })
  }

  const body = await request.json().catch(() => ({}))
  const name = cleanText(body.name, 100)
  const email = cleanText(body.email, 320).toLowerCase()
  const phone = cleanText(body.phone, 20)
  const password = typeof body.password === "string" ? body.password.slice(0, 72) : ""
  const serviceId = body.serviceId
  const message = cleanText(body.message, 1000)

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 })
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }
  if (!isPhone(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
  }
  if (!isUuid(serviceId)) {
    return NextResponse.json({ error: "Selected service was not found." }, { status: 404 })
  }

  const admin = getSupabaseAdmin()
  const { data: service } = await admin.from("services").select("id").eq("id", serviceId).maybeSingle()
  if (!service) {
    return NextResponse.json({ error: "Selected service was not found." }, { status: 404 })
  }

  // Create the auth account (or verify the password if it already exists)
  let userId: string | null = null
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, phone },
  })

  if (createError) {
    const { data: signIn, error: signInError } = await getSupabaseAuth().auth.signInWithPassword({ email, password })
    if (signInError || !signIn.user) {
      return NextResponse.json(
        { error: "This email already has an account with a different password. Please use your existing password." },
        { status: 409 },
      )
    }
    userId = signIn.user.id
  } else {
    userId = created.user.id
  }

  await admin.from("profiles").upsert({ id: userId, email, name, phone }, { onConflict: "id" })

  const { error: regError } = await admin
    .from("registrations")
    .insert({ user_id: userId, service_id: serviceId, message })
  if (regError) {
    if (regError.code === "23505") {
      return NextResponse.json({ error: "You have already registered for this service." }, { status: 409 })
    }
    return NextResponse.json({ error: "Could not save your registration. Please try again." }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message: "Registration received! Our team will contact you soon for confirmation.",
  })
}
