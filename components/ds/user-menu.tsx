"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LogOut, Settings, User, ChevronsUpDown } from "lucide-react"

interface UserMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  email?: string
  avatarUrl?: string
  initials?: string
  onProfile?: () => void
  onSettings?: () => void
  onSignOut?: () => void
}

export function UserMenu({
  className,
  name,
  email,
  avatarUrl,
  initials,
  onProfile,
  onSettings,
  onSignOut,
  ...props
}: UserMenuProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fallback = initials || name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {fallback}
          </span>
        )}
        <div className="flex-1 truncate">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          {email && (
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          )}
        </div>
        <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-1 w-full min-w-[200px] rounded-lg border border-border bg-popover p-1 shadow-lg">
          {onProfile && (
            <button
              type="button"
              onClick={() => { onProfile(); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <User className="size-4" />
              Profile
            </button>
          )}
          {onSettings && (
            <button
              type="button"
              onClick={() => { onSettings(); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Settings className="size-4" />
              Settings
            </button>
          )}
          {(onProfile || onSettings) && onSignOut && (
            <div className="my-1 h-px bg-border" />
          )}
          {onSignOut && (
            <button
              type="button"
              onClick={() => { onSignOut(); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  )
}
