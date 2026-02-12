import * as React from "react"
import { cn } from "@/lib/utils"

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  actions?: React.ReactNode
}

export function Navbar({
  className,
  logo,
  actions,
  children,
  ...props
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-6">
        {logo && <div className="mr-6 shrink-0">{logo}</div>}
        <nav className="flex flex-1 items-center gap-1">{children}</nav>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

interface NavbarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
}

export function NavbarLink({
  className,
  active,
  children,
  ...props
}: NavbarLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </a>
  )
}
