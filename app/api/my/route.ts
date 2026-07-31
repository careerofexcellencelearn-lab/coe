import { NextResponse } from "next/server"
import { getSupabaseAdmin, getApiSession, materialToApi, certificateToApi } from "@/lib/supabase"
import { attendanceHistory } from "@/lib/attendance"
import { computeSlots, isWithinWindow } from "@/lib/time"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getApiSession(request)
  if (!session || session.role !== "user" || !session.user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const supabase = getSupabaseAdmin()

  const [{ data: profile }, { data: myRegs }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", session.user_id).maybeSingle(),
    supabase.from("registrations").select("*, services(*)").eq("user_id", session.user_id),
  ])

  const regs = myRegs ?? []
  const serviceIds = [...new Set(regs.map((r) => r.service_id))]
  const regIds = regs.map((r) => r.id)

  const [{ data: approvedAll }, { data: marks }, { data: materialRows }, { data: certificateRows }] =
    await Promise.all([
      serviceIds.length
        ? supabase
            .from("registrations")
            .select("id, service_id, created_at")
            .in("service_id", serviceIds)
            .eq("status", "approved")
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] as any[] }),
      regIds.length
        ? supabase.from("attendance").select("registration_id, date, type").in("registration_id", regIds)
        : Promise.resolve({ data: [] as any[] }),
      serviceIds.length
        ? supabase.from("materials").select("*").in("service_id", serviceIds)
        : Promise.resolve({ data: [] as any[] }),
      regIds.length
        ? supabase.from("certificates").select("*").in("registration_id", regIds)
        : Promise.resolve({ data: [] as any[] }),
    ])

  const registrations = regs.map((r) => {
    const service = r.services
    const approved = r.status === "approved"

    // Auto-arranged equal one-on-one slots among approved students of this service
    let slotStart: string | null = null
    let slotEnd: string | null = null
    if (service && approved) {
      const approvedRegs = (approvedAll ?? []).filter((a) => a.service_id === r.service_id)
      const slots = computeSlots(service.one_on_one_start, service.one_on_one_end, approvedRegs.length)
      const myIndex = approvedRegs.findIndex((a) => a.id === r.id)
      if (myIndex >= 0 && slots[myIndex]) {
        slotStart = slots[myIndex].start
        slotEnd = slots[myIndex].end
      }
    }

    const classJoinable = approved && !!service && isWithinWindow(service.class_start, service.class_end)
    const slotJoinable = approved && !!slotStart && !!slotEnd && isWithinWindow(slotStart, slotEnd)
    const zoomLink = approved && (classJoinable || slotJoinable) ? (service?.zoom_link ?? "") : ""

    const myMarks = (marks ?? []).filter((m) => m.registration_id === r.id)
    const certificateRow = (certificateRows ?? []).find((c) => c.registration_id === r.id)

    const materials = approved
      ? (materialRows ?? []).filter((m) => m.service_id === r.service_id).map(materialToApi)
      : []

    return {
      id: r.id,
      status: r.status,
      paid: r.paid,
      createdAt: r.created_at,
      serviceTitle: service?.title ?? "Service no longer available",
      serviceDuration: service?.duration ?? "",
      objectives: service?.objectives ?? [],
      classStart: service?.class_start ?? "",
      classEnd: service?.class_end ?? "",
      slotStart,
      slotEnd,
      classJoinable,
      slotJoinable,
      zoomLink,
      hasZoomLink: Boolean(service?.zoom_link),
      attendance: attendanceHistory(r.created_at, myMarks),
      materials,
      certificate: certificateRow ? certificateToApi(certificateRow) : null,
    }
  })

  return NextResponse.json({ name: profile?.name ?? "", registrations })
}
