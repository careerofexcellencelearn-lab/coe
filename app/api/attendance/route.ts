import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { isUuid, isDate } from "@/lib/validate"

export const dynamic = "force-dynamic"

// Admin marks attendance: present inserts a mark, absent removes it.
export async function POST(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { registrationId, date, type, present } = await request.json().catch(() => ({}))
  if (!isUuid(registrationId) || (type !== "class" && type !== "oneonone") || !isDate(date)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
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

  if (present) {
    const { error } = await supabase
      .from("attendance")
      .upsert(
        { registration_id: registrationId, date, type },
        { onConflict: "registration_id,date,type", ignoreDuplicates: true },
      )
    if (error) {
      return NextResponse.json({ error: "Could not mark attendance." }, { status: 500 })
    }
  } else {
    await supabase
      .from("attendance")
      .delete()
      .eq("registration_id", registrationId)
      .eq("date", date)
      .eq("type", type)
  }

  return NextResponse.json({ ok: true })
}
