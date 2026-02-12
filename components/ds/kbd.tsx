import * as React from "react"
import { cn } from "@/lib/utils"

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys: string[]
}

export function Kbd({ className, keys, ...props }: KbdProps) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} {...props}>
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
          <kbd
            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
          >
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  )
}
