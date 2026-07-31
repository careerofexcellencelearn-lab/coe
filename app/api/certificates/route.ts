import { NextResponse } from "next/server"
import crypto from "crypto"
import { getSupabaseAdmin, requireAdminSession, certificateToApi } from "@/lib/supabase"
import { isUuid, safeFileName } from "@/lib/validate"

export const dynamic = "force-dynamic"

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function GET(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("certificates").select("*").order("uploaded_at", { ascending: false })
  if (error) {
    return NextResponse.json({ error: "Could not load certificates." }, { status: 500 })
  }
  return NextResponse.json({ certificates: (data ?? []).map(certificateToApi) })
}

// Upload (or replace) a student's certificate PDF
export async function POST(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  const registrationId = String(formData?.get("registrationId") ?? "")
  if (!file || typeof file === "string" || !isUuid(registrationId)) {
    return NextResponse.json({ error: "File and a valid registrationId are required." }, { status: 400 })
  }

  const extension = (file.name.split(".").pop() ?? "").toLowerCase()
  if (extension !== "pdf" || (file.type && file.type !== "application/pdf")) {
    return NextResponse.json({ error: "Certificates must be PDF files." }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: registration } = await supabase
    .from("registrations")
    .select("id")
    .eq("id", registrationId)
    .maybeSingle()
  if (!registration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 })
  }

  // Replace any existing certificate for this student
  const { data: existing } = await supabase
    .from("certificates")
    .select("*")
    .eq("registration_id", registrationId)
    .maybeSingle()
  if (existing) {
    await supabase.storage.from("materials").remove([existing.storage_path])
    await supabase.from("certificates").delete().eq("id", existing.id)
  }

  const storagePath = `certificates/${registrationId}/${crypto.randomUUID()}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage.from("materials").upload(storagePath, buffer, {
    contentType: "application/pdf",
  })
  if (uploadError) {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }

  const { data: certificate, error: insertError } = await supabase
    .from("certificates")
    .insert({ registration_id: registrationId, name: safeFileName(file.name), storage_path: storagePath })
    .select()
    .single()
  if (insertError || !certificate) {
    await supabase.storage.from("materials").remove([storagePath])
    return NextResponse.json({ error: "Could not save certificate." }, { status: 500 })
  }

  return NextResponse.json({ certificate: certificateToApi(certificate) })
}
