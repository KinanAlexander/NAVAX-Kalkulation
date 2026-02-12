"use client"

import * as React from "react"
import { ChatInput } from "./chat-input"
import { MessageBubble } from "./message-bubble"
import { QuoteProgressPanel } from "./quote-progress-panel"
import { Sparkles } from "lucide-react"
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
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Use a ref for quoteState so sendMessage always has the latest value
  const quoteStateRef = React.useRef(quoteState)
  React.useEffect(() => {
    quoteStateRef.current = quoteState
  }, [quoteState])

  // Same for messages
  const messagesRef = React.useRef(messages)
  React.useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
            const alreadyExists = next.licenses.some(
              (l) => l.product === pos.product && l.category === pos.category
            )
            if (!alreadyExists) {
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
            const alreadyExists = next.services.some((s) => s.description === pos.description)
            if (!alreadyExists) {
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
            const alreadyExists = next.solutions.some((s) => s.name === pos.name)
            if (!alreadyExists) {
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
            const alreadyExists = next.customerService.some((c) => c.package === pos.package)
            if (!alreadyExists) {
              next = {
                ...next,
                customerService: [
                  ...next.customerService,
                  {
                    id: `csv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    package: pos.package as string,
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
        console.log("[v0] Updated quoteState header:", JSON.stringify(next.header))
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
        // Use ref to get latest quoteState (avoids stale closure)
        const currentQuoteState = quoteStateRef.current

        console.log("[v0] Sending quoteState header:", JSON.stringify(currentQuoteState.header))

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: currentMessages.map((m) => ({
              role: m.role,
              parts: [{ type: "text", text: m.text }],
            })),
            quoteState: currentQuoteState,
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
          text: data.text || "Ich konnte die Eingabe nicht verarbeiten. Bitte versuche es nochmal.",
          toolResults: data.toolResults,
        }

        setMessages((prev) => [...prev, assistantMsg])

        // Apply tool results to update quote state
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
    const prefix = `[Hochgeladene Datei: ${file.name}]\n\n`
    sendMessage(prefix + text)
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
      toast.success("Excel erfolgreich generiert und heruntergeladen!")
    } catch {
      toast.error("Fehler bei der Excel-Generierung.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNewQuote = () => {
    setMessages([])
    setQuoteState(createEmptyQuoteState())
  }

  return (
    <div className="flex flex-1 gap-0 overflow-hidden">
      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground font-heading text-balance">
                  Neues Angebot erstellen
                </h2>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
                  Beschreibe dein Kundenmeeting in natuerlicher Sprache. Ich extrahiere alle
                  relevanten Informationen und erstelle die Angebotskalkulation fuer dich.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "Kunde Musterfirma GmbH moechte D365 Business Central mit 10 Essentials-Lizenzen, Cloud, Wien",
                  "CRM-Projekt fuer Bauunternehmen in Graz, 5 Sales Enterprise Lizenzen plus Schulung",
                  "EasyStarter Paket mit Power BI Workshop fuer Firma Alpentech in Linz",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => sendMessage(example)}
                    disabled={isLoading}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground text-left disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
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

        {/* Input */}
        <div className="border-t border-border bg-background p-4 lg:px-8">
          <ChatInput onSend={sendMessage} onFileUpload={handleFileUpload} disabled={isLoading} />
        </div>
      </div>

      {/* Progress panel - desktop only */}
      <div className="hidden w-80 shrink-0 border-l border-border bg-background p-4 lg:block overflow-y-auto">
        <QuoteProgressPanel
          quoteState={quoteState}
          onGenerateExcel={handleGenerateExcel}
          isGenerating={isGenerating}
          onNewQuote={handleNewQuote}
        />
      </div>
    </div>
  )
}
