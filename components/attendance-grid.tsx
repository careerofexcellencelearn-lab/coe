"use client"

import { Check, Minus, X } from "lucide-react"

export type AttendanceDay = { date: string; class: boolean; oneOnOne: boolean }

function Mark({ present, pending }: { present: boolean; pending: boolean }) {
  if (present) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-500/15 rounded-full px-2.5 py-1">
        <Check className="w-3 h-3" aria-hidden="true" />
        Present
      </span>
    )
  }
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
        <Minus className="w-3 h-3" aria-hidden="true" />
        Not yet
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-500/10 rounded-full px-2.5 py-1">
      <X className="w-3 h-3" aria-hidden="true" />
      Absent
    </span>
  )
}

export function AttendanceGrid({ days }: { days: AttendanceDay[] }) {
  if (days.length === 0) {
    return <p className="text-sm text-muted-foreground">No attendance records yet.</p>
  }
  const today = days.reduce((max, d) => (d.date > max ? d.date : max), days[0].date)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
            <th className="py-2 pr-4 font-semibold">Date</th>
            <th className="py-2 pr-4 font-semibold">Group Class</th>
            <th className="py-2 font-semibold">One-on-One</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const isToday = day.date === today
            return (
              <tr key={day.date} className="border-b border-border/30 last:border-0">
                <td className="py-2.5 pr-4 whitespace-nowrap">
                  {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  {isToday && <span className="ml-2 text-[11px] font-bold text-[#E8890C]">TODAY</span>}
                </td>
                <td className="py-2.5 pr-4">
                  <Mark present={day.class} pending={isToday && !day.class} />
                </td>
                <td className="py-2.5">
                  <Mark present={day.oneOnOne} pending={isToday && !day.oneOnOne} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
