import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { isUuid } from "@/lib/validate"

export const dynamic = "force-dynamic"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 })
  }
  const supabase = getSupabaseAdmin()
  const { data: material } = await supabase.from("materials").select("*").eq("id", params.id).maybeSingle()
  if (material) {
    await supabase.storage.from("materials").remove([material.storage_path])
    await supabase.from("materials").delete().eq("id", params.id)
  }
  return NextResponse.json({ ok: true })
}
