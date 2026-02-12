"use client"

import * as React from "react"
import { ChatInput } from "./chat-input"
import { MessageBubble } from "./message-bubble"
import { QuoteProgressPanel } from "./quote-progress-panel"
import { WelcomeScreen } from "./welcome-screen"
import { ExcelPreviewDialog } from "./excel-preview-dialog"
import { Download, PanelRightOpen, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createEmptyQuoteState } from "@/lib/store/quote-store"
import type { QuoteState } from "@/lib/store/types"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  toolResults?: Array<{
    toolName: string
    args: Record<string, unknown>
    result: Record<string, unknown>
  }>
}

export function ChatInterface() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [quoteState, setQuoteState] = React.useState<QuoteState>(createEmptyQuoteState)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [showMobilePanel, setShowMobilePanel] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const quoteStateRef = React.useRef(quoteState)
  React.useEffect(() => {
    quoteStateRef.current = quoteState
  }, [quoteState])

  const messagesRef = React.useRef(messages)
  React.useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const hasMinimumFields =
    !!quoteState.header.unternehmensname &&
    !!quoteState.header.angebotstitel &&
    !!quoteState.header.sprache &&
    !!quoteState.header.angebotImMandant

  const totalPositions =
    quoteState.licenses.length +
    quoteState.services.length +
    quoteState.solutions.length +
    quoteState.customerService.length

  const applyToolResults = React.useCallback(
    (toolResults: ChatMessage["toolResults"]) => {
      if (!toolResults || toolResults.length === 0) return

      setQuoteState((prev) => {
        let next = { ...prev }

        for (const tr of toolResults) {
          const result = tr.result as Record<string, unknown>
          if (!result.success) continue

          if (tr.toolName === "setHeaderField") {
            const field = tr.args.field as string
            const value = tr.args.value as string
            next = {
              ...next,
              header: { ...next.header, [field]: value },
              customerName: field === "unternehmensname" ? value : next.customerName,
              title: field === "angebotstitel" ? value : next.title,
            }
          }

          if (tr.toolName === "addLicensePosition") {
            const pos = result.position as Record<string, unknown>
            const exists = next.licenses.some(
              (l) => l.product === pos.product && l.category === pos.category
            )
            if (!exists) {
              next = {
                ...next,
                licenses: [
                  ...next.licenses,
                  {
                    id: `lic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    category: pos.category as string,
                    product: pos.product as string,
                    quantity: pos.quantity as number,
                    unitPrice: pos.unitPrice as number,
                    discount: (pos.discount as number) || 0,
                    total: pos.total as number,
                    optional: (pos.optional as boolean) || false,
                    articleNr: "",
                  },
                ],
              }
            }
          }

          if (tr.toolName === "addServicePosition") {
            const pos = result.position as Record<string, unknown>
            const exists = next.services.some((s) => s.description === pos.description)
            if (!exists) {
              next = {
                ...next,
                services: [
                  ...next.services,
                  {
                    id: `svc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    category: pos.category as string,
                    description: pos.description as string,
                    unit: (pos.unit as "LT" | "STD") || "LT",
                    quantity: pos.quantity as number,
                    rate: pos.rate as number,
                    discount: (pos.discount as number) || 0,
                    total: pos.total as number,
                    optional: (pos.optional as boolean) || false,
                  },
                ],
              }
            }
          }

          if (tr.toolName === "addSolutionPosition") {
            const pos = result.position as Record<string, unknown>
            const exists = next.solutions.some((s) => s.name === pos.name)
            if (!exists) {
              const priceMap: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
              next = {
                ...next,
                solutions: [
                  ...next.solutions,
                  {
                    id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    name: pos.name as string,
                    priceCategory: pos.priceCategory as 1 | 2 | 3 | 4,
                    flatRate: (pos.flatRate as number) || priceMap[(pos.priceCategory as number)] || 0,
                    additionalDl: (pos.additionalDl as number) || 0,
                    articleNr: "",
                  },
                ],
              }
            }
          }

          if (tr.toolName === "addCustomerServicePosition") {
            const pos = result.position as Record<string, unknown>
            const exists = next.customerService.some(
              (c) => c.package === (pos.packageName || pos.package)
            )
            if (!exists) {
              next = {
                ...next,
                customerService: [
                  ...next.customerService,
                  {
                    id: `csv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    package: (pos.packageName || pos.package) as string,
                    description: pos.description as string,
                    monthlyFee: pos.monthlyFee as number,
                    quantity: (pos.quantity as number) || 1,
                  },
                ],
              }
            }
          }

          if (tr.toolName === "setLegalTerms") {
            next = {
              ...next,
              legalTerms: {
                nachlassLizenzenMs: (tr.args.nachlassLizenzenMs as number) || 0,
                nachlassLizenzenNavax: (tr.args.nachlassLizenzenNavax as number) || 0,
                nachlassDl: (tr.args.nachlassDl as number) || 0,
                zahlungsfrist: (tr.args.zahlungsfrist as string) || "30 Tage",
              },
            }
          }
        }

        next.updatedAt = new Date().toISOString()
        return next
      })
    },
    []
  )

  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user",
        text: text.trim(),
      }

      const currentMessages = [...messagesRef.current, userMsg]
      setMessages(currentMessages)
      setIsLoading(true)

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: currentMessages.map((m) => ({
              role: m.role,
              parts: [{ type: "text", text: m.text }],
            })),
            quoteState: quoteStateRef.current,
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `HTTP ${res.status}`)
        }

        const data = await res.json()

        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          text: data.text || "Ich konnte die Eingabe nicht verarbeiten.",
          toolResults: data.toolResults,
        }

        setMessages((prev) => [...prev, assistantMsg])

        if (data.toolResults?.length > 0) {
          applyToolResults(data.toolResults)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unbekannter Fehler"
        toast.error(`Fehler: ${errorMsg}`)
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_error`,
            role: "assistant",
            text: `Entschuldigung, es ist ein Fehler aufgetreten: ${errorMsg}`,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, applyToolResults]
  )

  const handleFileUpload = async (file: File) => {
    const text = await file.text()
    sendMessage(`[Hochgeladene Datei: ${file.name}]\n\n${text}`)
    toast.success(`Datei "${file.name}" hochgeladen`)
  }

  const handleGenerateExcel = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteState }),
      })
      if (!res.ok) throw new Error("Excel-Generierung fehlgeschlagen")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Angebotskalkulation_${quoteState.header.unternehmensname || "Entwurf"}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setQuoteState((prev) => ({ ...prev, status: "generated" }))
      setShowPreview(false)
      toast.success("Excel erfolgreich generiert!")
    } catch {
      toast.error("Fehler bei der Excel-Generierung.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNewQuote = () => {
    setMessages([])
    setQuoteState(createEmptyQuoteState())
    setShowMobilePanel(false)
    setShowPreview(false)
  }

  const isWelcome = messages.length === 0

  return (
    <>
      <div className="flex flex-1 gap-0 overflow-hidden relative">
        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages or Welcome */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
            {isWelcome ? (
              <WelcomeScreen onSelectAction={sendMessage} disabled={isLoading} />
            ) : (
              <div className="flex flex-col gap-5 px-4 py-6 lg:px-8">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 items-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 text-primary-foreground">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <div className="rounded-2xl bg-muted/70 px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action bar */}
          {hasMinimumFields && (
            <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3 lg:px-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate font-heading">
                    {quoteState.header.angebotstitel || "Angebot"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalPositions} Positionen -- {quoteState.header.unternehmensname}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowMobilePanel(true)}
                  >
                    <PanelRightOpen className="h-4 w-4 mr-1.5" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">Vorschau</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateExcel}
                    disabled={isGenerating}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    {isGenerating ? "Generiere..." : "Excel herunterladen"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-border bg-background px-4 py-4 lg:px-8">
            <ChatInput onSend={sendMessage} onFileUpload={handleFileUpload} disabled={isLoading} />
          </div>
        </div>

        {/* Progress panel - desktop */}
        <div className="hidden w-80 shrink-0 border-l border-border bg-card/50 lg:flex lg:flex-col overflow-y-auto scrollbar-thin p-4">
          <QuoteProgressPanel
            quoteState={quoteState}
            onGenerateExcel={handleGenerateExcel}
            isGenerating={isGenerating}
            onNewQuote={handleNewQuote}
          />
        </div>

        {/* Progress panel - mobile overlay */}
        {showMobilePanel && (
          <div className="absolute inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowMobilePanel(false)}
            />
            <div className="relative ml-auto w-80 max-w-[85vw] bg-card border-l border-border p-4 overflow-y-auto shadow-xl animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground font-heading">
                  Angebotsdetails
                </span>
                <Button variant="ghost" size="icon" onClick={() => setShowMobilePanel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <QuoteProgressPanel
                quoteState={quoteState}
                onGenerateExcel={handleGenerateExcel}
                isGenerating={isGenerating}
                onNewQuote={handleNewQuote}
              />
            </div>
          </div>
        )}
      </div>

      {/* Excel Preview Dialog */}
      <ExcelPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        quoteState={quoteState}
        onDownload={handleGenerateExcel}
        isGenerating={isGenerating}
      />
    </>
  )
}
