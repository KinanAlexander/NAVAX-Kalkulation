"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ProgressBar } from "@/components/ds/progress-bar"
import { Button } from "@/components/ui/button"
import { Download, Check, Circle, Plus, Mail } from "lucide-react"
import type { QuoteState } from "@/lib/store/types"
import { composeSalesEmail } from "@/lib/email/compose-sales-email"

interface QuoteProgressPanelProps {
  quoteState: QuoteState
  onGenerateExcel: () => void
  isGenerating?: boolean
  onNewQuote?: () => void
  onSendToSales?: () => void
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
  onNewQuote,
  onSendToSales,
  className,
}: QuoteProgressPanelProps) {
  const sections = getSections(quoteState)
  const totalFilled = sections.reduce((sum, s) => sum + (s.filled > 0 ? 1 : 0), 0)
  const totalSections = sections.length
  const overallPercent = Math.round((totalFilled / totalSections) * 100)

  const header = quoteState.header
  const hasMinimumFields =
    !!header.unternehmensname &&
    !!header.angebotstitel &&
    !!header.sprache &&
    !!header.angebotImMandant

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Title */}
      <div>
        <h3 className="text-sm font-semibold text-foreground font-heading">
          Angebotsfortschritt
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {totalFilled} von {totalSections} Bereichen ausgefuellt
        </p>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={overallPercent}
        label=""
        showValue
        color={overallPercent >= 50 ? "success" : "primary"}
      />

      {/* Sections */}
      <div className="flex flex-col gap-1">
        {sections.map((section) => {
          const isDone = section.filled > 0
          return (
            <details
              key={section.label}
              className="group rounded-lg"
              open={isDone && section.items.length > 0}
            >
              <summary className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50 list-none [&::-webkit-details-marker]:hidden">
                {isDone ? (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15">
                    <Check className="h-3 w-3 text-secondary" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </div>
                )}
                <span
                  className={cn(
                    "flex-1 text-xs font-medium",
                    isDone ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {section.label}
                </span>
                {section.label === "Kopfdaten" && (
                  <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {section.filled}/{section.total}
                  </span>
                )}
                {section.label !== "Kopfdaten" && isDone && (
                  <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {section.filled}
                  </span>
                )}
              </summary>
              {section.items.length > 0 && (
                <div className="ml-7 flex flex-col gap-0.5 pb-1 pt-0.5">
                  {section.items.slice(0, 5).map((item, i) => (
                    <span key={i} className="text-[11px] text-muted-foreground truncate leading-relaxed">
                      {item}
                    </span>
                  ))}
                  {section.items.length > 5 && (
                    <span className="text-[11px] text-muted-foreground/60 italic">
                      +{section.items.length - 5} weitere
                    </span>
                  )}
                </div>
              )}
            </details>
          )
        })}
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button
          className="w-full"
          onClick={onGenerateExcel}
          disabled={!hasMinimumFields || isGenerating}
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Wird generiert..." : "Excel generieren"}
        </Button>
        {hasMinimumFields && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={onSendToSales || (() => {
              const url = composeSalesEmail(quoteState)
              window.open(url, "_blank")
            })}
          >
            <Mail className="mr-2 h-4 w-4" />
            An Sales-Support senden
          </Button>
        )}
        {!hasMinimumFields && (
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Mindestens Unternehmensname, Titel, Sprache und Mandant erforderlich
          </p>
        )}
        {onNewQuote && (
          <Button variant="outline" size="sm" className="w-full" onClick={onNewQuote}>
            <Plus className="mr-2 h-4 w-4" />
            Neues Angebot
          </Button>
        )}
      </div>
    </div>
  )
}
