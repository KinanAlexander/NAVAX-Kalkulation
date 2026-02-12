import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface StepperStep {
  label: string
  description?: string
}

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[]
  activeStep: number
  orientation?: "horizontal" | "vertical"
}

export function Stepper({
  className,
  steps,
  activeStep,
  orientation = "horizontal",
  ...props
}: StepperProps) {
  const isHorizontal = orientation === "horizontal"

  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "flex-row items-start" : "flex-col",
        className
      )}
      role="list"
      aria-label="Progress"
      {...props}
    >
      {steps.map((step, i) => {
        const isComplete = i < activeStep
        const isCurrent = i === activeStep
        const isLast = i === steps.length - 1

        return (
          <div
            key={i}
            className={cn(
              "flex",
              isHorizontal ? "flex-1 items-center" : "items-start gap-3"
            )}
            role="listitem"
            aria-current={isCurrent ? "step" : undefined}
          >
            {/* Indicator + connector */}
            <div
              className={cn(
                "flex shrink-0",
                isHorizontal ? "flex-col items-center" : "flex-col items-center"
              )}
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary",
                  !isComplete && !isCurrent && "border-border bg-background text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="size-4" /> : i + 1}
              </div>
              {/* Vertical connector */}
              {!isLast && !isHorizontal && (
                <div
                  className={cn(
                    "mx-auto mt-1 h-8 w-0.5",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div
              className={cn(
                isHorizontal ? "mt-2 text-center px-2" : "pb-8"
              )}
            >
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-foreground" : isComplete ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>

            {/* Horizontal connector */}
            {!isLast && isHorizontal && (
              <div
                className={cn(
                  "mt-4 h-0.5 flex-1",
                  isComplete ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
