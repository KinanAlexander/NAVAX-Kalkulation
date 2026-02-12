"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabNavItem {
  label: string
  value: string
  count?: number
}

interface TabNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TabNavItem[]
  value: string
  onValueChange: (value: string) => void
}

export function TabNav({
  className,
  items,
  value,
  onValueChange,
  ...props
}: TabNavProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 border-b border-border",
        className
      )}
      role="tablist"
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          className={cn(
            "relative inline-flex items-center gap-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
            value === item.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onValueChange(item.value)}
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                value === item.value
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.count}
            </span>
          )}
          {value === item.value && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  )
}
