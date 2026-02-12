"use client"

import { Heading, Text } from "@/components/ds"
import { DataTable } from "@/components/ds/data-table"
import { Stepper } from "@/components/ds/stepper"
import { UserMenu } from "@/components/ds/user-menu"
import { CommandMenu } from "@/components/ds/command-menu"
import { PricingCard } from "@/components/ds/pricing-card"
import { TestimonialCard } from "@/components/ds/testimonial-card"
import { FeatureCard } from "@/components/ds/feature-card"
import { Kbd } from "@/components/ds/kbd"
import { BarChart3, Zap, Shield, Globe, Home, Settings, Users, FileText } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

/* ── Sample data for DataTable ── */
type Employee = Record<string, unknown> & {
  name: string
  role: string
  department: string
  status: string
}

const EMPLOYEES: Employee[] = [
  { name: "Anna Schmidt", role: "Engineer", department: "Product", status: "Active" },
  { name: "Markus Weber", role: "Designer", department: "Design", status: "Active" },
  { name: "Lisa Bauer", role: "PM", department: "Product", status: "On leave" },
  { name: "Thomas Maier", role: "Engineer", department: "Platform", status: "Active" },
]

export function ShowcaseAdvanced() {
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <div className="flex flex-col gap-12">
      {/* Data Table */}
      <div>
        <Heading level={3} className="mb-1">Data Table</Heading>
        <Text variant="small" className="mb-4">Typed, sortable table with column definitions.</Text>
        <DataTable<Employee>
          columns={[
            { key: "name", header: "Name", sortable: true },
            { key: "role", header: "Role" },
            { key: "department", header: "Department", sortable: true },
            { key: "status", header: "Status", align: "right" },
          ]}
          data={EMPLOYEES}
        />
      </div>

      {/* Stepper */}
      <div>
        <Heading level={3} className="mb-1">Stepper</Heading>
        <Text variant="small" className="mb-4">Horizontal and vertical step progress indicators.</Text>
        <div className="flex flex-col gap-8">
          <Stepper
            steps={[
              { label: "Account", description: "Create your account" },
              { label: "Profile", description: "Set up your profile" },
              { label: "Billing", description: "Add payment method" },
              { label: "Complete" },
            ]}
            activeStep={2}
          />
          <Stepper
            orientation="vertical"
            steps={[
              { label: "Order placed", description: "Feb 10, 2026" },
              { label: "Processing", description: "Feb 11, 2026" },
              { label: "Shipped" },
              { label: "Delivered" },
            ]}
            activeStep={1}
          />
        </div>
      </div>

      {/* User Menu + Kbd */}
      <div>
        <Heading level={3} className="mb-1">User Menu + Kbd</Heading>
        <Text variant="small" className="mb-4">Avatar dropdown menu and keyboard shortcut hints.</Text>
        <div className="flex flex-wrap items-end gap-8">
          <div className="w-64">
            <UserMenu
              name="Jonas Wohrle"
              email="jonas@navax.com"
              onProfile={() => {}}
              onSettings={() => {}}
              onSignOut={() => {}}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Search <Kbd keys={["Cmd", "K"]} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Save <Kbd keys={["Cmd", "S"]} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Undo <Kbd keys={["Cmd", "Z"]} />
            </div>
          </div>
        </div>
      </div>

      {/* Command Menu */}
      <div>
        <Heading level={3} className="mb-1">Command Menu</Heading>
        <Text variant="small" className="mb-4">
          {"Spotlight-style command palette. Press"} <Kbd keys={["Cmd", "K"]} /> {"or click below."}
        </Text>
        <Button variant="outline" onClick={() => setCommandOpen(true)}>
          Open command menu
        </Button>
        <CommandMenu
          open={commandOpen}
          onOpenChange={setCommandOpen}
          items={[
            { id: "home", label: "Go to Home", icon: <Home />, group: "Navigation", shortcut: "G H", onSelect: () => {} },
            { id: "settings", label: "Open Settings", icon: <Settings />, group: "Navigation", shortcut: "G S", onSelect: () => {} },
            { id: "users", label: "Manage Users", icon: <Users />, group: "Admin", onSelect: () => {} },
            { id: "docs", label: "View Documentation", icon: <FileText />, group: "Help", onSelect: () => {} },
          ]}
        />
      </div>

      {/* Feature Cards */}
      <div>
        <Heading level={3} className="mb-1">Feature Cards</Heading>
        <Text variant="small" className="mb-4">Marketing feature highlights with icons.</Text>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Zap />} title="Lightning Fast" description="Optimized for speed with edge-first architecture and smart caching." />
          <FeatureCard icon={<Shield />} title="Secure by Default" description="Enterprise-grade security with SSO, RBAC, and audit logging." />
          <FeatureCard icon={<BarChart3 />} title="Analytics" description="Real-time dashboards and reporting across all your business data." />
          <FeatureCard icon={<Globe />} title="Global Scale" description="Multi-region deployment with automatic failover and CDN." />
        </div>
      </div>

      {/* Pricing Cards */}
      <div>
        <Heading level={3} className="mb-1">Pricing Cards</Heading>
        <Text variant="small" className="mb-4">Tier-based pricing with highlighted plan.</Text>
        <div className="grid gap-4 sm:grid-cols-3">
          <PricingCard
            name="Starter"
            description="For small teams getting started"
            price="$19"
            features={["5 users", "10 projects", "Email support", "Basic analytics"]}
          />
          <PricingCard
            name="Pro"
            description="For growing businesses"
            price="$49"
            features={["25 users", "Unlimited projects", "Priority support", "Advanced analytics", "Custom integrations"]}
            highlighted
          />
          <PricingCard
            name="Enterprise"
            description="For large organizations"
            price="$149"
            features={["Unlimited users", "Unlimited projects", "Dedicated support", "Custom analytics", "SSO & SAML", "SLA guarantee"]}
          />
        </div>
      </div>

      {/* Testimonial Cards */}
      <div>
        <Heading level={3} className="mb-1">Testimonial Cards</Heading>
        <Text variant="small" className="mb-4">Customer quotes with ratings and avatars.</Text>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TestimonialCard
            quote="NAVAX transformed our ERP deployment. The team was professional and delivery was ahead of schedule."
            name="Maria Huber"
            role="CTO"
            company="Alpine Solutions"
            rating={5}
          />
          <TestimonialCard
            quote="Their design system saved us months of development time. Highly recommend for any enterprise project."
            name="Peter Gruber"
            role="VP Engineering"
            company="TechForge"
            rating={5}
          />
          <TestimonialCard
            quote="Excellent support and a component library that just works. Integration with our existing stack was seamless."
            name="Sophie Klein"
            role="Lead Developer"
            company="DataFlow"
            rating={4}
          />
        </div>
      </div>
    </div>
  )
}
