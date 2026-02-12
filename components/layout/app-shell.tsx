"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavaxLogo } from "@/components/ds/navax-logo"
import {
  MessageSquarePlus,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useMode } from "@/lib/store/mode-context"

const navItems = [
  {
    label: "Neues Angebot",
    href: "/",
    icon: MessageSquarePlus,
  },
  {
    label: "Angebote",
    href: "/angebote",
    icon: FileSpreadsheet,
  },
  {
    label: "Vorlage",
    href: "/vorlage",
    icon: Settings,
  },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const { mode, setMode } = useMode()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border overflow-visible pt-1",
            collapsed ? "justify-center px-1" : "justify-between px-4"
          )}
        >
          <Link href="/" className="shrink-0 flex items-center overflow-visible">
            <NavaxLogo variant="brand" width={collapsed ? 48 : 100} />
          </Link>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Sidebar zuklappen"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-16 top-3 z-10 h-8 w-8 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent shadow-sm"
              onClick={() => setCollapsed(false)}
              aria-label="Sidebar aufklappen"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Hauptnavigation">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      collapsed && "justify-center px-0"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mode toggle */}
        <div className="border-t border-sidebar-border px-2 py-2">
          <button
            onClick={() => setMode(mode === "demo" ? "live" : "demo")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
              collapsed && "justify-center px-0",
              mode === "live"
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
            title={collapsed ? (mode === "demo" ? "Zu Live wechseln" : "Zu Demo wechseln") : undefined}
            aria-label={mode === "demo" ? "Zu Live-Modus wechseln" : "Zu Demo-Modus wechseln"}
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                mode === "live"
                  ? "bg-primary text-primary-foreground"
                  : "bg-sidebar-foreground/20 text-sidebar-foreground/60"
              )}
            >
              {mode === "live" ? "AI" : "D"}
            </div>
            {!collapsed && (
              <span className="flex-1 text-left">
                {mode === "live" ? "Live (AI)" : "Demo-Modus"}
              </span>
            )}
            {!collapsed && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  mode === "live"
                    ? "bg-primary/20 text-primary"
                    : "bg-sidebar-foreground/10 text-sidebar-foreground/50"
                )}
              >
                {mode === "live" ? "ON" : "OFF"}
              </span>
            )}
          </button>
        </div>

        {/* Dark mode toggle */}
        <div className="border-t border-sidebar-border px-2 py-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all duration-150 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
              aria-label={theme === "dark" ? "Zu Light Mode wechseln" : "Zu Dark Mode wechseln"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 shrink-0" />
              ) : (
                <Moon className="h-4 w-4 shrink-0" />
              )}
              {!collapsed && (
                <span className="flex-1 text-left">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </button>
          )}
        </div>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground shadow-sm">
              NB
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  NAVAX Berater
                </p>
                <p className="truncate text-[11px] text-sidebar-foreground/50">
                  berater@navax.com
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-sidebar-foreground/40 hover:text-sidebar-foreground"
                aria-label="Abmelden"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
