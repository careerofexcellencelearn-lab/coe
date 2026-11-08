"use client"

import type React from "react"
import { useRef, useState } from "react"
import Link from "next/link"
import { Check, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const emptyForm = { name: "", email: "", phone: "", password: "", message: "" }

/** Online enrolment: creates the student account + a pending registration for the program */
export function EnrollDialog({
  service,
  onClose,
}: {
  service: { id: string; title: string } | null
  onClose: () => void
}) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const submittingRef = useRef(false)

  const close = () => {
    onClose()
    // Reset after the close animation so the form doesn't flash empty
    setTimeout(() => {
      setForm(emptyForm)
      setResult(null)
    }, 200)
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceId: service.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setResult({ ok: true, message: data.message })
      } else {
        setResult({ ok: false, message: data.error ?? "Something went wrong. Please try again." })
      }
    } catch {
      setResult({ ok: false, message: "Network error. Please try again." })
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const field = (
    id: keyof typeof emptyForm,
    label: string,
    props: React.ComponentProps<typeof Input>,
    hint?: string,
  ) => (
    <div>
      <label htmlFor={`enroll-${id}`} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      <Input
        id={`enroll-${id}`}
        value={form[id]}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        className="h-12 text-base md:text-sm"
        required
        {...props}
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )

  return (
    <Dialog open={service !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl">
        {result?.ok ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-green-500/15 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-7 w-7" aria-hidden="true" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Registration received!</DialogTitle>
              <DialogDescription className="text-center leading-relaxed">
                Our team will contact you soon to confirm your batch and payment — after that you can access your{" "}
                <Link href="/dashboard" className="font-medium text-brand-ink hover:underline">
                  dashboard
                </Link>
                . Please remember the email and password you used — you'll need them to login.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={close} className="w-full h-11 font-semibold">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Enroll — {service?.title}</DialogTitle>
              <DialogDescription>
                Create your account and register. We'll contact you personally to confirm your batch and payment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEnroll} className="space-y-4">
              {field("name", "Full name *", { type: "text", autoComplete: "name", placeholder: "Your name" })}
              {field("phone", "Phone / WhatsApp *", {
                type: "tel",
                inputMode: "tel",
                autoComplete: "tel",
                placeholder: "+91 98765 43210",
              })}
              {field("email", "Email *", { type: "email", autoComplete: "email", placeholder: "you@example.com" })}
              {field(
                "password",
                "Create a password *",
                { type: "password", autoComplete: "new-password", placeholder: "Minimum 6 characters", minLength: 6 },
                "You'll use this email and password to login to your student dashboard.",
              )}
              <div>
                <label htmlFor="enroll-message" className="block text-sm font-medium mb-1.5">
                  Anything you'd like us to know? <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  id="enroll-message"
                  rows={3}
                  placeholder="e.g. I need IELTS Band 7 by December…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border border-input rounded-md text-base md:text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
                />
              </div>
              {result && !result.ok && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2" role="alert">
                  {result.message}
                </p>
              )}
              <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl font-semibold">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Registering…
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
