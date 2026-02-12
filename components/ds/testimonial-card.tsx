import * as React from "react"
import { cn } from "@/lib/utils"

interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string
  name: string
  role?: string
  company?: string
  avatarUrl?: string
  rating?: number
}

export function TestimonialCard({
  className,
  quote,
  name,
  role,
  company,
  avatarUrl,
  rating,
  ...props
}: TestimonialCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-6",
        className
      )}
      {...props}
    >
      {rating && (
        <div className="mb-3 flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={cn(
                "size-4",
                i < rating ? "fill-warning text-warning" : "fill-muted text-muted"
              )}
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}

      <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
        {`"${quote}"`}
      </blockquote>

      <div className="mt-5 flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {initials}
          </span>
        )}
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          {(role || company) && (
            <p className="text-xs text-muted-foreground">
              {[role, company].filter(Boolean).join(" at ")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
