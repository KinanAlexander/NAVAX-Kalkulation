import Link from "next/link"
import { cn } from "@/lib/utils"
import { NavaxLogo } from "./navax-logo"

interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

interface AppFooterProps {
  columns?: FooterColumn[]
  className?: string
  companyName?: string
}

const defaultColumns: FooterColumn[] = [
  {
    title: "Solutions",
    links: [
      { label: "ERP", href: "#" },
      { label: "CRM", href: "#" },
      { label: "Business Intelligence", href: "#" },
      { label: "Automation", href: "#" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Manufacturing", href: "#" },
      { label: "Professional Services", href: "#" },
      { label: "Construction", href: "#" },
      { label: "Trade", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Whitepapers", href: "#" },
      { label: "Events", href: "#" },
      { label: "Newsletter", href: "#" },
    ],
  },
]

export function AppFooter({
  columns = defaultColumns,
  className,
  companyName = "NAVAX",
}: AppFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className={cn("border-t border-border bg-foreground text-background", className)}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          {/* Brand column */}
          <div className="flex flex-col gap-4 lg:max-w-xs">
            <NavaxLogo variant="light" width={120} />
            <p className="text-sm leading-relaxed text-background/70">
              With over 30 years of experience, we offer future-proof standard solutions based on Microsoft technology and customised programming.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-3 text-sm font-semibold text-background">{column.title}</h4>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-background/60 transition-colors hover:text-background"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-6 md:flex-row">
          <p className="text-xs text-background/50">
            {`\u00A9 ${year} ${companyName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-background/50 transition-colors hover:text-background">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-background/50 transition-colors hover:text-background">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs text-background/50 transition-colors hover:text-background">
              Imprint
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
