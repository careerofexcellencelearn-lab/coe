"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BadgePercent,
  BookOpen,
  CalendarCheck,
  Check,
  Clock,
  Download,
  FileImage,
  FileText,
  FolderOpen,
  Mail,
  MessageCircle,
  Pencil,
  Quote,
  Phone,
  Plus,
  Presentation,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { computeSlots, formatTime12 } from "@/lib/time"
import { DashboardShell } from "@/components/dashboard-shell"
import { AuthScreen } from "@/components/auth-screen"
import { type AttendanceDay } from "@/components/attendance-grid"
import { DEFAULT_ABOUT, DEFAULT_CONTACT, type AboutContent, type ContactContent } from "@/lib/content"

type Testimonial = { id: string; quote: string; name: string; role: string }

type AboutFormValues = {
  subtitle: string
  bio: string
  qualifications: string
  trainingAreas: string
  experience: string
}

function aboutToForm(about: AboutContent): AboutFormValues {
  return {
    subtitle: about.subtitle,
    bio: about.bio.join("\n\n"),
    qualifications: about.qualifications.join("\n"),
    trainingAreas: about.trainingAreas.join("\n"),
    experience: about.experience.map((e) => `${e.title} | ${e.org} | ${e.description}`).join("\n"),
  }
}

function formToAbout(form: AboutFormValues): AboutContent {
  return {
    subtitle: form.subtitle.trim(),
    bio: form.bio
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    qualifications: form.qualifications
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    trainingAreas: form.trainingAreas
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    experience: form.experience
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = "", org = "", ...rest] = line.split("|").map((part) => part.trim())
        return { title, org, description: rest.join(" | ") }
      })
      .filter((entry) => entry.title),
  }
}

type Service = {
  id: string
  title: string
  description: string
  objectives: string[]
  duration: string
  price: number
  offerPrice: number | null
  offerLabel: string
  classStart: string
  classEnd: string
  oneOnOneStart: string
  oneOnOneEnd: string
  zoomLink: string
  certificateProvided: boolean
}

type Registration = {
  id: string
  name: string
  email: string
  phone: string
  serviceId: string
  serviceTitle: string
  message: string
  status: "pending" | "approved"
  paid: boolean
  createdAt: string
  attendance: AttendanceDay[]
}

type Material = {
  id: string
  serviceId: string
  name: string
  path: string
  mime: string
  size: number
  uploadedAt: string
}

type Certificate = {
  id: string
  registrationId: string
  name: string
  path: string
  uploadedAt: string
}

type AdminSession = { token: string; email: string }

const SESSION_KEY = "coe-admin-session"

type ServiceFormValues = {
  title: string
  description: string
  objectives: string
  duration: string
  price: string
  offerPrice: string
  offerLabel: string
  classStart: string
  classEnd: string
  oneOnOneStart: string
  oneOnOneEnd: string
  zoomLink: string
  certificateProvided: boolean
}

const emptyServiceForm: ServiceFormValues = {
  title: "",
  description: "",
  objectives: "",
  duration: "",
  price: "",
  offerPrice: "",
  offerLabel: "",
  classStart: "10:00",
  classEnd: "18:00",
  oneOnOneStart: "19:00",
  oneOnOneEnd: "20:00",
  zoomLink: "",
  certificateProvided: false,
}

function serviceToForm(service: Service): ServiceFormValues {
  return {
    title: service.title,
    description: service.description,
    objectives: service.objectives.join("\n"),
    duration: service.duration,
    price: service.price ? String(service.price) : "",
    offerPrice: service.offerPrice !== null ? String(service.offerPrice) : "",
    offerLabel: service.offerLabel,
    classStart: service.classStart,
    classEnd: service.classEnd,
    oneOnOneStart: service.oneOnOneStart,
    oneOnOneEnd: service.oneOnOneEnd,
    zoomLink: service.zoomLink,
    certificateProvided: service.certificateProvided,
  }
}

function formToPayload(form: ServiceFormValues) {
  return {
    title: form.title,
    description: form.description,
    objectives: form.objectives
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    duration: form.duration,
    price: Number(form.price) || 0,
    offerPrice: form.offerPrice.trim() === "" ? null : Number(form.offerPrice) || 0,
    offerLabel: form.offerLabel,
    classStart: form.classStart,
    classEnd: form.classEnd,
    oneOnOneStart: form.oneOnOneStart,
    oneOnOneEnd: form.oneOnOneEnd,
    zoomLink: form.zoomLink,
    certificateProvided: form.certificateProvided,
  }
}

