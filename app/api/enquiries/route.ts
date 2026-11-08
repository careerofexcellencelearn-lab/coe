import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { cleanText, clientIp, isEmail, isPhone, rateLimit } from "@/lib/validate"

export const dynamic = "force-dynamic"

const CONTACT_METHODS = ["", "phone", "whatsapp", "email"]

function enquiryToApi(row: any) {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    phone: row.phone,
    email: row.email,
    program: row.program ?? "",
    contactMethod: row.contact_method ?? "",
    preferredTime: row.preferred_time ?? "",
    message: row.message ?? "",
    status: row.status,
    createdAt: row.created_at,
  }
}

// Public: save a demo request / enquiry from the website form
export async function POST(request: Request) {
  // Abuse protection: 5 enquiries per 10 minutes per IP
  if (!rateLimit(`enquiry:${clientIp(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes, or call / WhatsApp us instead." },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => ({}))
  // Honeypot: real visitors never fill this hidden field; pretend success for bots
  if (cleanText(body.website, 100)) return NextResponse.json({ ok: true })

  const name = cleanText(body.name, 100)
  const phone = cleanText(body.phone, 20)
  const email = cleanText(body.email, 320).toLowerCase()
  const kind = body.kind === "enquiry" ? "enquiry" : "demo"
  const contactMethod = CONTACT_METHODS.includes(body.contactMethod) ? body.contactMethod : ""

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name.", field: "name" }, { status: 400 })
  }
  if (!isPhone(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number.", field: "phone" }, { status: 400 })
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address.", field: "email" }, { status: 400 })
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Please agree to be contacted about your enquiry.", field: "consent" },
      { status: 400 },
    )
  }

  const { error } = await getSupabaseAdmin()
    .from("enquiries")
    .insert({
      kind,
      name,
      phone,
      email,
      program: cleanText(body.program, 120),
      contact_method: contactMethod,
      preferred_time: cleanText(body.preferredTime, 200),
      message: cleanText(body.message, 1500),
      consent: true,
    })
  if (error) {
    return NextResponse.json(
      { error: "We couldn't save your request right now. Please call or WhatsApp us instead." },
      { status: 500 },
    )
  }
  return NextResponse.json({ ok: true })
}

// Admin: list all enquiries, newest first
export async function GET(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)
  if (error) {
    return NextResponse.json({ error: "Could not load enquiries." }, { status: 500 })
  }
  return NextResponse.json({ enquiries: (data ?? []).map(enquiryToApi) })
}
