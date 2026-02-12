import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statCardVariants = cva(
  "rounded-lg border border-border bg-card p-6 flex flex-col gap-2",
  {
    variants: {
      trend: {
        up: "",
        down: "",
        neutral: "",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
)

interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  label: string
  value: string | number
  description?: string
  icon?: React.ReactNode
}

export function StatCard({
  className,
  label,
  value,
  description,
  icon,
  trend,
  ...props
}: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ trend, className }))} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        )}
      </div>
      <span className="text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      {description && (
        <span
          className={cn(
            "text-xs",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive",
            trend === "neutral" && "text-muted-foreground"
          )}
        >
          {description}
        </span>
      )}
    </div>
  )
}
