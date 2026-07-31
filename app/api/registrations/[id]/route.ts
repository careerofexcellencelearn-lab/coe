import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { isUuid } from "@/lib/validate"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid registration id." }, { status: 400 })
  }
  const body = await request.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}
  if (body.status === "pending" || body.status === "approved") patch.status = body.status
  if (body.paid !== undefined) patch.paid = Boolean(body.paid)

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("registrations")
    .update(patch)
    .eq("id", params.id)
    .select()
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: "Could not update registration." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 })
  }
  return NextResponse.json({ registration: data })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid registration id." }, { status: 400 })
  }
  await getSupabaseAdmin().from("registrations").delete().eq("id", params.id)
  return NextResponse.json({ ok: true })
}
