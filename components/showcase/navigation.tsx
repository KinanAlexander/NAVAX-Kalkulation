"use client"

import React from "react"
import { Navbar, NavbarLink, Breadcrumbs, TabNav, PageHeader, NavaxLogo } from "@/components/ds"
import { Button } from "@/components/ui/button"
import { Bell, Plus } from "lucide-react"

export function ShowcaseNavigation() {
  const [activeTab, setActiveTab] = React.useState("overview")

  return (
    <div className="flex flex-col gap-8">
      {/* Navbar */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Navbar</p>
        <div className="rounded-lg border border-border overflow-hidden">
          <Navbar
            logo={<NavaxLogo width={100} variant="dark" />}
            actions={
              <>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="size-4" />
                </Button>
                <Button size="sm">Sign up</Button>
              </>
            }
          >
            <NavbarLink href="#" active>
              Dashboard
            </NavbarLink>
            <NavbarLink href="#">Projects</NavbarLink>
            <NavbarLink href="#">Team</NavbarLink>
            <NavbarLink href="#">Settings</NavbarLink>
          </Navbar>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Breadcrumbs</p>
        <div className="flex flex-col gap-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "#" },
              { label: "Projects", href: "#" },
              { label: "NAVAX" },
            ]}
          />
          <Breadcrumbs
            items={[
              { label: "Settings", href: "#" },
              { label: "Team", href: "#" },
              { label: "Members", href: "#" },
              { label: "Invite" },
            ]}
          />
        </div>
      </div>

      {/* Tab Nav */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Tab Navigation</p>
        <TabNav
          value={activeTab}
          onValueChange={setActiveTab}
          items={[
            { label: "Overview", value: "overview" },
            { label: "Activity", value: "activity", count: 12 },
            { label: "Settings", value: "settings" },
            { label: "Members", value: "members", count: 4 },
          ]}
        />
        <div className="mt-4 rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">
            {"Active tab: "}
            <span className="font-medium text-foreground">{activeTab}</span>
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Page Header</p>
        <div className="rounded-lg border border-border p-6">
          <PageHeader
            title="Team Members"
            description="Manage your team and their account permissions here."
            breadcrumbs={
              <Breadcrumbs
                items={[
                  { label: "Settings", href: "#" },
                  { label: "Team Members" },
                ]}
              />
            }
            actions={
              <Button size="sm">
                <Plus className="size-4" />
                Invite
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
