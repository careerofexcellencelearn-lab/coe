import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { cleanText, isUuid } from "@/lib/validate"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 })
  }
  const body = await request.json().catch(() => ({}))
  const patch: Record<string, string> = {}
  if (body.quote !== undefined) patch.quote = cleanText(body.quote, 500)
  if (body.name !== undefined) patch.name = cleanText(body.name, 80)
  if (body.role !== undefined) patch.role = cleanText(body.role, 80)
  if (patch.quote === "" || patch.name === "") {
    return NextResponse.json({ error: "Quote and name cannot be empty." }, { status: 400 })
  }
  const { data, error } = await getSupabaseAdmin()
    .from("testimonials")
    .update(patch)
    .eq("id", params.id)
    .select()
    .maybeSingle()
  if (error) {
    return NextResponse.json({ error: "Could not update the story." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Story not found." }, { status: 404 })
  }
  return NextResponse.json({ testimonial: data })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 })
  }
  await getSupabaseAdmin().from("testimonials").delete().eq("id", params.id)
  return NextResponse.json({ ok: true })
}
