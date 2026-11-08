"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { EnrollDialog } from "./enroll-dialog"

/** "Enroll Now" button + enrolment dialog, for server-rendered program pages */
export function ProgramEnrollButton({
  service,
  className,
}: {
  service: { id: string; title: string }
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-foreground text-background font-semibold hover:bg-foreground/85 transition-colors"
        }
      >
        Enroll Now
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
      <EnrollDialog service={open ? service : null} onClose={() => setOpen(false)} />
    </>
  )
}
