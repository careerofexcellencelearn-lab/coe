import { NextResponse } from "next/server"
import crypto from "crypto"
import { getSupabaseAdmin, requireAdminSession, materialToApi } from "@/lib/supabase"
import { isUuid, safeFileName } from "@/lib/validate"

export const dynamic = "force-dynamic"

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_EXTENSIONS = ["pdf", "ppt", "pptx", "png", "jpg", "jpeg", "webp", "gif"]
const ALLOWED_MIME_PREFIXES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml",
  "image/",
]

export async function GET(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("materials").select("*").order("uploaded_at", { ascending: false })
  if (error) {
    return NextResponse.json({ error: "Could not load materials." }, { status: 500 })
  }
  return NextResponse.json({ materials: (data ?? []).map(materialToApi) })
}

export async function POST(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  const serviceId = String(formData?.get("serviceId") ?? "")
  if (!file || typeof file === "string" || !isUuid(serviceId)) {
    return NextResponse.json({ error: "File and a valid serviceId are required." }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: service } = await supabase.from("services").select("id").eq("id", serviceId).maybeSingle()
  if (!service) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 })
  }

  const extension = (file.name.split(".").pop() ?? "").toLowerCase()
  const mimeOk = ALLOWED_MIME_PREFIXES.some((prefix) => (file.type || "").startsWith(prefix))
  if (!ALLOWED_EXTENSIONS.includes(extension) || !mimeOk) {
    return NextResponse.json(
      { error: `Only these file types are allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 20 MB)." }, { status: 400 })
  }

  const storagePath = `${serviceId}/${crypto.randomUUID()}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage.from("materials").upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
  })
  if (uploadError) {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }

  const { data: material, error: insertError } = await supabase
    .from("materials")
    .insert({
      service_id: serviceId,
      name: safeFileName(file.name),
      storage_path: storagePath,
      mime: file.type || "application/octet-stream",
      size: file.size,
    })
    .select()
    .single()
  if (insertError || !material) {
    await supabase.storage.from("materials").remove([storagePath])
    return NextResponse.json({ error: "Could not save material." }, { status: 500 })
  }

  return NextResponse.json({ material: materialToApi(material) })
}