function MarkToggle({
  present,
  onToggle,
  disabled,
}: {
  present: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 transition-colors disabled:opacity-50 ${
        present
          ? "text-green-700 bg-green-500/15 hover:bg-green-500/25"
          : "text-red-600 bg-red-500/10 hover:bg-red-500/20"
      }`}
      title="Click to toggle"
    >
      {present ? <Check className="w-3 h-3" aria-hidden="true" /> : <X className="w-3 h-3" aria-hidden="true" />}
      {present ? "Present" : "Absent"}
    </button>
  )
}

function materialIcon(mime: string, name: string) {
  const lower = name.toLowerCase()
  if (mime.startsWith("image/")) return FileImage
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return Presentation
  return FileText
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function ServiceForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ServiceFormValues
  submitLabel: string
  onSubmit: (form: ServiceFormValues) => Promise<void>
  onCancel?: () => void
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        await onSubmit(form)
        setSaving(false)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Service title *</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. IELTS & TOEFL Training"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Duration label</label>
          <Input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g. 10 Weeks · Live Online"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="Short description shown on the services card"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Objectives (one per line)</label>
        <textarea
          rows={4}
          value={form.objectives}
          onChange={(e) => setForm({ ...form, objectives: e.target.value })}
          className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder={"Master all four modules\nLearn score-boosting strategies"}
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Actual price (₹) *</label>
          <Input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="5999"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Offer price (₹)</label>
          <Input
            type="number"
            min="0"
            value={form.offerPrice}
            onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
            placeholder="Leave empty for no offer"
          />
          <p className="mt-1 text-xs text-muted-foreground">Actual price shows crossed out when set.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Offer label</label>
          <Input
            value={form.offerLabel}
            onChange={(e) => setForm({ ...form, offerLabel: e.target.value })}
            placeholder="e.g. Launch Offer"
          />
        </div>
      </div>

      {/* Timings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Class starts</label>
          <Input
            type="time"
            value={form.classStart}
            onChange={(e) => setForm({ ...form, classStart: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Class ends</label>
          <Input
            type="time"
            value={form.classEnd}
            onChange={(e) => setForm({ ...form, classEnd: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">1-on-1 starts</label>
          <Input
            type="time"
            value={form.oneOnOneStart}
            onChange={(e) => setForm({ ...form, oneOnOneStart: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">1-on-1 ends</label>
          <Input
            type="time"
            value={form.oneOnOneEnd}
            onChange={(e) => setForm({ ...form, oneOnOneEnd: e.target.value })}
            required
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Students of this service are auto-arranged into equal one-on-one slots inside the 1-on-1 window. Changing
        timings updates the home page and every student dashboard instantly.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1.5">Zoom link</label>
        <Input
          type="url"
          value={form.zoomLink}
          onChange={(e) => setForm({ ...form, zoomLink: e.target.value })}
          placeholder="https://zoom.us/j/…"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Approved students get this link only while their class or slot is live.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.certificateProvided}
            onChange={(e) => setForm({ ...form, certificateProvided: e.target.checked })}
            className="w-4 h-4 accent-[#FF8C00]"
          />
          Certificate provided
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional — shows a "Certificate Provided" tag on this service's card on the home page.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="font-semibold">
          {saving ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="bg-transparent">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [loggingIn, setLoggingIn] = useState(false)

  const [services, setServices] = useState<Service[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [stories, setStories] = useState<Testimonial[]>([])
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null)
  const [creatingStory, setCreatingStory] = useState(false)
  const [storyForm, setStoryForm] = useState({ quote: "", name: "", role: "" })
  const [aboutForm, setAboutForm] = useState<AboutFormValues>(aboutToForm(DEFAULT_ABOUT))
  const [savingAbout, setSavingAbout] = useState(false)
  const [aboutSaved, setAboutSaved] = useState(false)
  const [contactForm, setContactForm] = useState<ContactContent>(DEFAULT_CONTACT)
  const [savingContact, setSavingContact] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)
  const [tab, setTab] = useState("registrations")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState("")
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        setSession(JSON.parse(raw))
      } catch {}
    }
    setSessionLoaded(true)
  }, [])

  const authFetch = useCallback(
    (url: string, init?: RequestInit) => {
      // GETs use a distinct URL so a CDN can never serve the admin a cached
      // public response (public GET responses are edge-cached in production).
      const isGet = !init?.method || init.method.toUpperCase() === "GET"
      const target = isGet ? `${url}${url.includes("?") ? "&" : "?"}fresh=1` : url
      return fetch(target, {
        ...init,
        headers: {
          "x-auth-token": session?.token ?? "",
          ...(init?.headers ?? {}),
        },
      })
    },
    [session],
  )

  const loadData = useCallback(async () => {
    if (!session) return
    setActionError("")
    const [servicesRes, registrationsRes, materialsRes, certificatesRes, storiesRes, aboutRes, contactRes] =
      await Promise.all([
        authFetch("/api/services"),
        authFetch("/api/registrations"),
        authFetch("/api/materials"),
        authFetch("/api/certificates"),
        authFetch("/api/testimonials"),
        authFetch("/api/about"),
        authFetch("/api/contact"),
      ])
    if (registrationsRes.status === 401) {
      localStorage.removeItem(SESSION_KEY)
      setSession(null)
      return
    }
    setServices((await servicesRes.json()).services ?? [])
    setRegistrations((await registrationsRes.json()).registrations ?? [])
    setMaterials((await materialsRes.json()).materials ?? [])
    setCertificates((await certificatesRes.json()).certificates ?? [])
    setStories((await storiesRes.json()).testimonials ?? [])
    const aboutData = (await aboutRes.json()).about
    if (aboutData?.bio?.length) setAboutForm(aboutToForm(aboutData))
    const contactData = (await contactRes.json()).contact
    if (contactData?.email) setContactForm({ ...DEFAULT_CONTACT, ...contactData })
  }, [session, authFetch])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginForm, role: "admin" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error ?? "Login failed.")
      } else {
        const newSession = { token: data.token, email: data.email }
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
        setSession(newSession)
      }
    } catch {
      setLoginError("Network error. Please try again.")
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await authFetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  const jsonHeaders = { "Content-Type": "application/json" }

  const createService = async (form: ServiceFormValues) => {
    const res = await authFetch("/api/services", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(formToPayload(form)),
    })
    if (res.ok) {
      setCreating(false)
      await loadData()
    } else {
      setActionError((await res.json()).error ?? "Could not create service.")
    }
  }

  const updateService = async (id: string, form: ServiceFormValues) => {
    const res = await authFetch(`/api/services/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(formToPayload(form)),
    })
    if (res.ok) {
      setEditingId(null)
      await loadData()
    } else {
      setActionError((await res.json()).error ?? "Could not update service.")
    }
  }

  const removeOffer = async (id: string) => {
    await authFetch(`/api/services/${id}`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({ offerPrice: null, offerLabel: "" }),
    })
    await loadData()
  }

  const deleteService = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also removes its registrations.`)) return
    await authFetch(`/api/services/${id}`, { method: "DELETE" })
    await loadData()
  }

  const patchRegistration = async (id: string, patch: { status?: string; paid?: boolean }) => {
    await authFetch(`/api/registrations/${id}`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(patch) })
    await loadData()
  }

  const deleteRegistration = async (id: string, name: string) => {
    if (!window.confirm(`Delete registration of ${name}?`)) return
    await authFetch(`/api/registrations/${id}`, { method: "DELETE" })
    await loadData()
  }

  const uploadMaterial = async (serviceId: string, file: File) => {
    setUploadingFor(serviceId)
    setActionError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("serviceId", serviceId)
      const res = await authFetch("/api/materials", { method: "POST", body: formData })
      if (!res.ok) {
        setActionError((await res.json()).error ?? "Upload failed.")
      }
      await loadData()
    } finally {
      setUploadingFor(null)
      const input = fileInputs.current[serviceId]
      if (input) input.value = ""
    }
  }

  const deleteMaterial = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    await authFetch(`/api/materials/${id}`, { method: "DELETE" })
    await loadData()
  }

  // Toggle a student's present/absent mark for a specific day
  const markAttendance = async (registrationId: string, date: string, type: "class" | "oneonone", present: boolean) => {
    setActionError("")
    const res = await authFetch("/api/attendance", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ registrationId, date, type, present }),
    })
    if (!res.ok) {
      setActionError((await res.json()).error ?? "Could not update attendance.")
    }
    await loadData()
  }

  const uploadCertificate = async (registrationId: string, file: File) => {
    setUploadingFor(`cert-${registrationId}`)
    setActionError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("registrationId", registrationId)
      const res = await authFetch("/api/certificates", { method: "POST", body: formData })
      if (!res.ok) {
        setActionError((await res.json()).error ?? "Certificate upload failed.")
      }
      await loadData()
    } finally {
      setUploadingFor(null)
      const input = fileInputs.current[`cert-${registrationId}`]
      if (input) input.value = ""
    }
  }

  const deleteCertificate = async (id: string, studentName: string) => {
    if (!window.confirm(`Delete the certificate of ${studentName}?`)) return
    await authFetch(`/api/certificates/${id}`, { method: "DELETE" })
    await loadData()
  }

  const saveStory = async () => {
    setActionError("")
    const isEdit = editingStoryId !== null
    const res = await authFetch(isEdit ? `/api/testimonials/${editingStoryId}` : "/api/testimonials", {
      method: isEdit ? "PUT" : "POST",
      headers: jsonHeaders,
      body: JSON.stringify(storyForm),
    })
    if (!res.ok) {
      setActionError((await res.json()).error ?? "Could not save the story.")
      return
    }
    setCreatingStory(false)
    setEditingStoryId(null)
    setStoryForm({ quote: "", name: "", role: "" })
    await loadData()
  }

  const deleteStory = async (id: string, name: string) => {
    if (!window.confirm(`Delete the story by ${name}?`)) return
    await authFetch(`/api/testimonials/${id}`, { method: "DELETE" })
    await loadData()
  }

  const saveContact = async () => {
    setSavingContact(true)
    setActionError("")
    setContactSaved(false)
    const res = await authFetch("/api/contact", {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(contactForm),
    })
    if (!res.ok) {
      setActionError((await res.json()).error ?? "Could not save contact details.")
    } else {
      setContactForm((await res.json()).contact)
      setContactSaved(true)
      setTimeout(() => setContactSaved(false), 3000)
    }
    setSavingContact(false)
  }

  const saveAbout = async () => {
    setSavingAbout(true)
    setActionError("")
    setAboutSaved(false)
    const res = await authFetch("/api/about", {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(formToAbout(aboutForm)),
    })
    if (!res.ok) {
      setActionError((await res.json()).error ?? "Could not save the about page.")
    } else {
      setAboutSaved(true)
      setTimeout(() => setAboutSaved(false), 3000)
    }
    setSavingAbout(false)
  }

  if (!sessionLoaded) return null

  // ── Login screen ───────────────────────────────────────────────
  if (!session) {
    return (
      <AuthScreen
        title="Admin sign in"
        description="Eleva Academy — sign in to manage the platform."
        highlights={["Approve registrations", "Mark attendance", "Share materials & certificates", "Edit site content"]}
      >
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="h-12"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium mb-1.5">
              Password
            </label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="h-12"
              required
            />
          </div>
          {loginError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2" role="alert">
              {loginError}
            </p>
          )}
          <Button type="submit" disabled={loggingIn} className="w-full h-12 rounded-xl font-semibold text-base">
            {loggingIn ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </AuthScreen>
    )
  }

  const pendingCount = registrations.filter((r) => r.status === "pending").length

  // ── Dashboard ──────────────────────────────────────────────────
  return (
    <DashboardShell
      roleLabel="Admin"
      userName="Administrator"
      userEmail={session.email}
      navItems={[
        {
          key: "registrations",
          label: "Registrations",
          icon: Users,
          badge: pendingCount,
          description: "Everyone who enrolled — contact them, mark payment and approve access.",
        },
        {
          key: "services",
          label: "Programs",
          icon: BookOpen,
          badge: services.length,
          description: "The programs shown on the home page, with timings, offers and Zoom links.",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          description: "Mark today's group class and one-on-one attendance for approved students.",
        },
        {
          key: "materials",
          label: "Materials",
          icon: FolderOpen,
          badge: materials.length,
          description: "Upload PDFs, presentations and notes for a program's students.",
        },
        {
          key: "certificates",
          label: "Certificates",
          icon: Award,
          badge: certificates.length,
          description: "Issue completion certificates to individual students.",
        },
        {
          key: "stories",
          label: "Student Stories",
          icon: Quote,
          badge: stories.length,
          description: "Testimonials shown on the home page.",
        },
        { key: "about", label: "About Page", icon: FileText, description: "The trainer profile on the About page." },
        {
          key: "contactinfo",
          label: "Contact & Socials",
          icon: Mail,
          description: "Email, phone and social links used across the website.",
        },
      ]}
      activeKey={tab}
      onSelect={setTab}
      onLogout={handleLogout}
    >
      {actionError && (
        <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm mb-4" role="alert">
          {actionError}
        </div>
      )}

      {/* ── Registrations ── */}
      {tab === "registrations" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3">
            {[
              { label: "Total enrolments", value: registrations.length, icon: Users },
              { label: "Awaiting approval", value: pendingCount, icon: Clock },
              {
                label: "Approved students",
                value: registrations.filter((r) => r.status === "approved").length,
                icon: Check,
              },
              { label: "Paid", value: registrations.filter((r) => r.paid).length, icon: BadgePercent },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-2xl border border-border shadow-sm p-4 md:p-5">
                <div className="w-9 h-9 rounded-lg bg-accent text-brand-ink flex items-center justify-center mb-3">
                  <stat.icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          {registrations.length === 0 && (
            <div className="bg-card shadow-sm rounded-2xl p-10 border border-border text-center text-muted-foreground">
              No registrations yet. They'll appear here as soon as someone enrolls.
            </div>
          )}
          {registrations.map((registration) => {
            const presentDays = registration.attendance.filter((d) => d.class || d.oneOnOne).length
            return (
              <div
                key={registration.id}
                className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">{registration.name}</h3>
                      <span className="text-xs font-medium bg-[#F5A623]/15 text-[#B36A00] rounded-full px-2.5 py-1">
                        {registration.serviceTitle}
                      </span>
                      <span
                        className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                          registration.status === "approved"
                            ? "bg-green-500/15 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {registration.status === "approved" ? "Approved" : "Pending"}
                      </span>
                      <span
                        className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                          registration.paid ? "bg-green-500/15 text-green-700" : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {registration.paid ? "Paid" : "Not paid"}
                      </span>
                      {registration.status === "approved" && (
                        <span className="text-xs font-medium bg-muted/60 rounded-full px-2.5 py-1 text-muted-foreground">
                          {presentDays} day{presentDays === 1 ? "" : "s"} attended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {registration.email}
                      {registration.phone && ` · ${registration.phone}`} ·{" "}
                      {new Date(registration.createdAt).toLocaleString()}
                    </p>
                    {registration.message && (
                      <p className="text-sm mt-2 bg-muted/40 rounded-lg px-3 py-2">"{registration.message}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`mailto:${registration.email}`}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                      aria-label={`Email ${registration.name}`}
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    {registration.phone && (
                      <>
                        <a
                          href={`tel:${registration.phone}`}
                          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                          aria-label={`Call ${registration.name}`}
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://wa.me/${registration.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
                          aria-label={`WhatsApp ${registration.name}`}
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => patchRegistration(registration.id, { paid: !registration.paid })}
                    >
                      {registration.paid ? "Mark unpaid" : "Mark paid"}
                    </Button>
                    <Button
                      size="sm"
                      className="font-semibold"
                      variant={registration.status === "approved" ? "outline" : "default"}
                      onClick={() =>
                        patchRegistration(registration.id, {
                          status: registration.status === "approved" ? "pending" : "approved",
                        })
                      }
                    >
                      {registration.status === "approved" ? (
                        "Revoke approval"
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                          Approve
                        </>
                      )}
                    </Button>
                    <button
                      onClick={() => deleteRegistration(registration.id, registration.name)}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Delete registration"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Services ── */}
      {tab === "services" && (
        <div className="space-y-3">
          <div className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border">
            {creating ? (
              <>
                <h3 className="font-semibold mb-4">New service</h3>
                <ServiceForm
                  initial={emptyServiceForm}
                  submitLabel="Create Service"
                  onSubmit={createService}
                  onCancel={() => setCreating(false)}
                />
              </>
            ) : (
              <Button
                onClick={() => {
                  setCreating(true)
                  setEditingId(null)
                }}
                className="gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add New Service
              </Button>
            )}
          </div>

          {services.map((service) => {
            const approvedRegs = registrations
              .filter((r) => r.serviceId === service.id && r.status === "approved")
              .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
            const slots = computeSlots(service.oneOnOneStart, service.oneOnOneEnd, approvedRegs.length)
            const hasOffer = service.offerPrice !== null && service.offerPrice < service.price
            return (
              <div
                key={service.id}
                className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border"
              >
                {editingId === service.id ? (
                  <>
                    <h3 className="font-semibold mb-4">Edit — {service.title}</h3>
                    <ServiceForm
                      initial={serviceToForm(service)}
                      submitLabel="Save Changes"
                      onSubmit={(form) => updateService(service.id, form)}
                      onCancel={() => setEditingId(null)}
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{service.title}</h3>
                          {service.duration && (
                            <span className="text-xs font-medium bg-muted rounded-full px-2.5 py-1 text-muted-foreground">
                              {service.duration}
                            </span>
                          )}
                          {hasOffer && (
                            <span className="text-xs font-bold bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white rounded-full px-2.5 py-1">
                              {service.offerLabel || "Offer"} active
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          {hasOffer ? (
                            <>
                              <span className="text-xl font-bold">
                                ₹{service.offerPrice!.toLocaleString("en-IN")}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{service.price.toLocaleString("en-IN")}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold">₹{service.price.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex items-center gap-4 flex-wrap text-sm pt-1">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                            Classes: {formatTime12(service.classStart)} – {formatTime12(service.classEnd)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                            1-on-1: {formatTime12(service.oneOnOneStart)} – {formatTime12(service.oneOnOneEnd)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                            {service.zoomLink ? "Zoom link set" : "No Zoom link"}
                          </span>
                          {service.certificateProvided && (
                            <span className="inline-flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                              Certificate provided
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasOffer && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent gap-1.5"
                            onClick={() => removeOffer(service.id)}
                          >
                            <BadgePercent className="w-3.5 h-3.5" aria-hidden="true" />
                            Remove offer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent gap-1.5"
                          onClick={() => {
                            setEditingId(service.id)
                            setCreating(false)
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          Edit
                        </Button>
                        <button
                          onClick={() => deleteService(service.id, service.title)}
                          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Delete ${service.title}`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* One-on-one slot allocation */}
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        One-on-one slot allocation ({approvedRegs.length} approved student
                        {approvedRegs.length === 1 ? "" : "s"})
                      </p>
                      {approvedRegs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Slots are auto-assigned equally once students are approved.
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {approvedRegs.map((registration, index) => (
                            <li key={registration.id} className="flex items-center gap-3 text-sm">
                              <span className="font-medium text-[#E8890C] whitespace-nowrap">
                                {formatTime12(slots[index].start)} – {formatTime12(slots[index].end)}
                              </span>
                              <span className="truncate">
                                {registration.name} ({registration.email})
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Attendance (admin marks present/absent) ── */}
      {tab === "attendance" && (
        <div className="space-y-3">
          {registrations.filter((r) => r.status === "approved").length === 0 ? (
            <div className="bg-card shadow-sm rounded-2xl p-10 border border-border text-center text-muted-foreground">
              Attendance appears here once students are approved. Click Present/Absent to mark each day — students see
              this in their dashboard.
            </div>
          ) : (
            registrations
              .filter((r) => r.status === "approved")
              .map((registration) => (
                <div
                  key={registration.id}
                  className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold">{registration.name}</h3>
                    <span className="text-xs font-medium bg-[#F5A623]/15 text-[#B36A00] rounded-full px-2.5 py-1">
                      {registration.serviceTitle}
                    </span>
                    <span className="text-xs text-muted-foreground">{registration.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Click a mark to toggle Present / Absent — changes reflect on the student's dashboard instantly.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                          <th className="py-2 pr-4 font-semibold">Date</th>
                          <th className="py-2 pr-4 font-semibold">Group Class</th>
                          <th className="py-2 font-semibold">One-on-One</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registration.attendance.map((day, index) => (
                          <tr key={day.date} className="border-b border-border/30 last:border-0">
                            <td className="py-2.5 pr-4 whitespace-nowrap">
                              {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                              {index === 0 && <span className="ml-2 text-[11px] font-bold text-[#E8890C]">TODAY</span>}
                            </td>
                            <td className="py-2.5 pr-4">
                              <MarkToggle
                                present={day.class}
                                onToggle={() => markAttendance(registration.id, day.date, "class", !day.class)}
                              />
                            </td>
                            <td className="py-2.5">
                              <MarkToggle
                                present={day.oneOnOne}
                                onToggle={() => markAttendance(registration.id, day.date, "oneonone", !day.oneOnOne)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* ── Certificates ── */}
      {tab === "certificates" && (
        <div className="space-y-3">
          {registrations.length === 0 ? (
            <div className="bg-card shadow-sm rounded-2xl p-10 border border-border text-center text-muted-foreground">
              Certificates can be issued here once students register.
            </div>
          ) : (
            registrations.map((registration) => {
              const certificate = certificates.find((c) => c.registrationId === registration.id)
              return (
                <div
                  key={registration.id}
                  className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          certificate
                            ? "bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white"
                            : "bg-muted/60 text-muted-foreground"
                        }`}
                      >
                        <Award className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{registration.name}</h3>
                          <span className="text-xs font-medium bg-[#F5A623]/15 text-[#B36A00] rounded-full px-2.5 py-1">
                            {registration.serviceTitle}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {registration.email}
                          {certificate &&
                            ` · Certificate issued ${new Date(certificate.uploadedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      <input
                        ref={(el) => {
                          fileInputs.current[`cert-${registration.id}`] = el
                        }}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadCertificate(registration.id, file)
                        }}
                      />
                      {certificate && (
                        <a
                          href={certificate.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8890C] hover:underline"
                        >
                          <Download className="w-4 h-4" aria-hidden="true" />
                          View
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant={certificate ? "outline" : "default"}
                        className={`gap-2 font-semibold ${certificate ? "bg-transparent" : ""}`}
                        disabled={uploadingFor === `cert-${registration.id}`}
                        onClick={() => fileInputs.current[`cert-${registration.id}`]?.click()}
                      >
                        <Upload className="w-4 h-4" aria-hidden="true" />
                        {uploadingFor === `cert-${registration.id}`
                          ? "Uploading…"
                          : certificate
                            ? "Replace PDF"
                            : "Upload Certificate PDF"}
                      </Button>
                      {certificate && (
                        <button
                          onClick={() => deleteCertificate(certificate.id, registration.name)}
                          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label={`Delete certificate of ${registration.name}`}
                          title="Delete certificate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Materials ── */}
      {tab === "materials" && (
        <div className="space-y-3">
          {services.map((service) => {
            const serviceMaterials = materials.filter((m) => m.serviceId === service.id)
            return (
              <div
                key={service.id}
                className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                  <h3 className="font-semibold text-lg">{service.title}</h3>
                  <div>
                    <input
                      ref={(el) => {
                        fileInputs.current[service.id] = el
                      }}
                      type="file"
                      accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadMaterial(service.id, file)
                      }}
                    />
                    <Button
                      size="sm"
                      className="gap-2 font-semibold"
                      disabled={uploadingFor === service.id}
                      onClick={() => fileInputs.current[service.id]?.click()}
                    >
                      <Upload className="w-4 h-4" aria-hidden="true" />
                      {uploadingFor === service.id ? "Uploading…" : "Upload PDF / PPT / Image"}
                    </Button>
                  </div>
                </div>

                {serviceMaterials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No materials yet. Files you upload here are visible to this service's approved students.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {serviceMaterials.map((material) => {
                      const MaterialIcon = materialIcon(material.mime, material.name)
                      return (
                        <li
                          key={material.id}
                          className="flex items-center gap-3 bg-background rounded-xl p-3.5 border border-border"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#F5A623]/15 text-[#B36A00] flex items-center justify-center flex-shrink-0">
                            <MaterialIcon className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{material.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatSize(material.size)} · {new Date(material.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <a
                            href={material.path}
                            download={material.name}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8890C] hover:underline flex-shrink-0"
                            aria-label={`Download ${material.name}`}
                          >
                            <Download className="w-4 h-4" aria-hidden="true" />
                          </a>
                          <button
                            onClick={() => deleteMaterial(material.id, material.name)}
                            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                            aria-label={`Delete ${material.name}`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Student Stories ── */}
      {tab === "stories" && (
        <div className="space-y-3">
          <div className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border">
            {creatingStory || editingStoryId ? (
              <div className="space-y-4">
                <h3 className="font-semibold">{editingStoryId ? "Edit story" : "New story"}</h3>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Quote *</label>
                  <textarea
                    rows={3}
                    value={storyForm.quote}
                    onChange={(e) => setStoryForm({ ...storyForm, quote: e.target.value })}
                    className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="What did the student say?"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Student name *</label>
                    <Input
                      value={storyForm.name}
                      onChange={(e) => setStoryForm({ ...storyForm, name: e.target.value })}
                      placeholder="e.g. Priya S."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Role / title</label>
                    <Input
                      value={storyForm.role}
                      onChange={(e) => setStoryForm({ ...storyForm, role: e.target.value })}
                      placeholder="e.g. HR Executive"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={saveStory} className="font-semibold">
                    {editingStoryId ? "Save Changes" : "Add Story"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => {
                      setCreatingStory(false)
                      setEditingStoryId(null)
                      setStoryForm({ quote: "", name: "", role: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setCreatingStory(true)
                  setStoryForm({ quote: "", name: "", role: "" })
                }}
                className="gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add New Story
              </Button>
            )}
          </div>

          {stories.map((story) => (
            <div key={story.id} className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed mb-2">"{story.quote}"</p>
                  <p className="text-sm font-semibold">
                    {story.name}
                    {story.role && <span className="font-normal text-muted-foreground"> · {story.role}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-transparent gap-1.5"
                    onClick={() => {
                      setEditingStoryId(story.id)
                      setCreatingStory(false)
                      setStoryForm({ quote: story.quote, name: story.name, role: story.role })
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <button
                    onClick={() => deleteStory(story.id, story.name)}
                    className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Delete story by ${story.name}`}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── About Page editor ── */}
      {tab === "about" && (
        <div className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Edit the About page</h3>
            <p className="text-sm text-muted-foreground">
              Changes appear on the public About page as soon as you save.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Subtitle</label>
            <Input
              value={aboutForm.subtitle}
              onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
              placeholder="Shown under the page title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Bio paragraphs</label>
            <textarea
              rows={8}
              value={aboutForm.bio}
              onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })}
              className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="mt-1 text-xs text-muted-foreground">Separate paragraphs with an empty line.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Qualifications</label>
              <textarea
                rows={4}
                value={aboutForm.qualifications}
                onChange={(e) => setAboutForm({ ...aboutForm, qualifications: e.target.value })}
                className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">One per line.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Training areas</label>
              <textarea
                rows={4}
                value={aboutForm.trainingAreas}
                onChange={(e) => setAboutForm({ ...aboutForm, trainingAreas: e.target.value })}
                className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">One per line.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Experience</label>
            <textarea
              rows={6}
              value={aboutForm.experience}
              onChange={(e) => setAboutForm({ ...aboutForm, experience: e.target.value })}
              className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              One role per line, in the format: Job Title | Organisation & dates | Description
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveAbout} disabled={savingAbout} className="font-semibold">
              {savingAbout ? "Saving…" : "Save About Page"}
            </Button>
            {aboutSaved && <span className="text-sm font-medium text-green-700">✓ Saved</span>}
          </div>
        </div>
      )}

      {/* ── Contact & Socials ── */}
      {tab === "contactinfo" && (
        <div className="bg-card shadow-sm rounded-2xl p-5 md:p-6 border border-border space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Contact & social links</h3>
            <p className="text-sm text-muted-foreground">
              The email and phone show in the header, footer and contact page; social links power the icons on the home page, footer and
              contact page. Leave a link empty to hide it.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Contact email *</label>
            <Input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              placeholder="careerofexcellence.learn@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone / WhatsApp</label>
            <Input
              type="tel"
              value={contactForm.phone ?? ""}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              placeholder="+91 81791 28482"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Shown in the header, footer and contact page (call + WhatsApp buttons). Leave empty to hide.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                ["linkedin", "LinkedIn"],
                ["facebook", "Facebook"],
                ["twitter", "Twitter / X"],
                ["instagram", "Instagram"],
                ["youtube", "YouTube"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <Input
                  type="url"
                  value={contactForm[field]}
                  onChange={(e) => setContactForm({ ...contactForm, [field]: e.target.value })}
                  placeholder={`https://${field === "twitter" ? "x" : field}.com/…`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveContact} disabled={savingContact} className="font-semibold">
              {savingContact ? "Saving…" : "Save Contact & Socials"}
            </Button>
            {contactSaved && <span className="text-sm font-medium text-green-700">✓ Saved</span>}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
