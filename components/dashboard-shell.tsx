"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, LogOut, Menu, X, type LucideIcon } from "lucide-react"
import { BrandMark } from "@/components/site/brand-mark"

export type DashboardNavItem = {
  key: string
  label: string
  icon: LucideIcon
  badge?: number
  /** One line shown under the page title when this item is active */
  description?: string
}

export function DashboardShell({
  roleLabel,
  userName,
  userEmail,
  navItems,
  activeKey,
  onSelect,
  onLogout,
  children,
}: {
  roleLabel: string
  userName: string
  userEmail: string
  navItems: DashboardNavItem[]
  activeKey: string
  onSelect: (key: string) => void
  onLogout: () => void
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const active = navItems.find((item) => item.key === activeKey) ?? navItems[0]

  // Lock page scroll behind the mobile drawer; close it with Escape
  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [drawerOpen])

  const select = (key: string) => {
    onSelect(key)
    setDrawerOpen(false)
    window.scrollTo({ top: 0 })
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 flex items-center justify-between border-b border-border">
        <Link href="/" aria-label="Eleva Academy — website">
          <BrandMark />
        </Link>
        <button
          className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 pt-5 flex-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {roleLabel}
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const isActive = item.key === active.key
            return (
              <button
                key={item.key}
                onClick={() => select(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium text-left transition-colors ${
                  isActive ? "bg-accent text-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? "bg-primary text-white shadow-sm shadow-orange-500/30" : "bg-muted text-foreground/60"
                  }`}
                >
                  <item.icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center ${
                      isActive ? "bg-primary text-white" : "bg-muted text-foreground/70"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span
            className="w-9 h-9 rounded-full bg-foreground text-background font-semibold text-sm flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            {(userName || userEmail || "?").charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-sm font-semibold truncate">{userName}</span>
            <span className="block text-xs text-muted-foreground truncate">{userEmail}</span>
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-40">{sidebar}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Dashboard menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[82%] max-w-[300px] bg-card shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="h-16 px-4 md:px-8 flex items-center gap-3">
            <button
              className="lg:hidden w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-base md:text-lg font-semibold truncate">{active.label}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border bg-card text-sm font-medium hover:border-foreground/25 transition-colors"
            >
              <span className="hidden sm:inline">View website</span>
              <span className="sm:hidden">Website</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <main className="px-4 md:px-8 py-6 md:py-8 max-w-6xl">
          {active.description && (
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-2xl">{active.description}</p>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
