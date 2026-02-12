"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavaxLogo } from "./navax-logo"

interface NavItem {
  label: string
  href?: string
  children?: { label: string; href: string; description?: string }[]
}

interface AppHeaderProps {
  items?: NavItem[]
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

const defaultItems: NavItem[] = [
  {
    label: "Solutions",
    children: [
      { label: "ERP", href: "#", description: "Streamline business operations" },
      { label: "CRM", href: "#", description: "Manage customer relationships" },
      { label: "Business Intelligence", href: "#", description: "Data-driven decisions" },
    ],
  },
  {
    label: "Industries",
    children: [
      { label: "Manufacturing", href: "#" },
      { label: "Professional Services", href: "#" },
      { label: "Construction", href: "#" },
    ],
  },
  { label: "References", href: "#" },
  { label: "Insights", href: "#" },
  { label: "Events", href: "#" },
]

export function AppHeader({
  items = defaultItems,
  ctaLabel = "Contact us",
  ctaHref = "#",
  className,
}: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80", className)}>
      {/* Main nav */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="shrink-0" aria-label="Home">
          <NavaxLogo variant="dark" width={120} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {items.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                  aria-expanded={openDropdown === item.label}
                  aria-haspopup="true"
                >
                  {item.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openDropdown === item.label && "rotate-180")} />
                </button>
                {openDropdown === item.label && (
                  <div className="absolute left-0 top-full z-50 min-w-56 rounded-lg border border-border bg-popover p-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block rounded-md px-3 py-2.5 text-sm text-popover-foreground transition-colors hover:bg-accent"
                      >
                        <span className="font-medium">{child.label}</span>
                        {child.description && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">{child.description}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href || "#"}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {items.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === item.label && "rotate-180")} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-primary/20 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button className="w-full" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
