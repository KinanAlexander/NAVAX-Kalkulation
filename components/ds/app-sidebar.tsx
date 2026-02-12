"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutDashboard, Users, BarChart3, Settings, ChevronLeft, ChevronRight, ChevronDown, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavaxLogo } from "./navax-logo"

interface SidebarItem {
  label: string
  href?: string
  icon?: LucideIcon
  children?: { label: string; href: string }[]
  badge?: string
}

interface AppSidebarProps {
  items?: SidebarItem[]
  activePath?: string
  className?: string
  defaultCollapsed?: boolean
  user?: { name: string; email: string; avatar?: string }
}

const defaultItems: SidebarItem[] = [
  { label: "Dashboard", href: "#", icon: LayoutDashboard },
  {
    label: "Customers",
    icon: Users,
    badge: "12",
    children: [
      { label: "All Customers", href: "#" },
      { label: "Segments", href: "#" },
      { label: "Leads", href: "#" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { label: "Overview", href: "#" },
      { label: "Reports", href: "#" },
    ],
  },
  { label: "Settings", href: "#", icon: Settings },
]

export function AppSidebar({
  items = defaultItems,
  activePath = "#",
  className,
  defaultCollapsed = false,
  user = { name: "Maria Schmidt", email: "m.schmidt@navax.com" },
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [openSections, setOpenSections] = React.useState<string[]>([])

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    )
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo area */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        {!collapsed && (
          <Link href="/" className="shrink-0">
            <NavaxLogo variant="brand" width={100} />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Sidebar navigation">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const Icon = item.icon
            const isOpen = openSections.includes(item.label)
            const isActive = item.href === activePath
            const hasChildren = !!item.children

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleSection(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isOpen && "rotate-180")} />
                        </>
                      )}
                    </button>
                    {isOpen && !collapsed && (
                      <ul className="ml-5 flex flex-col gap-0.5 border-l-2 border-sidebar-border pl-3 pt-0.5">
                        {item.children!.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              className={cn(
                                "block rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground",
                                child.href === activePath && "bg-sidebar-accent font-medium text-sidebar-primary"
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                      isActive && "bg-sidebar-accent text-sidebar-primary",
                      collapsed && "justify-center px-0"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground" aria-label="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
