"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import { cn } from "@/lib/utils"
import { ChatInput } from "./chat-input"
import { MessageBubble } from "./message-bubble"
import { QuoteProgressPanel } from "./quote-progress-panel"
import { Bot, Sparkles } from "lucide-react"
import { createEmptyQuoteState } from "@/lib/store/quote-store"
import type { QuoteState } from "@/lib/store/types"
import { toast } from "sonner"

const transport = new DefaultChatTransport({ api: "/api/chat" })

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function ChatInterface() {
  const [quoteState, setQuoteState] = React.useState<QuoteState>(createEmptyQuoteState)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport,
    onToolCall({ toolCall }) {
      if (toolCall.dynamic) return

      // Process tool results to update quote state
      const name = toolCall.toolName as string
      const input = toolCall.input as Record<string, unknown>

      if (name === "setHeaderField") {
        setQuoteState((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            [input.field as string]: input.value as string,
          },
          customerName:
            input.field === "unternehmensname"
              ? (input.value as string)
              : prev.customerName,
          title:
            input.field === "angebotstitel"
              ? (input.value as string)
              : prev.title,
          updatedAt: new Date().toISOString(),
        }))
      }

      if (name === "addLicensePosition") {
        setQuoteState((prev) => ({
          ...prev,
          licenses: [
            ...prev.licenses,
            {
              id: `lic_${Date.now()}`,
              category: input.category as string,
              product: input.product as string,
              quantity: input.quantity as number,
              unitPrice: input.unitPrice as number,
              discount: (input.discount as number) || 0,
              total:
                (input.quantity as number) *
                (input.unitPrice as number) *
                (1 - ((input.discount as number) || 0) / 100),
              optional: (input.optional as boolean) || false,
              articleNr: "",
            },
          ],
          updatedAt: new Date().toISOString(),
        }))
      }

      if (name === "addServicePosition") {
        setQuoteState((prev) => ({
          ...prev,
          services: [
            ...prev.services,
            {
              id: `svc_${Date.now()}`,
              category: input.category as string,
              description: input.description as string,
              unit: input.unit as "LT" | "STD",
              quantity: input.quantity as number,
              rate: input.rate as number,
              discount: (input.discount as number) || 0,
              total:
                (input.quantity as number) *
                (input.rate as number) *
                (1 - ((input.discount as number) || 0) / 100),
              optional: (input.optional as boolean) || false,
            },
          ],
          updatedAt: new Date().toISOString(),
        }))
      }

      if (name === "addSolutionPosition") {
        const prices: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
        setQuoteState((prev) => ({
          ...prev,
          solutions: [
            ...prev.solutions,
            {
              id: `sol_${Date.now()}`,
              name: input.name as string,
              priceCategory: input.priceCategory as 1 | 2 | 3 | 4,
              flatRate: prices[(input.priceCategory as number) || 1] || 0,
              additionalDl: (input.additionalDl as number) || 0,
              articleNr: "",
            },
          ],
          updatedAt: new Date().toISOString(),
        }))
      }

      if (name === "addCustomerServicePosition") {
        setQuoteState((prev) => ({
          ...prev,
          customerService: [
            ...prev.customerService,
            {
              id: `csv_${Date.now()}`,
              package: input.package as string,
              description: input.description as string,
              monthlyFee: input.monthlyFee as number,
              quantity: (input.quantity as number) || 1,
            },
          ],
          updatedAt: new Date().toISOString(),
        }))
      }

      if (name === "setLegalTerms") {
        setQuoteState((prev) => ({
          ...prev,
          legalTerms: {
            nachlassLizenzenMs: (input.nachlassLizenzenMs as number) || 0,
            nachlassLizenzenNavax: (input.nachlassLizenzenNavax as number) || 0,
            nachlassDl: (input.nachlassDl as number) || 0,
            zahlungsfrist: (input.zahlungsfrist as string) || "30 Tage",
          },
          updatedAt: new Date().toISOString(),
        }))
      }

      if (name === "generateExcel") {
        handleGenerateExcel()
      }
    },
  })

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (text: string) => {
    sendMessage({ text }, { body: { quoteState } })
  }

  const handleFileUpload = async (file: File) => {
    const text = await file.text()
    const prefix = `[Hochgeladene Datei: ${file.name}]\n\n`
    sendMessage({ text: prefix + text }, { body: { quoteState } })
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
      toast.error("Fehler bei der Excel-Generierung. Bitte versuche es erneut.")
    } finally {
      setIsGenerating(false)
    }
  }

  const isStreaming = status === "streaming" || status === "submitted"

  return (
    <div className="flex flex-1 gap-0 overflow-hidden">
      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
        >
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
                  Beschreibe dein Kundenmeeting in natuerlicher Sprache. Ich
                  extrahiere alle relevanten Informationen und erstelle die
                  Angebotskalkulation fuer dich.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "Neuer Kunde moechte D365 BC mit 10 Essentials-Lizenzen...",
                  "CRM-Projekt fuer Bauunternehmen in Wien...",
                  "EasyStarter Paket mit Power BI Integration...",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => handleSend(example)}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground text-left"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const text = getUIMessageText(message)
                const hasParts = message.parts?.some(
                  (p) =>
                    p.type !== "text" &&
                    typeof p === "object" &&
                    "type" in p
                )
                if (!text && !hasParts) return null
                return (
                  <MessageBubble key={message.id} message={message} />
                )
              })}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Bot className="h-4 w-4" />
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
          <ChatInput
            onSend={handleSend}
            onFileUpload={handleFileUpload}
            disabled={isStreaming}
          />
        </div>
      </div>

      {/* Progress panel - desktop only */}
      <div className="hidden w-80 shrink-0 border-l border-border bg-background p-4 lg:block overflow-y-auto">
        <QuoteProgressPanel
          quoteState={quoteState}
          onGenerateExcel={handleGenerateExcel}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  )
}
