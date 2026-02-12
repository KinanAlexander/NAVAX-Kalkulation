"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react"
import type { QuoteState } from "@/lib/store/types"
import { PRICE_CATEGORIES } from "@/lib/store/types"

interface ExcelPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteState: QuoteState
  onDownload: () => void
  isGenerating: boolean
}

type TabId = "zusammenfassung" | "lizenzen" | "dienstleistungen" | "solutions" | "csv"

interface Tab {
  id: TabId
  label: string
  shortLabel: string
}

const TABS: Tab[] = [
  { id: "zusammenfassung", label: "Zusammenfassung", shortLabel: "Kopf" },
  { id: "lizenzen", label: "Lizenzen (LIZ)", shortLabel: "LIZ" },
  { id: "dienstleistungen", label: "Dienstleistungen (DL)", shortLabel: "DL" },
  { id: "solutions", label: "NX Solutions", shortLabel: "NX" },
  { id: "csv", label: "Customer Service", shortLabel: "CSV" },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

function PreviewTable({
  headers,
  rows,
  highlightHeader,
}: {
  headers: string[]
  rows: (string | number)[][]
  highlightHeader?: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr
            className={cn(
              highlightHeader
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-3 py-2 text-left font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={cn(
                "border-t border-border transition-colors",
                ri % 2 === 0 ? "bg-card" : "bg-muted/30"
              )}
            >
              {row.map((cell, ci) => (
                <td key={ci} className="whitespace-nowrap px-3 py-2 text-foreground">
                  {typeof cell === "number" ? formatCurrency(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={headers.length}
                className="px-3 py-6 text-center text-muted-foreground"
              >
                Keine Positionen vorhanden
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function SummaryTab({ q }: { q: QuoteState }) {
  const h = q.header
  const fields = [
    ["Unternehmensname", h.unternehmensname],
    ["Angebotstitel", h.angebotstitel],
    ["Sprache", h.sprache],
    ["Angebot im Mandant", h.angebotImMandant],
    ["Lizenzart / Deployment", h.lizenzart],
    ["Lizenzabrechnung", h.lizenzabrechnung],
    ["Kostenstelle", h.kostenstelle],
    ["Kostentraeger", h.kostentraeger],
    ["Projektverantwortlicher", h.projektverantwortlicher],
    ["Projektart", h.projektart],
    ["DL-Einheit", h.registerkarteDlEinheit],
    ["Ansprechpartner Kunde", h.ansprechpartnerKunde],
    ["Gueltig bis", h.angebotGueltigBis],
    ["Eingereicht von", h.eingereichtVon],
    ["Eingereicht am", h.eingereichtAm],
  ]

  const lizenzMonat = q.licenses.reduce((s, l) => s + l.total, 0)
  const dlEinmalig = q.services.reduce((s, sv) => s + sv.total, 0)
  const solEinmalig = q.solutions.reduce((s, sol) => s + sol.flatRate, 0)
  const csvMonat = q.customerService.reduce((s, c) => s + c.monthlyFee * c.quantity, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Header fields */}
      <div className="grid grid-cols-1 gap-px rounded-lg border border-border overflow-hidden sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 bg-card px-3 py-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <span className={cn("text-xs font-medium", value ? "text-foreground" : "text-destructive")}>
              {value || "-- nicht gesetzt --"}
            </span>
          </div>
        ))}
      </div>

      {/* Summary totals */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-primary px-3 py-2">
          <span className="text-xs font-semibold text-primary-foreground">
            Gesamtuebersicht
          </span>
        </div>
        <div className="divide-y divide-border">
          {[
            ["Lizenzen (monatlich)", lizenzMonat],
            ["Dienstleistungen (einmalig)", dlEinmalig],
            ["NX Solutions (einmalig)", solEinmalig],
            ["Customer Service (monatlich)", csvMonat],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between px-3 py-2 bg-card">
              <span className="text-xs text-muted-foreground">{label as string}</span>
              <span className="text-xs font-semibold text-foreground font-mono">
                {formatCurrency(value as number)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50">
            <span className="text-xs font-semibold text-foreground">Monatlich gesamt</span>
            <span className="text-sm font-bold text-primary font-mono">
              {formatCurrency(lizenzMonat + csvMonat)}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50">
            <span className="text-xs font-semibold text-foreground">Einmalig gesamt</span>
            <span className="text-sm font-bold text-primary font-mono">
              {formatCurrency(dlEinmalig + solEinmalig)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LizenzenTab({ q }: { q: QuoteState }) {
  return (
    <PreviewTable
      headers={["Kategorie", "Produkt", "Stueck", "Einzelpreis", "Rabatt %", "Summe", "Optional"]}
      rows={q.licenses.map((l) => [
        l.category,
        l.product,
        String(l.quantity),
        l.unitPrice,
        `${l.discount}%`,
        l.total,
        l.optional ? "Ja" : "Nein",
      ])}
      highlightHeader
    />
  )
}

function DienstleistungenTab({ q }: { q: QuoteState }) {
  return (
    <PreviewTable
      headers={["Kategorie", "Beschreibung", "Einheit", "Menge", "Tagessatz", "Rabatt %", "Summe"]}
      rows={q.services.map((s) => [
        s.category,
        s.description,
        s.unit,
        String(s.quantity),
        s.rate,
        `${s.discount}%`,
        s.total,
      ])}
      highlightHeader
    />
  )
}

function SolutionsTab({ q }: { q: QuoteState }) {
  return (
    <PreviewTable
      headers={["Solution", "Preiskategorie", "Pauschale", "Zzgl. DL (Tage)"]}
      rows={q.solutions.map((s) => [
        s.name,
        `Kat. ${s.priceCategory} (${PRICE_CATEGORIES[s.priceCategory] > 0 ? formatCurrency(PRICE_CATEGORIES[s.priceCategory]) : "auf Anfrage"})`,
        s.flatRate,
        String(s.additionalDl),
      ])}
      highlightHeader
    />
  )
}

function CustomerServiceTab({ q }: { q: QuoteState }) {
  return (
    <PreviewTable
      headers={["Paket", "Beschreibung", "Anzahl", "Monatlich"]}
      rows={q.customerService.map((c) => [
        c.package,
        c.description,
        String(c.quantity),
        c.monthlyFee,
      ])}
      highlightHeader
    />
  )
}

export function ExcelPreviewDialog({
  open,
  onOpenChange,
  quoteState,
  onDownload,
  isGenerating,
}: ExcelPreviewDialogProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>("zusammenfassung")

  const currentIdx = TABS.findIndex((t) => t.id === activeTab)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <FileSpreadsheet className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground font-heading">
                  Excel-Vorschau
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {quoteState.header.angebotstitel || "Angebotskalkulation"} --{" "}
                  {quoteState.header.unternehmensname || "Kunde"}
                </p>
              </div>
            </div>
            <Button onClick={onDownload} disabled={isGenerating} size="sm">
              <Download className="h-4 w-4 mr-1.5" />
              {isGenerating ? "Generiere..." : "Herunterladen"}
            </Button>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="shrink-0 border-y border-border bg-muted/30 px-6">
          <div className="flex items-center gap-1 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "zusammenfassung" && <SummaryTab q={quoteState} />}
          {activeTab === "lizenzen" && <LizenzenTab q={quoteState} />}
          {activeTab === "dienstleistungen" && <DienstleistungenTab q={quoteState} />}
          {activeTab === "solutions" && <SolutionsTab q={quoteState} />}
          {activeTab === "csv" && <CustomerServiceTab q={quoteState} />}
        </div>

        {/* Footer navigation */}
        <div className="shrink-0 border-t border-border bg-muted/30 px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(TABS[currentIdx - 1]?.id || TABS[0].id)}
            disabled={currentIdx === 0}
            className="text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Zurueck
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {currentIdx + 1} / {TABS.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setActiveTab(TABS[currentIdx + 1]?.id || TABS[TABS.length - 1].id)
            }
            disabled={currentIdx === TABS.length - 1}
            className="text-xs"
          >
            Weiter
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
