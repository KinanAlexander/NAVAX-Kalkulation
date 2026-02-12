import * as React from "react"
import { cn } from "@/lib/utils"

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  title: string
  description: string
  href?: string
}

export function FeatureCard({
  className,
  icon,
  title,
  description,
  href,
  ...props
}: FeatureCardProps) {
  const Wrapper = href ? "a" : "div"
  const linkProps = href ? { href } : {}

  return (
    <Wrapper
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card p-6 transition-all",
        href && "cursor-pointer hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
        className
      )}
      {...linkProps}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      <span
        className={cn(
          "mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-5",
          href && "transition-colors group-hover:bg-primary/15"
        )}
      >
        {icon}
      </span>
      <h3 className="text-base font-semibold font-heading text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Wrapper>
  )
}
