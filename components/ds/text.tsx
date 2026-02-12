import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva("font-sans", {
  variants: {
    variant: {
      body: "text-base leading-relaxed text-foreground",
      small: "text-sm text-muted-foreground",
      caption: "text-xs text-muted-foreground",
      code: "text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md",
      lead: "text-lg leading-relaxed text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div" | "label"
}

export function Text({
  className,
  variant,
  as: Tag = "p",
  ...props
}: TextProps) {
  return (
    <Tag className={cn(textVariants({ variant, className }))} {...props} />
  )
}
