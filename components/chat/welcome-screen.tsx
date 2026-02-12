"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Building2,
  ShieldCheck,
  BarChart3,
  Zap,
  ArrowRight,
  Mic,
  Paperclip,
  FileSpreadsheet,
} from "lucide-react"

interface QuickAction {
  icon: React.ElementType
  title: string
  description: string
  prompt: string
  color: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Building2,
    title: "BC EasyStarter",
    description: "Business Central Einfuehrung mit EasyStarter-Paket, Schulungen und Go-Live",
    prompt:
      "Kunde Musterfirma GmbH moechte D365 Business Central als SaaS in Wien einfuehren. 10 Essentials, 5 Team Member, EasyStarter Paket, Schulung FIBU und Warenwirtschaft, Go-Live Begleitung. Ansprechpartner ist Herr Mueller, Projekt soll Trade sein.",
    color: "secondary",
  },
  {
    icon: ShieldCheck,
    title: "CRM Projekt",
    description: "D365 Sales oder Customer Service mit Implementierung und Schulung",
    prompt:
      "CRM-Projekt fuer Baufirma Alpenbau AG in Graz. 5 Sales Enterprise Lizenzen, 10 Team Member. CRM EasyStarter Paket, Grundsetup, Schulung Sales und Go-Live. Construction Kostentraeger, SaaS Cloud, Angebot auf Deutsch.",
    color: "info",
  },
  {
    icon: BarChart3,
    title: "Data Analytics",
    description: "Power BI, NAVAX DWH und Data Analytics Packages",
    prompt:
      "Analytics-Projekt fuer Handelsunternehmen in Linz. 8 Power BI Pro Lizenzen, DWH Package Small, Power BI Package Activation, 3 Tage Workshop. Trade Kostentraeger, NAVAX Consulting AT.",
    color: "warning",
  },
  {
    icon: Zap,
    title: "Nur Lizenzen",
    description: "Schnelles Lizenzangebot ohne Dienstleistungen",
    prompt:
      "Lizenzerweiterung fuer Bestandskunde TechPro Solutions in Wien. 5 zusaetzliche BC Essentials, 2 Premium Upgrades und 3 Power Automate Lizenzen. Jaehrliche Abrechnung, SaaS/Cloud.",
    color: "success",
  },
]

interface WelcomeScreenProps {
  onSelectAction: (prompt: string) => void
  disabled?: boolean
}

export function WelcomeScreen({ onSelectAction, disabled }: WelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-1 ring-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-secondary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground font-heading text-balance">
              NAVAX Angebotskalkulation
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              Beschreibe dein Kundenmeeting in natuerlicher Sprache und ich erstelle
              die vollstaendige Angebotskalkulation fuer dich.
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.title}
                onClick={() => onSelectAction(action.prompt)}
                disabled={disabled}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200",
                  "hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:pointer-events-none"
                )}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      action.color === "secondary" && "bg-secondary/10 text-secondary",
                      action.color === "info" && "bg-info/10 text-info",
                      action.color === "warning" && "bg-warning/10 text-warning",
                      action.color === "success" && "bg-success/10 text-success"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Capabilities footer */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5" />
            <span>Spracheingabe</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />
            <span>Datei-Upload</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Excel-Export</span>
          </div>
        </div>
      </div>
    </div>
  )
}
