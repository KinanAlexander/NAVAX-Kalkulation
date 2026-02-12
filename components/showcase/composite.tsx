"use client"

import { AppHeader } from "@/components/ds/app-header"
import { AppSidebar } from "@/components/ds/app-sidebar"
import { AppFooter } from "@/components/ds/app-footer"
import { NavaxLogo } from "@/components/ds/navax-logo"

export function ShowcaseComposite() {
  return (
    <div className="flex flex-col gap-10">
      {/* Logo variants */}
      <div>
        <p className="text-sm font-medium mb-4 text-foreground">NAVAX Logo</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-6">
            <NavaxLogo variant="dark" width={140} />
            <span className="text-xs text-muted-foreground">Dark (default)</span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-foreground p-6">
            <NavaxLogo variant="light" width={140} />
            <span className="text-xs text-background/60">Light (on dark bg)</span>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-6">
            <NavaxLogo variant="brand" width={140} />
            <span className="text-xs text-muted-foreground">Brand (magenta)</span>
          </div>
        </div>
      </div>

      {/* App Header */}
      <div>
        <p className="text-sm font-medium mb-4 text-foreground">App Header</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <AppHeader />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Full responsive header with dropdown navigation, top bar, search, and CTA. Includes mobile hamburger menu.
        </p>
      </div>

      {/* App Sidebar */}
      <div>
        <p className="text-sm font-medium mb-4 text-foreground">App Sidebar</p>
        <div className="flex overflow-hidden rounded-lg border border-border" style={{ height: 420 }}>
          <AppSidebar defaultCollapsed={false} />
          <div className="flex flex-1 items-center justify-center bg-muted/30 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Main content area</p>
              <p className="text-xs text-muted-foreground/60 mt-1">The sidebar collapses to icon-only on click</p>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Collapsible sidebar with nested navigation, badges, user section, and sign-out. Accepts custom nav items via props.
        </p>
      </div>

      {/* App Footer */}
      <div>
        <p className="text-sm font-medium mb-4 text-foreground">App Footer</p>
        <div className="overflow-hidden rounded-lg border border-border">
          <AppFooter />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Dark footer with brand column, multi-column links, and bottom bar. Accepts custom columns via props.
        </p>
      </div>
    </div>
  )
}
