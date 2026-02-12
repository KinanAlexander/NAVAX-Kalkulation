"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import { ChatInput } from "./chat-input"
import { MessageBubble } from "./message-bubble"
import { QuoteProgressPanel } from "./quote-progress-panel"
import { Sparkles } from "lucide-react"
import { createEmptyQuoteState } from "@/lib/store/quote-store"
import type { QuoteState } from "@/lib/store/types"
import { toast } from "sonner"

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
  const quoteStateRef = React.useRef(quoteState)

  // Keep ref in sync
  React.useEffect(() => {
    quoteStateRef.current = quoteState
  }, [quoteState])

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            id,
            messages,
            quoteState: quoteStateRef.current,
          },
        }),
      }),
    []
  )

  const { messages, sendMessage, status } = useChat({
    transport,
    onFinish(event) {
      console.log("[v0] onFinish event:", JSON.stringify(event, null, 2))
      // Process tool calls from the finished message to update quote state
      if (event.message?.parts) {
        for (const part of event.message.parts) {
          if (part.type === "tool-invocation" && part.state === "output-available") {
            const toolName = part.toolInvocation.toolName
            const args = part.toolInvocation.args
            const result = part.toolInvocation.output

            console.log("[v0] Processing tool result:", toolName, args, result)

            if (toolName === "setHeaderField" && result?.success) {
              setQuoteState((prev) => ({
                ...prev,
                header: {
                  ...prev.header,
                  [args.field as string]: args.value as string,
                },
                customerName:
                  args.field === "unternehmensname"
                    ? (args.value as string)
                    : prev.customerName,
                title:
                  args.field === "angebotstitel"
                    ? (args.value as string)
                    : prev.title,
                updatedAt: new Date().toISOString(),
              }))
            }

            if (toolName === "addLicensePosition" && result?.success) {
              setQuoteState((prev) => ({
                ...prev,
                licenses: [
                  ...prev.licenses,
                  {
                    id: `lic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    category: args.category as string,
                    product: args.product as string,
                    quantity: args.quantity as number,
                    unitPrice: args.unitPrice as number,
                    discount: (args.discount as number) || 0,
                    total: result.position?.total ?? 0,
                    optional: (args.optional as boolean) || false,
                    articleNr: "",
                  },
                ],
                updatedAt: new Date().toISOString(),
              }))
            }

            if (toolName === "addServicePosition" && result?.success) {
              setQuoteState((prev) => ({
                ...prev,
                services: [
                  ...prev.services,
                  {
                    id: `svc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    category: args.category as string,
                    description: args.description as string,
                    unit: args.unit as "LT" | "STD",
                    quantity: args.quantity as number,
                    rate: args.rate as number,
                    discount: (args.discount as number) || 0,
                    total: result.position?.total ?? 0,
                    optional: (args.optional as boolean) || false,
                  },
                ],
                updatedAt: new Date().toISOString(),
              }))
            }

            if (toolName === "addSolutionPosition" && result?.success) {
              setQuoteState((prev) => ({
                ...prev,
                solutions: [
                  ...prev.solutions,
                  {
                    id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    name: args.name as string,
                    priceCategory: args.priceCategory as 1 | 2 | 3 | 4,
                    flatRate: result.position?.flatRate ?? 0,
                    additionalDl: (args.additionalDl as number) || 0,
                    articleNr: "",
                  },
                ],
                updatedAt: new Date().toISOString(),
              }))
            }

            if (toolName === "addCustomerServicePosition" && result?.success) {
              setQuoteState((prev) => ({
                ...prev,
                customerService: [
                  ...prev.customerService,
                  {
                    id: `csv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    package: args.package as string,
                    description: args.description as string,
                    monthlyFee: args.monthlyFee as number,
                    quantity: (args.quantity as number) || 1,
                  },
                ],
                updatedAt: new Date().toISOString(),
              }))
            }

            if (toolName === "setLegalTerms" && result?.success) {
              setQuoteState((prev) => ({
                ...prev,
                legalTerms: {
                  nachlassLizenzenMs: (args.nachlassLizenzenMs as number) || 0,
                  nachlassLizenzenNavax: (args.nachlassLizenzenNavax as number) || 0,
                  nachlassDl: (args.nachlassDl as number) || 0,
                  zahlungsfrist: (args.zahlungsfrist as string) || "30 Tage",
                },
                updatedAt: new Date().toISOString(),
              }))
            }

            if (toolName === "generateExcel" && result?.success) {
              handleGenerateExcel()
            }
          }
        }
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
    console.log("[v0] Sending message:", text)
    sendMessage({ text })
  }

  const handleFileUpload = async (file: File) => {
    const text = await file.text()
    const prefix = `[Hochgeladene Datei: ${file.name}]\n\n`
    sendMessage({ text: prefix + text })
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
                const hasToolParts = message.parts?.some(
                  (p) => p.type === "tool-invocation"
                )
                if (!text && !hasToolParts) return null
                return (
                  <MessageBubble key={message.id} message={message} />
                )
              })}
              {isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
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
