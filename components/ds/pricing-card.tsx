import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  description?: string
  price: string
  period?: string
  features: string[]
  cta?: string
  highlighted?: boolean
  onSelect?: () => void
}

export function PricingCard({
  className,
  name,
  description,
  price,
  period = "/month",
  features,
  cta = "Get started",
  highlighted = false,
  onSelect,
  ...props
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-6",
        highlighted
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
          : "border-border bg-card",
        className
      )}
      {...props}
    >
      {highlighted && (
        <span className="mb-4 inline-flex self-start rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold font-heading text-foreground">{name}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {price}
        </span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        className="mt-8"
        variant={highlighted ? "default" : "outline"}
        onClick={onSelect}
      >
        {cta}
      </Button>
    </div>
  )
}
