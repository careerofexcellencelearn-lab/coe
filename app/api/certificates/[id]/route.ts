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
  const { data: certificate } = await supabase.from("certificates").select("*").eq("id", params.id).maybeSingle()
  if (certificate) {
    await supabase.storage.from("materials").remove([certificate.storage_path])
    await supabase.from("certificates").delete().eq("id", params.id)
  }
  return NextResponse.json({ ok: true })
}
