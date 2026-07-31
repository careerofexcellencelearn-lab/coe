// Pure attendance helpers — no storage dependencies

export type AttendanceMark = { date: string; type: string }
export type AttendanceDay = { date: string; class: boolean; oneOnOne: boolean }

/** Local date as YYYY-MM-DD */
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** History from registration date (capped at `maxDays`) up to today, newest first */
export function attendanceHistory(createdAt: string, marks: AttendanceMark[], maxDays = 14): AttendanceDay[] {
  const start = new Date(createdAt)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const earliest = new Date(today)
  earliest.setDate(earliest.getDate() - (maxDays - 1))
  const from = start > earliest ? start : earliest

  const days: AttendanceDay[] = []
  for (let d = new Date(from); d <= today; d.setDate(d.getDate() + 1)) {
    const date = todayStr(d)
    days.push({
      date,
      class: marks.some((m) => m.date === date && m.type === "class"),
      oneOnOne: marks.some((m) => m.date === date && m.type === "oneonone"),
    })
  }
  return days.reverse()
}
