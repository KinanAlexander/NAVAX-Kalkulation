import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  container?: boolean
}

export function Section({
  className,
  container = true,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("py-16 md:py-20", className)}
      {...props}
    >
      {container ? (
        <div className="mx-auto max-w-6xl px-4 md:px-6">{children}</div>
      ) : (
        children
      )}
    </section>
  )
}
