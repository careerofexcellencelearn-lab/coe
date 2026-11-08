"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Award,
  BookOpen,
  CalendarCheck,
  Clock,
  Download,
  FileImage,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Presentation,
  UserRound,
  Users,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatTime12 } from "@/lib/time"
import { DashboardShell } from "@/components/dashboard-shell"
import { AuthScreen } from "@/components/auth-screen"
import { AttendanceGrid, type AttendanceDay } from "@/components/attendance-grid"

type MyMaterial = {
  id: string
  name: string
  path: string
  mime: string
  size: number
  uploadedAt: string
}

type MyCertificate = {
  id: string
  name: string
  path: string
  uploadedAt: string
}

type MyRegistration = {
  id: string
  status: "pending" | "approved"
  paid: boolean
  createdAt: string
  serviceTitle: string
  serviceDuration: string
  objectives: string[]
  classStart: string
  classEnd: string
  slotStart: string | null
  slotEnd: string | null
  classJoinable: boolean
  slotJoinable: boolean
  zoomLink: string
  hasZoomLink: boolean
  attendance: AttendanceDay[]
  materials: MyMaterial[]
  certificate: MyCertificate | null
}

type UserSession = { token: string; email: string; name: string }

const SESSION_KEY = "coe-user-session"

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

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [loggingIn, setLoggingIn] = useState(false)

  const [name, setName] = useState("")
  const [registrations, setRegistrations] = useState<MyRegistration[]>([])
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState("services")

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        setSession(JSON.parse(raw))
      } catch {}
    }
    setSessionLoaded(true)
  }, [])

  const loadData = useCallback(async () => {
    if (!session) return
    const res = await fetch("/api/my", { headers: { "x-auth-token": session.token } })
    if (res.status === 401) {
      localStorage.removeItem(SESSION_KEY)
      setSession(null)
      return
    }
    const data = await res.json()
    setName(data.name ?? "")
    setRegistrations(data.registrations ?? [])
    setLoaded(true)
  }, [session])

  // Refresh every 30s so join buttons activate/deactivate on time
  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30 * 1000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginForm, role: "user" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error ?? "Login failed.")
      } else {
        const newSession = { token: data.token, email: data.email, name: data.name }
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
    if (session) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "x-auth-token": session.token },
      }).catch(() => {})
    }
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setLoaded(false)
    setRegistrations([])
  }

  if (!sessionLoaded) return null

  // ── Login screen ───────────────────────────────────────────────
  if (!session) {
    return (
      <AuthScreen
        title="Student login"
        description="Login with the email and password you used while registering."
        highlights={["Join your live Zoom classes", "Track your attendance", "Download study materials", "Get your certificate"]}
        footer={
          <>
            Not registered yet?{" "}
            <Link href="/#programs" className="font-semibold text-brand-ink hover:underline">
              Enroll in a program
            </Link>{" "}
            to create your account.
          </>
        }
      >
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <Input
              id="user-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="h-12"
              required
            />
          </div>
          <div>
            <label htmlFor="user-password" className="block text-sm font-medium mb-1.5">
              Password
            </label>
            <Input
              id="user-password"
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
            {loggingIn ? "Signing in…" : "Login"}
          </Button>
        </form>
      </AuthScreen>
    )
  }

  const approvedRegistrations = registrations.filter((r) => r.status === "approved")
  const totalMaterials = approvedRegistrations.reduce((sum, r) => sum + r.materials.length, 0)
  const totalCertificates = registrations.filter((r) => r.certificate).length
  const daysAttended = approvedRegistrations.reduce(
    (sum, r) => sum + r.attendance.filter((d) => d.class || d.oneOnOne).length,
    0,
  )
  const liveNow = approvedRegistrations.some((r) => r.zoomLink && (r.classJoinable || r.slotJoinable))
  const displayName = name || session.name || "Student"

  const card = "bg-card rounded-2xl border border-border shadow-sm"

  const joinButton = (live: boolean, href: string, label: string, hint: string) =>
    live && href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-primary text-white rounded-xl px-5 h-11 text-sm font-semibold shadow-md shadow-orange-500/25 hover:bg-[#de7200] transition-colors"
      >
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
          <span className="relative w-2 h-2 rounded-full bg-white" />
        </span>
        {label}
      </a>
    ) : (
      <div className="space-y-1.5">
        <button
          disabled
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-muted text-muted-foreground rounded-xl px-5 h-11 text-sm font-semibold cursor-not-allowed"
        >
          <Video className="w-4 h-4" aria-hidden="true" />
          {label}
        </button>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    )

  const emptyState = (message: React.ReactNode) => (
    <div className={`${card} p-10 text-center text-muted-foreground`}>{message}</div>
  )

  // ── Dashboard ──────────────────────────────────────────────────
  return (
    <DashboardShell
      roleLabel="Student"
      userName={displayName}
      userEmail={session.email}
      navItems={[
        {
          key: "services",
          label: "Overview",
          icon: LayoutDashboard,
          description: "Your programs, class timings and live join buttons.",
        },
        {
          key: "attendance",
          label: "Attendance",
          icon: CalendarCheck,
          description: "Marked by your trainer after each class and one-on-one session.",
        },
        {
          key: "materials",
          label: "Materials",
          icon: FolderOpen,
          badge: totalMaterials,
          description: "PDFs, presentations and notes shared by your trainer.",
        },
        {
          key: "certificates",
          label: "Certificates",
          icon: Award,
          badge: totalCertificates,
          description: "Issued personally by your trainer when you complete a program.",
        },
      ]}
      activeKey={tab}
      onSelect={setTab}
      onLogout={handleLogout}
    >
      {!loaded ? (
        emptyState("Loading your dashboard…")
      ) : registrations.length === 0 ? (
        emptyState(
          <div className="space-y-3">
            <p>
              No programs are registered with <strong className="text-foreground">{session.email}</strong> yet.
            </p>
            <Link href="/#programs" className="inline-block font-semibold text-brand-ink hover:underline">
              Explore programs and enroll →
            </Link>
          </div>,
        )
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === "services" && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-foreground text-background p-6 md:p-8">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary/30 blur-2xl" aria-hidden="true" />
                <p className="relative text-sm text-background/60">Welcome back</p>
                <h2 className="relative text-2xl md:text-3xl font-bold tracking-tight mt-1">Hi, {displayName}!</h2>
                <p className="relative mt-2 text-sm md:text-base text-background/75 max-w-xl">
                  {liveNow
                    ? "A session is live right now — use the orange Join button below."
                    : approvedRegistrations.length > 0
                      ? "Join buttons switch on automatically during your class and one-on-one times."
                      : "Your registration is being reviewed — we'll contact you personally to confirm."}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Programs", value: registrations.length, icon: BookOpen },
                  { label: "Days attended", value: daysAttended, icon: CalendarCheck },
                  { label: "Materials", value: totalMaterials, icon: FolderOpen },
                  { label: "Certificates", value: totalCertificates, icon: Award },
                ].map((stat) => (
                  <div key={stat.label} className={`${card} p-4 md:p-5`}>
                    <div className="w-9 h-9 rounded-lg bg-accent text-brand-ink flex items-center justify-center mb-3">
                      <stat.icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {registrations.map((registration) => (
                <div key={registration.id} className={`${card} overflow-hidden`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap p-5 md:p-6 border-b border-border">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FFB547] to-[#EF7D00] text-white flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-lg md:text-xl font-bold leading-tight">{registration.serviceTitle}</h2>
                        {registration.serviceDuration && (
                          <p className="text-sm text-muted-foreground mt-0.5">{registration.serviceDuration}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold rounded-full px-3 py-1.5 ${
                        registration.status === "approved"
                          ? "bg-green-500/15 text-green-700"
                          : "bg-accent text-brand-ink"
                      }`}
                    >
                      {registration.status === "approved" ? "✓ Approved" : "Pending approval"}
                    </span>
                  </div>

                  {registration.status === "pending" ? (
                    <p className="p-5 md:p-6 text-sm text-muted-foreground leading-relaxed">
                      Our team will contact you soon for confirmation. Once approved, your class timings, attendance,
                      study materials and certificate will appear here.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                      <div className="p-5 md:p-6 space-y-4">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <Users className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                            Daily Group Class
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {formatTime12(registration.classStart)} – {formatTime12(registration.classEnd)}
                          </p>
                        </div>
                        {joinButton(
                          registration.classJoinable,
                          registration.zoomLink,
                          "Join Class on Zoom",
                          registration.hasZoomLink
                            ? "Activates during class hours."
                            : "Activates during class hours (Zoom link will be added by your trainer).",
                        )}
                      </div>
                      <div className="p-5 md:p-6 space-y-4">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <UserRound className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                            Your One-on-One Session
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {registration.slotStart && registration.slotEnd
                              ? `${formatTime12(registration.slotStart)} – ${formatTime12(registration.slotEnd)} (your personal slot)`
                              : "Your slot will be assigned shortly"}
                          </p>
                        </div>
                        {joinButton(
                          registration.slotJoinable,
                          registration.zoomLink,
                          "Join One-on-One",
                          "Activates only during your personal slot time.",
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Attendance (read-only, marked by trainer) ── */}
          {tab === "attendance" && (
            <div className="space-y-4">
              {registrations.map((registration) => {
                const present = registration.attendance.filter((d) => d.class || d.oneOnOne).length
                return (
                  <div key={registration.id} className={`${card} p-5 md:p-6`}>
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
                      <h2 className="text-lg font-bold">{registration.serviceTitle}</h2>
                      {registration.status === "approved" && (
                        <span className="text-xs font-semibold bg-accent text-brand-ink rounded-full px-3 py-1.5">
                          {present} day{present === 1 ? "" : "s"} attended
                        </span>
                      )}
                    </div>
                    {registration.status === "pending" ? (
                      <p className="text-sm text-muted-foreground bg-muted/60 rounded-xl p-4">
                        Attendance starts once your registration is approved.
                      </p>
                    ) : (
                      <AttendanceGrid days={registration.attendance} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Materials ── */}
          {tab === "materials" && (
            <div className="space-y-4">
              {approvedRegistrations.length === 0
                ? emptyState("Study materials appear here after your registration is approved.")
                : approvedRegistrations.map((registration) => (
                    <div key={registration.id} className={`${card} p-5 md:p-6`}>
                      <h2 className="text-lg font-bold mb-4">{registration.serviceTitle}</h2>
                      {registration.materials.length === 0 ? (
                        <p className="text-sm text-muted-foreground bg-muted/60 rounded-xl p-4">
                          No materials shared yet — your trainer will upload PDFs, presentations and notes here.
                        </p>
                      ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {registration.materials.map((material) => {
                            const MaterialIcon = materialIcon(material.mime, material.name)
                            return (
                              <li
                                key={material.id}
                                className="flex items-center gap-3 rounded-xl p-3.5 border border-border hover:border-[#F5A623]/60 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-lg bg-accent text-brand-ink flex items-center justify-center flex-shrink-0">
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
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors flex-shrink-0"
                                  aria-label={`Download ${material.name}`}
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" aria-hidden="true" />
                                </a>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
            </div>
          )}

          {/* ── Certificates ── */}
          {tab === "certificates" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrations.map((registration) => (
                <div key={registration.id} className={`${card} p-5 md:p-6 flex flex-col`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        registration.certificate
                          ? "bg-gradient-to-br from-[#FFB547] to-[#EF7D00] text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Award className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold leading-tight">{registration.serviceTitle}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {registration.certificate
                          ? `Certificate of Completion · Issued ${new Date(
                              registration.certificate.uploadedAt,
                            ).toLocaleDateString()}`
                          : "Not issued yet"}
                      </p>
                    </div>
                  </div>
                  {registration.certificate ? (
                    <a
                      href={registration.certificate.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center justify-center gap-2 bg-primary text-white rounded-xl h-11 text-sm font-semibold hover:bg-[#de7200] transition-colors"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                      Download Certificate
                    </a>
                  ) : (
                    <p className="mt-auto text-sm text-muted-foreground bg-muted/60 rounded-xl p-4">
                      Your certificate will appear here after you complete the course.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  )
}
