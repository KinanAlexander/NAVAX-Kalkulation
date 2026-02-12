import * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineItem {
  title: string
  description?: string
  timestamp?: string
  icon?: React.ReactNode
  status?: "completed" | "active" | "pending"
}

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[]
}

export function Timeline({ className, items, ...props }: TimelineProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          {/* Line + dot column */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                item.status === "completed" &&
                  "border-primary bg-primary text-primary-foreground",
                item.status === "active" &&
                  "border-primary bg-background text-primary",
                item.status === "pending" &&
                  "border-border bg-background text-muted-foreground"
              )}
            >
              {item.icon ? (
                <span className="[&_svg]:size-3.5">{item.icon}</span>
              ) : (
                <span
                  className={cn(
                    "size-2 rounded-full",
                    item.status === "completed" && "bg-primary-foreground",
                    item.status === "active" && "bg-primary",
                    item.status === "pending" && "bg-muted-foreground"
                  )}
                />
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-px flex-1 bg-border" />
            )}
          </div>

          {/* Content */}
          <div className={cn("pb-8", index === items.length - 1 && "pb-0")}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>
              {item.timestamp && (
                <span className="text-xs text-muted-foreground">
                  {item.timestamp}
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
