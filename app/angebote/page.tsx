"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/ds/page-header"
import { SearchInput } from "@/components/ds/search-input"
import { StatusBadge } from "@/components/ds/status-badge"
import { StatCard } from "@/components/ds/stat-card"
import { EmptyState } from "@/components/ds/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllQuotes, deleteQuote } from "@/lib/store/quote-store"
import type { SavedQuote } from "@/lib/store/types"
import {
  FileSpreadsheet,
  Trash2,
  Download,
  Plus,
  BarChart3,
  FileCheck2,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const statusMap = {
  draft: { label: "Entwurf", status: "muted" as const },
  generated: { label: "Generiert", status: "success" as const },
  sent: { label: "Gesendet", status: "default" as const },
}

export default function AngebotePage() {
  const [quotes, setQuotes] = React.useState<SavedQuote[]>([])
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    setQuotes(getAllQuotes())
  }, [])

  const filteredQuotes = quotes.filter((q) => {
    const term = search.toLowerCase()
    return (
      q.customerName.toLowerCase().includes(term) ||
      q.title.toLowerCase().includes(term)
    )
  })

  const handleDelete = (id: string) => {
    deleteQuote(id)
    setQuotes(getAllQuotes())
    toast.success("Angebot geloescht")
  }

  const handleRedownload = async (quote: SavedQuote) => {
    try {
      const res = await fetch("/api/generate-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteState: quote.quoteState }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Angebotskalkulation_${quote.customerName || "Entwurf"}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Excel heruntergeladen")
    } catch {
      toast.error("Fehler beim Herunterladen")
    }
  }

  const totalQuotes = quotes.length
  const generatedQuotes = quotes.filter((q) => q.status === "generated").length
  const draftQuotes = quotes.filter((q) => q.status === "draft").length

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <PageHeader
            title="Angebote"
            description="Alle generierten Angebotskalkulationen im Ueberblick."
            actions={
              <Button asChild>
                <Link href="/">
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Angebot
                </Link>
              </Button>
            }
          />

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Angebote gesamt"
              value={totalQuotes}
              icon={<BarChart3 />}
            />
            <StatCard
              label="Generiert"
              value={generatedQuotes}
              trend="up"
              icon={<FileCheck2 />}
            />
            <StatCard
              label="Entwuerfe"
              value={draftQuotes}
              icon={<Clock />}
            />
          </div>

          {/* Search */}
          {quotes.length > 0 && (
            <SearchInput
              placeholder="Suche nach Kunde oder Titel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              className="max-w-md"
            />
          )}

          {/* Quote List */}
          {filteredQuotes.length === 0 ? (
            <EmptyState
              icon={<FileSpreadsheet />}
              title={
                quotes.length === 0
                  ? "Noch keine Angebote"
                  : "Keine Ergebnisse"
              }
              description={
                quotes.length === 0
                  ? "Erstelle dein erstes Angebot ueber den KI-Assistenten."
                  : "Kein Angebot passt zu deiner Suche."
              }
              action={
                quotes.length === 0 ? (
                  <Button asChild>
                    <Link href="/">
                      <Plus className="mr-2 h-4 w-4" />
                      Neues Angebot
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredQuotes.map((quote) => {
                const st = statusMap[quote.status]
                return (
                  <Card key={quote.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {quote.customerName || "Unbenannt"}
                          </p>
                          <StatusBadge status={st.status}>
                            {st.label}
                          </StatusBadge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {quote.title || "Kein Titel"} &middot;{" "}
                          {new Date(quote.createdAt).toLocaleDateString("de-AT", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {quote.status === "generated" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRedownload(quote)}
                            aria-label="Erneut herunterladen"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(quote.id)}
                          aria-label="Loeschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
