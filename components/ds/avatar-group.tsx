import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

interface AvatarItem {
  src?: string
  fallback: string
  alt?: string
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AvatarItem[]
  max?: number
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
}

export function AvatarGroup({
  className,
  items,
  max = 5,
  size = "md",
  ...props
}: AvatarGroupProps) {
  const visible = items.slice(0, max)
  const remaining = items.length - max

  return (
    <div
      className={cn("flex items-center -space-x-2", className)}
      {...props}
    >
      {visible.map((item, i) => (
        <Avatar
          key={i}
          className={cn(
            sizeClasses[size],
            "border-2 border-background ring-0"
          )}
        >
          {item.src && <AvatarImage src={item.src || "/placeholder.svg"} alt={item.alt || item.fallback} />}
          <AvatarFallback className="text-[inherit] bg-primary/10 text-primary font-medium">
            {item.fallback}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            "inline-flex items-center justify-center rounded-full border-2 border-background bg-muted font-medium text-muted-foreground"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
