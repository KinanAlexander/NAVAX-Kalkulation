import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  showAvatar?: boolean
  showImage?: boolean
}

export function SkeletonCard({
  className,
  lines = 3,
  showAvatar = false,
  showImage = false,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 flex flex-col gap-4",
        className
      )}
      {...props}
    >
      {showImage && <Skeleton className="h-40 w-full rounded-md" />}
      <div className="flex items-center gap-3">
        {showAvatar && <Skeleton className="size-10 rounded-full shrink-0" />}
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  )
}
