"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleButtonGroupItem {
  label: string
  value: string
  icon?: React.ReactNode
}

interface ToggleButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ToggleButtonGroupItem[]
  value: string
  onValueChange: (value: string) => void
  size?: "sm" | "md"
}

export function ToggleButtonGroup({
  className,
  items,
  value,
  onValueChange,
  size = "md",
  ...props
}: ToggleButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-muted p-1",
        className
      )}
      role="radiogroup"
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="radio"
          aria-checked={value === item.value}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all",
            size === "sm" && "px-2.5 py-1 text-xs",
            size === "md" && "px-3 py-1.5 text-sm",
            value === item.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onValueChange(item.value)}
        >
          {item.icon && (
            <span className="[&_svg]:size-3.5">{item.icon}</span>
          )}
          {item.label}
        </button>
      ))}
    </div>
  )
}
