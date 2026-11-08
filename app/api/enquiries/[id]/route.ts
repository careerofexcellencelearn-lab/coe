import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { isUuid } from "@/lib/validate"

export const dynamic = "force-dynamic"

// Admin: move an enquiry through new → contacted → closed
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid enquiry id." }, { status: 400 })
  }
  const body = await request.json().catch(() => ({}))
  if (!["new", "contacted", "closed"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from("enquiries")
    .update({ status: body.status })
    .eq("id", params.id)
    .select("id")
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: "Could not update the enquiry." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Enquiry not found." }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid enquiry id." }, { status: 400 })
  }
  const { error } = await getSupabaseAdmin().from("enquiries").delete().eq("id", params.id)
  if (error) {
    return NextResponse.json({ error: "Could not delete the enquiry." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
