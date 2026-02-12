"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

export interface CommandItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  group?: string
  onSelect: () => void
}

interface CommandMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  items: CommandItem[]
  placeholder?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({
  className,
  items,
  placeholder = "Type a command or search...",
  open,
  onOpenChange,
  ...props
}: CommandMenuProps) {
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onOpenChange])

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const groups = Array.from(new Set(filtered.map((i) => i.group || "Actions")))

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover shadow-2xl",
          className
        )}
        role="dialog"
        aria-label="Command menu"
        {...props}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group}>
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {group}
                </p>
                {filtered
                  .filter((i) => (i.group || "Actions") === group)
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        item.onSelect()
                        onOpenChange(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {item.icon && (
                        <span className="shrink-0 text-muted-foreground [&_svg]:size-4">
                          {item.icon}
                        </span>
                      )}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.shortcut && (
                        <kbd className="ml-auto text-[10px] font-mono text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
