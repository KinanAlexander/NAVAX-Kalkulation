'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const alertBannerVariants = cva(
  "relative flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/5 text-primary",
        success: "border-success/20 bg-success/5 text-success",
        warning: "border-warning/20 bg-warning/5 text-warning",
        destructive:
          "border-destructive/20 bg-destructive/5 text-destructive",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  icon?: React.ReactNode
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function AlertBanner({
  className,
  variant,
  icon,
  title,
  dismissible,
  onDismiss,
  children,
  ...props
}: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(alertBannerVariants({ variant, className }))}
      {...props}
    >
      {icon && (
        <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon}</span>
      )}
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-1")}>{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
