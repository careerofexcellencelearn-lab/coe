"use client"

import type React from "react"
import Link from "next/link"
import { ArrowLeft, LogOut, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export type DashboardNavItem = {
  key: string
  label: string
  icon: LucideIcon
  badge?: number
}

export function DashboardShell({
  brandIcon: BrandIcon,
  title,
  subtitle,
  navItems,
  activeKey,
  onSelect,
  onLogout,
  children,
}: {
  brandIcon: LucideIcon
  title: string
  subtitle: string
  navItems: DashboardNavItem[]
  activeKey: string
  onSelect: (key: string) => void
  onLogout: () => void
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blob-shape w-[500px] h-[500px] -top-40 -left-40" />
      <div className="blob-shape w-[400px] h-[400px] -bottom-32 -right-32" />

      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-6">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4 md:p-5 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white flex items-center justify-center flex-shrink-0">
                  <BrandIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="leading-tight min-w-0">
                  <p className="text-sm font-bold truncate">{title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
                </div>
              </div>

              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1" aria-label="Dashboard navigation">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onSelect(item.key)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 lg:w-full ${
                      activeKey === item.key
                        ? "bg-foreground text-background"
                        : "hover:bg-muted/60 text-foreground/80"
                    }`}
                    aria-current={activeKey === item.key ? "page" : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`ml-auto text-[11px] font-bold rounded-full px-2 py-0.5 ${
                          activeKey === item.key ? "bg-background/20 text-background" : "bg-[#F5A623]/20 text-[#B36A00]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="hidden lg:block border-t border-border/50 pt-4 space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-muted/60 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Back to website
                </Link>
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full justify-start gap-3 px-3.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </Button>
              </div>

              {/* Mobile logout row */}
              <div className="flex lg:hidden items-center justify-between border-t border-border/50 pt-3">
                <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  ← Website
                </Link>
                <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2 text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </div>
  )
}
