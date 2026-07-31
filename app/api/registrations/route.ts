import { NextResponse } from "next/server"
import { getSupabaseAdmin, requireAdminSession } from "@/lib/supabase"
import { attendanceHistory } from "@/lib/attendance"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const supabase = getSupabaseAdmin()
  const { data: rows, error } = await supabase
    .from("registrations")
    .select("*, profiles(name, phone, email), services(title)")
    .order("created_at", { ascending: false })
  if (error) {
    return NextResponse.json({ error: "Could not load registrations." }, { status: 500 })
  }

  const ids = (rows ?? []).map((r) => r.id)
  const { data: marks } = ids.length
    ? await supabase.from("attendance").select("registration_id, date, type").in("registration_id", ids)
    : { data: [] }

  const registrations = (rows ?? []).map((r) => ({
    id: r.id,
    email: r.profiles?.email ?? "",
    serviceId: r.service_id,
    message: r.message ?? "",
    status: r.status,
    paid: r.paid,
    createdAt: r.created_at,
    name: r.profiles?.name ?? "Unknown",
    phone: r.profiles?.phone ?? "",
    serviceTitle: r.services?.title ?? "Deleted service",
    attendance: attendanceHistory(
      r.created_at,
      (marks ?? []).filter((m) => m.registration_id === r.id),
    ),
  }))

  return NextResponse.json({ registrations })
}
