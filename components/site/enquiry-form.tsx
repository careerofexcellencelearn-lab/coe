"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { CheckCircle2, Loader2, MessageCircle, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { phoneDigits, whatsappLink, type ContactContent } from "@/lib/content"

type Kind = "demo" | "enquiry"
type FieldErrors = Partial<Record<"name" | "phone" | "email" | "consent", string>>

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/
const PHONE_RE = /^[+\d][\d\s\-()]{6,19}$/

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  program: "",
  contactMethod: "",
  preferredTime: "",
  message: "",
  consent: false,
  website: "", // honeypot — hidden from people
}

function validate(form: typeof emptyForm): FieldErrors {
  const errors: FieldErrors = {}
  if (form.name.trim().length < 2) errors.name = "Please enter your full name."
  if (!PHONE_RE.test(form.phone.trim())) errors.phone = "Please enter a valid phone number, e.g. +91 98765 43210."
  if (!EMAIL_RE.test(form.email.trim())) errors.email = "Please enter a valid email address."
  if (!form.consent) errors.consent = "Please agree so we can contact you about your request."
  return errors
}

const fieldClass = "h-12 text-base md:text-sm"
const selectClass =
  "w-full h-12 rounded-md border border-input bg-transparent px-3 text-base md:text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"

export function EnquiryForm({ programs, contact }: { programs: string[]; contact: ContactContent }) {
  const [kind, setKind] = useState<Kind>("demo")
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [serverError, setServerError] = useState("")
  const submittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Pre-fill from links like /contact?program=IELTS%20%26%20TOEFL%20Training&type=enquiry#enquiry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const program = params.get("program")
    if (program) setForm((f) => ({ ...f, program: program.slice(0, 120) }))
    if (params.get("type") === "enquiry") setKind("enquiry")
  }, [])

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key as keyof FieldErrors]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return // ignore double clicks
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    submittingRef.current = true
    setStatus("submitting")
    setServerError("")
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kind }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus("success")
      } else {
        if (data.field) setErrors({ [data.field]: data.error })
        setServerError(data.error ?? "Something went wrong. Please try again.")
        setStatus("error")
      }
    } catch {
      setServerError("Network error — please check your connection and try again.")
      setStatus("error")
    } finally {
      submittingRef.current = false
    }
  }

  const wa = whatsappLink(
    contact.phone,
    `Hi Eleva Academy, I'd like to ${kind === "demo" ? "book a free demo" : "enquire"}${
      form.program ? ` for ${form.program}` : ""
    }.`,
  )

  if (status === "success") {
    return (
      <div className="text-center py-8" role="status" aria-live="polite">
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-bold tracking-tight">
          {kind === "demo" ? "Demo request received!" : "Enquiry received!"}
        </h3>
        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
          Thank you, {form.name.split(" ")[0]}. Your details have been saved and our team will contact you within 24
          hours to {kind === "demo" ? "schedule your free demo" : "answer your questions"}.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm)
            setStatus("idle")
          }}
          className="mt-6 text-sm font-semibold text-brand-ink hover:underline underline-offset-4"
        >
          Send another request
        </button>
      </div>
    )
  }

  const errorText = (key: keyof FieldErrors) =>
    errors[key] ? (
      <p id={`${key}-error`} className="mt-1.5 text-sm text-destructive">
        {errors[key]}
      </p>
    ) : null

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <fieldset>
        <legend className="block text-sm font-medium mb-2">I'd like to</legend>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
          {(
            [
              ["demo", "Book a free demo"],
              ["enquiry", "Ask a question"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`flex items-center justify-center h-11 rounded-lg text-sm font-semibold cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                kind === value ? "bg-card shadow-sm text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={value}
                checked={kind === value}
                onChange={() => setKind(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="enq-name" className="block text-sm font-medium mb-1.5">
            Full name <span className="text-destructive">*</span>
          </label>
          <Input
            id="enq-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={fieldClass}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="enq-phone" className="block text-sm font-medium mb-1.5">
            Phone / WhatsApp <span className="text-destructive">*</span>
          </label>
          <Input
            id="enq-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={fieldClass}
          />
          {errorText("phone")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="enq-email" className="block text-sm font-medium mb-1.5">
            Email <span className="text-destructive">*</span>
          </label>
          <Input
            id="enq-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={fieldClass}
          />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor="enq-program" className="block text-sm font-medium mb-1.5">
            Program of interest
          </label>
          <select
            id="enq-program"
            name="program"
            value={form.program}
            onChange={(e) => set("program", e.target.value)}
            className={selectClass}
          >
            <option value="">Not sure yet — help me choose</option>
            {programs.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
            {form.program && !programs.includes(form.program) && <option value={form.program}>{form.program}</option>}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="enq-method" className="block text-sm font-medium mb-1.5">
            Preferred contact method <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <select
            id="enq-method"
            name="contactMethod"
            value={form.contactMethod}
            onChange={(e) => set("contactMethod", e.target.value)}
            className={selectClass}
          >
            <option value="">No preference</option>
            <option value="phone">Phone call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label htmlFor="enq-time" className="block text-sm font-medium mb-1.5">
            {kind === "demo" ? "Preferred days / times" : "Best time to reach you"}{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="enq-time"
            name="preferredTime"
            placeholder="e.g. Weekdays after 6 PM"
            value={form.preferredTime}
            onChange={(e) => set("preferredTime", e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="enq-message" className="block text-sm font-medium mb-1.5">
          Your learning goal or message <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="enq-message"
          name="message"
          rows={4}
          placeholder="e.g. I want to prepare for campus interviews / I need IELTS Band 7"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className="w-full px-3 py-2.5 bg-transparent border border-input rounded-md text-base md:text-sm focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none"
        />
      </div>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="enq-website">Website</label>
        <input
          id="enq-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5 w-5 h-5 rounded accent-[var(--primary)] flex-shrink-0"
          />
          <span className="text-muted-foreground">
            I agree to be contacted by Eleva Academy by phone, WhatsApp or email about this request. My details are
            used only to respond to it.
          </span>
        </label>
        {errorText("consent")}
      </div>

      {status === "error" && serverError && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {serverError}
          {contact.phone && (
            <span className="block mt-1 text-foreground/80">
              You can also reach us directly at{" "}
              <a href={`tel:+${phoneDigits(contact.phone)}`} className="font-semibold underline">
                {contact.phone}
              </a>
              .
            </span>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-base inline-flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 hover:bg-[#de7200] disabled:opacity-70 disabled:cursor-wait transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : kind === "demo" ? (
          "Request My Free Demo"
        ) : (
          "Send Enquiry"
        )}
      </button>

      {(wa || contact.phone) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span>Prefer to talk now?</span>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-11 px-2 font-semibold text-[#128C7E] hover:underline"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              WhatsApp us
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:+${phoneDigits(contact.phone)}`}
              className="inline-flex items-center gap-1.5 min-h-11 px-2 font-semibold text-foreground hover:underline"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {contact.phone}
            </a>
          )}
        </div>
      )}
    </form>
  )
}
