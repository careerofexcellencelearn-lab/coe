"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarCheck,
  Clock,
  Download,
  FileImage,
  FileText,
  FolderOpen,
  GraduationCap,
  Presentation,
  UserRound,
  Users,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatTime12 } from "@/lib/time"
import { DashboardShell } from "@/components/dashboard-shell"
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
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
        <div className="blob-shape w-[500px] h-[500px] -top-40 -left-40" />
        <div className="blob-shape w-[400px] h-[400px] -bottom-32 -right-32" />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-border/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white flex items-center justify-center mb-6">
              <GraduationCap className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Login with the email and password you used while registering.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <Input
                  id="user-email"
                  type="email"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
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
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive" role="alert">
                  {loginError}
                </p>
              )}
              <Button type="submit" disabled={loggingIn} className="w-full h-11 font-semibold">
                {loggingIn ? "Signing in…" : "Login"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              Not registered yet?{" "}
              <Link href="/#programs" className="font-medium text-[#E8890C] hover:underline">
                Enroll in a service
              </Link>{" "}
              to create your account.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const approvedRegistrations = registrations.filter((r) => r.status === "approved")
  const totalMaterials = approvedRegistrations.reduce((sum, r) => sum + r.materials.length, 0)
  const totalCertificates = registrations.filter((r) => r.certificate).length

  // ── Dashboard ──────────────────────────────────────────────────
  return (
    <DashboardShell
      brandIcon={GraduationCap}
      title={`Hi, ${name || session.name || "Student"}!`}
      subtitle={session.email}
      navItems={[
        { key: "services", label: "My Services", icon: BookOpen, badge: registrations.length },
        { key: "attendance", label: "Attendance", icon: CalendarCheck },
        { key: "materials", label: "Materials", icon: FolderOpen, badge: totalMaterials },
        { key: "certificates", label: "Certificates", icon: Award, badge: totalCertificates },
      ]}
      activeKey={tab}
      onSelect={setTab}
      onLogout={handleLogout}
    >
      {!loaded ? (
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-10 border border-border/50 text-center text-muted-foreground">
          Loading your dashboard…
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-10 border border-border/50 text-center space-y-3">
          <p className="text-muted-foreground">
            No services are registered with <strong>{session.email}</strong> yet.
          </p>
          <Link href="/#programs" className="inline-block font-semibold text-[#E8890C] hover:underline">
            Explore services and enroll →
          </Link>
        </div>
      ) : (
        <>
          {/* ── My Services ── */}
          {tab === "services" && (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{registration.serviceTitle}</h2>
                      {registration.serviceDuration && (
                        <p className="text-sm text-muted-foreground mt-0.5">{registration.serviceDuration}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium rounded-full px-3 py-1.5 ${
                        registration.status === "approved"
                          ? "bg-green-500/15 text-green-700"
                          : "bg-[#F5A623]/15 text-[#B36A00]"
                      }`}
                    >
                      {registration.status === "approved" ? "✓ Approved" : "Pending approval"}
                    </span>
                  </div>

                  {registration.status === "pending" ? (
                    <div className="bg-muted/40 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
                      Our team will contact you soon for confirmation. Once approved, your class timings, attendance,
                      study materials and certificate will appear here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Group classes */}
                      <div className="bg-background/60 rounded-xl p-5 border border-border/50 space-y-3">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <Users className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                          Daily Group Class
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {formatTime12(registration.classStart)} – {formatTime12(registration.classEnd)}
                        </p>
                        {registration.classJoinable && registration.zoomLink ? (
                          <a
                            href={registration.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white rounded-xl px-5 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
                          >
                            <Video className="w-4 h-4" aria-hidden="true" />
                            Join Class on Zoom
                          </a>
                        ) : (
                          <div className="space-y-1.5">
                            <button
                              disabled
                              className="inline-flex items-center gap-2 bg-muted text-muted-foreground rounded-xl px-5 py-3 text-sm font-bold cursor-not-allowed"
                            >
                              <Video className="w-4 h-4" aria-hidden="true" />
                              Join Class on Zoom
                            </button>
                            <p className="text-xs text-muted-foreground">
                              Button activates during class hours
                              {!registration.hasZoomLink && " (Zoom link will be added by your trainer)"}.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* One-on-one slot */}
                      <div className="bg-background/60 rounded-xl p-5 border border-border/50 space-y-3">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <UserRound className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                          Your One-on-One Session
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {registration.slotStart && registration.slotEnd ? (
                            <>
                              {formatTime12(registration.slotStart)} – {formatTime12(registration.slotEnd)} (your
                              personal slot)
                            </>
                          ) : (
                            "Your slot will be assigned shortly"
                          )}
                        </p>
                        {registration.slotJoinable && registration.zoomLink ? (
                          <a
                            href={registration.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white rounded-xl px-5 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
                          >
                            <Video className="w-4 h-4" aria-hidden="true" />
                            Join One-on-One
                          </a>
                        ) : (
                          <div className="space-y-1.5">
                            <button
                              disabled
                              className="inline-flex items-center gap-2 bg-muted text-muted-foreground rounded-xl px-5 py-3 text-sm font-bold cursor-not-allowed"
                            >
                              <Video className="w-4 h-4" aria-hidden="true" />
                              Join One-on-One
                            </button>
                            <p className="text-xs text-muted-foreground">
                              Button activates only during your personal slot time.
                            </p>
                          </div>
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
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50"
                >
                  <h2 className="text-lg font-bold mb-1">{registration.serviceTitle}</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Attendance is marked by your trainer after each class and one-on-one session.
                  </p>
                  {registration.status === "pending" ? (
                    <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4">
                      Attendance starts once your registration is approved.
                    </p>
                  ) : (
                    <AttendanceGrid days={registration.attendance} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Materials ── */}
          {tab === "materials" && (
            <div className="space-y-4">
              {approvedRegistrations.length === 0 ? (
                <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-10 border border-border/50 text-center text-muted-foreground">
                  Study materials appear here after your registration is approved.
                </div>
              ) : (
                approvedRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50"
                  >
                    <h2 className="text-lg font-bold mb-4">{registration.serviceTitle}</h2>
                    {registration.materials.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No materials shared yet — your trainer will upload PDFs, presentations and notes here.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {registration.materials.map((material) => {
                          const MaterialIcon = materialIcon(material.mime, material.name)
                          return (
                            <li
                              key={material.id}
                              className="flex items-center gap-3 bg-background/60 rounded-xl p-3.5 border border-border/50"
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
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8890C] hover:underline flex-shrink-0"
                              >
                                <Download className="w-4 h-4" aria-hidden="true" />
                                Download
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Certificates ── */}
          {tab === "certificates" && (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50"
                >
                  <h2 className="text-lg font-bold mb-4">{registration.serviceTitle}</h2>
                  {registration.certificate ? (
                    <div className="flex items-center gap-4 bg-background/60 rounded-xl p-5 border border-border/50">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">Certificate of Completion</p>
                        <p className="text-xs text-muted-foreground">
                          Issued {new Date(registration.certificate.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={registration.certificate.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white rounded-xl px-5 py-3 text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0"
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Download
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4">
                      Your certificate will appear here after you complete the course — it is issued personally by your
                      trainer.
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
