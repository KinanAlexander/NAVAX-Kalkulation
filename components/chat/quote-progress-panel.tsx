"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ds/progress-bar"
import { Button } from "@/components/ui/button"
import { Download, Check, AlertCircle } from "lucide-react"
import type { QuoteState } from "@/lib/store/types"

interface QuoteProgressPanelProps {
  quoteState: QuoteState
  onGenerateExcel: () => void
  isGenerating?: boolean
  className?: string
}

interface SectionStatus {
  label: string
  filled: number
  total: number
  items: string[]
}

function getSections(q: QuoteState): SectionStatus[] {
  const h = q.header

  const headerFields = [
    { key: "unternehmensname", label: "Unternehmensname" },
    { key: "angebotstitel", label: "Angebotstitel" },
    { key: "sprache", label: "Sprache" },
    { key: "angebotImMandant", label: "Mandant" },
    { key: "lizenzart", label: "Lizenzart" },
    { key: "lizenzabrechnung", label: "Abrechnung" },
    { key: "registerkarteDlEinheit", label: "DL-Einheit" },
    { key: "kostenstelle", label: "Kostenstelle" },
    { key: "kostentraeger", label: "Kostentraeger" },
    { key: "projektverantwortlicher", label: "Verantwortlicher" },
  ] as const

  const headerFilled = headerFields.filter(
    (f) => h[f.key as keyof typeof h] && String(h[f.key as keyof typeof h]).trim() !== ""
  )

  return [
    {
      label: "Kopfdaten",
      filled: headerFilled.length,
      total: headerFields.length,
      items: headerFilled.map((f) => `${f.label}: ${h[f.key as keyof typeof h]}`),
    },
    {
      label: "Lizenzen",
      filled: q.licenses.length,
      total: Math.max(q.licenses.length, 1),
      items: q.licenses.map((l) => `${l.product} (${l.quantity}x)`),
    },
    {
      label: "Dienstleistungen",
      filled: q.services.length,
      total: Math.max(q.services.length, 1),
      items: q.services.map((s) => `${s.description} (${s.quantity} ${s.unit})`),
    },
    {
      label: "NX Solutions",
      filled: q.solutions.length,
      total: Math.max(q.solutions.length, 1),
      items: q.solutions.map((s) => s.name),
    },
    {
      label: "Customer Service",
      filled: q.customerService.length,
      total: Math.max(q.customerService.length, 1),
      items: q.customerService.map((c) => c.package),
    },
    {
      label: "Legal & Reisekosten",
      filled: Object.keys(q.legalTerms).length + Object.keys(q.travelCosts).length > 0 ? 1 : 0,
      total: 1,
      items: [],
    },
  ]
}

export function QuoteProgressPanel({
  quoteState,
  onGenerateExcel,
  isGenerating,
  className,
}: QuoteProgressPanelProps) {
  const sections = getSections(quoteState)
  const totalFilled = sections.reduce((sum, s) => sum + (s.filled > 0 ? 1 : 0), 0)
  const totalSections = sections.length
  const overallPercent = Math.round((totalFilled / totalSections) * 100)

  // Check if minimum required fields are set
  const header = quoteState.header
  const hasMinimumFields =
    !!header.unternehmensname &&
    !!header.angebotstitel &&
    !!header.sprache &&
    !!header.angebotImMandant

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">
          Angebotsfortschritt
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ProgressBar
          value={overallPercent}
          label="Gesamt"
          showValue
          color={overallPercent >= 50 ? "success" : "primary"}
        />

        <div className="flex flex-col gap-3">
          {sections.map((section) => {
            const isDone = section.filled > 0
            return (
              <div key={section.label} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isDone ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {section.label}
                  </span>
                  {section.label === "Kopfdaten" && (
                    <span className="ml-auto text-xs text-muted-foreground font-mono">
                      {section.filled}/{section.total}
                    </span>
                  )}
                </div>
                {section.items.length > 0 && (
                  <div className="ml-6 flex flex-col gap-0.5">
                    {section.items.slice(0, 4).map((item, i) => (
                      <span key={i} className="text-xs text-muted-foreground truncate">
                        {item}
                      </span>
                    ))}
                    {section.items.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{section.items.length - 4} weitere
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-auto pt-2">
          <Button
            className="w-full"
            onClick={onGenerateExcel}
            disabled={!hasMinimumFields || isGenerating}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Wird generiert..." : "Excel generieren"}
          </Button>
          {!hasMinimumFields && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Mindestens Unternehmensname, Titel, Sprache und Mandant erforderlich
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
