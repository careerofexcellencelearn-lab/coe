import { NextResponse } from "next/server"
import {
  getSupabaseAdmin,
  requireAdminSession,
  serviceToApi,
  serviceBodyToRow,
  invalidateServicesCache,
} from "@/lib/supabase"
import { isUuid } from "@/lib/validate"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 })
  }
  const body = await request.json().catch(() => ({}))
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("services")
    .update(serviceBodyToRow(body))
    .eq("id", params.id)
    .select()
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: "Could not update service." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 })
  }
  invalidateServicesCache()
  return NextResponse.json({ service: serviceToApi(data, true) })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 })
  }
  const supabase = getSupabaseAdmin()
  const { data: materials } = await supabase.from("materials").select("storage_path").eq("service_id", params.id)
  if (materials && materials.length > 0) {
    await supabase.storage.from("materials").remove(materials.map((m) => m.storage_path))
  }
  await supabase.from("services").delete().eq("id", params.id)
  invalidateServicesCache()
  return NextResponse.json({ ok: true })
}
