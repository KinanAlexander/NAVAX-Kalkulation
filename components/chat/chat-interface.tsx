"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ChatInput } from "./chat-input"
import { MessageBubble } from "./message-bubble"
import { QuoteProgressPanel } from "./quote-progress-panel"
import { WelcomeScreen } from "./welcome-screen"
import { ExcelPreviewDialog } from "./excel-preview-dialog"
import { Download, PanelRightOpen, X, Eye, Mail, Mic } from "lucide-react"
import { composeSalesEmail } from "@/lib/email/compose-sales-email"
import { VoiceAgentOverlay } from "@/components/voice/voice-agent-overlay"
import { Button } from "@/components/ui/button"
import { createEmptyQuoteState } from "@/lib/store/quote-store"
import type { QuoteState } from "@/lib/store/types"
import { useMode } from "@/lib/store/mode-context"
import { toast } from "sonner"

// ---- shared message type for demo mode ----
interface DemoChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  toolResults?: Array<{
    toolName: string
    args: Record<string, unknown>
    result: Record<string, unknown>
  }>
}

// ---- Helper: extract text from UIMessage parts ----
function getUIMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function ChatInterface() {
  const { mode } = useMode()

  // ---- Shared state ----
  const [quoteState, setQuoteState] = React.useState<QuoteState>(createEmptyQuoteState)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [showMobilePanel, setShowMobilePanel] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  const [showVoiceAgent, setShowVoiceAgent] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // ---- Demo mode state ----
  const [demoMessages, setDemoMessages] = React.useState<DemoChatMessage[]>([])
  const [demoLoading, setDemoLoading] = React.useState(false)

  // ---- Live mode: AI SDK useChat ----
  const liveTransport = React.useMemo(
    () => new DefaultChatTransport({ api: "/api/chat/live" }),
    []
  )
  const {
    messages: liveMessages,
    sendMessage: liveSendMessage,
    status: liveStatus,
    setMessages: setLiveMessages,
  } = useChat({ transport: liveTransport })

  const liveIsLoading = liveStatus === "streaming" || liveStatus === "submitted"

  // ---- Refs for demo mode ----
  const quoteStateRef = React.useRef(quoteState)
  React.useEffect(() => {
    quoteStateRef.current = quoteState
  }, [quoteState])

  // ---- Excel download trigger (used by generateExcel tool) ----
  const triggerExcelDownload = React.useCallback(async () => {
    setIsGenerating(true)
    try {
      const currentState = quoteStateRef.current
      const res = await fetch("/api/generate-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteState: currentState }),
      })
      if (!res.ok) throw new Error("Excel-Generierung fehlgeschlagen")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Angebotskalkulation_${currentState.header.unternehmensname || "Entwurf"}_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setQuoteState((prev) => ({ ...prev, status: "generated" }))
      toast.success("Excel erfolgreich generiert!")
    } catch {
      toast.error("Fehler bei der Excel-Generierung.")
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const demoMessagesRef = React.useRef(demoMessages)
  React.useEffect(() => {
    demoMessagesRef.current = demoMessages
  }, [demoMessages])

  // ---- Live mode: extract tool results from UIMessage parts ----
  const processedToolIdsRef = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    if (mode !== "live") return
    for (const msg of liveMessages) {
      if (msg.role !== "assistant" || !msg.parts) continue
      for (const part of msg.parts) {
        if (
          part.type === "tool-invocation" &&
          "toolInvocation" in part &&
          (part as Record<string, unknown>).toolInvocation
        ) {
          const inv = (part as Record<string, unknown>).toolInvocation as {
            toolName: string
            toolCallId?: string
            args: Record<string, unknown>
            state: string
            output?: Record<string, unknown>
          }
          if (inv.state === "output-available" && inv.output) {
            const uniqueId = inv.toolCallId || `${msg.id}_${inv.toolName}_${JSON.stringify(inv.args)}`
            if (!processedToolIdsRef.current.has(uniqueId)) {
              processedToolIdsRef.current.add(uniqueId)
              applyToolResult(inv.toolName, inv.args, inv.output)
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMessages, mode])

  // ---- Scroll to bottom ----
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [demoMessages, liveMessages])

  // ---- Computed ----
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

  // ---- Apply a single tool result to quoteState ----
  // Track pending excel generation separately (side effects should not be inside state setters)
  const pendingExcelRef = React.useRef(false)

  const applyToolResult = React.useCallback(
    (toolName: string, args: Record<string, unknown>, result: Record<string, unknown>) => {
      if (!result.success) return

      // Handle generateExcel separately as a side effect (not inside state setter)
      if (toolName === "generateExcel") {
        pendingExcelRef.current = true
        return
      }

      setQuoteState((prev) => {
        let next = { ...prev }

        if (toolName === "setHeaderField") {
          const field = (args.field || result.field) as string
          const value = (args.value || result.value) as string
          next = {
            ...next,
            header: { ...next.header, [field]: value },
            customerName: field === "unternehmensname" ? value : next.customerName,
            title: field === "angebotstitel" ? value : next.title,
          }
        }

        if (toolName === "addLicensePosition") {
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

        if (toolName === "addServicePosition") {
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

        if (toolName === "addSolutionPosition") {
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

        if (toolName === "addCustomerServicePosition") {
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

        if (toolName === "setLegalTerms") {
          next = {
            ...next,
            legalTerms: {
              nachlassLizenzenMs: (args.nachlassLizenzenMs as number) || 0,
              nachlassLizenzenNavax: (args.nachlassLizenzenNavax as number) || 0,
              nachlassDl: (args.nachlassDl as number) || 0,
              zahlungsfrist: (args.zahlungsfrist as string) || "30 Tage",
            },
          }
        }

        next.updatedAt = new Date().toISOString()
        return next
      })
    },
    []
  )

  // Watch for pending Excel generation and trigger after state settles
  React.useEffect(() => {
    if (pendingExcelRef.current && !liveIsLoading) {
      pendingExcelRef.current = false
      // Give state time to settle, then trigger download
      const timer = setTimeout(() => {
        triggerExcelDownload()
      }, 800)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveIsLoading, liveMessages])

  // ---- Apply batch tool results (demo mode) ----
  const applyToolResults = React.useCallback(
    (toolResults: DemoChatMessage["toolResults"]) => {
      if (!toolResults || toolResults.length === 0) return
      for (const tr of toolResults) {
        applyToolResult(tr.toolName, tr.args, tr.result)
      }
    },
    [applyToolResult]
  )

  // ---- Send message (unified) ----
  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!text.trim()) return

      if (mode === "live") {
        liveSendMessage({ text: text.trim() })
        return
      }

      // Demo mode
      if (demoLoading) return
      const userMsg: DemoChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user",
        text: text.trim(),
      }
      const currentMessages = [...demoMessagesRef.current, userMsg]
      setDemoMessages(currentMessages)
      setDemoLoading(true)

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
        const assistantMsg: DemoChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          text: data.text || "Ich konnte die Eingabe nicht verarbeiten.",
          toolResults: data.toolResults,
        }
        setDemoMessages((prev) => [...prev, assistantMsg])
        if (data.toolResults?.length > 0) {
          applyToolResults(data.toolResults)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unbekannter Fehler"
        toast.error(`Fehler: ${errorMsg}`)
        setDemoMessages((prev) => [
          ...prev,
          { id: `msg_${Date.now()}_error`, role: "assistant", text: `Fehler: ${errorMsg}` },
        ])
      } finally {
        setDemoLoading(false)
      }
    },
    [mode, demoLoading, liveSendMessage, applyToolResults]
  )

  // ---- Handlers ----
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
    setDemoMessages([])
    setLiveMessages([])
    setQuoteState(createEmptyQuoteState())
    setShowMobilePanel(false)
    setShowPreview(false)
    processedToolIdsRef.current.clear()
    pendingExcelRef.current = false
  }

  const handleVoiceSend = React.useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage(text.trim())
      }
    },
    [sendMessage]
  )

  const handleSendToSales = () => {
    const mailtoUrl = composeSalesEmail(quoteState)
    window.open(mailtoUrl, "_blank")
    setQuoteState((prev) => ({ ...prev, status: "sent" }))
    toast.success("E-Mail an Sales-Support wird geoeffnet.")
  }

  // ---- Determine which messages to render ----
  const isLoading = mode === "live" ? liveIsLoading : demoLoading
  const isWelcome = mode === "live" ? liveMessages.length === 0 : demoMessages.length === 0

  // ---- Render message list ----
  const renderMessages = () => {
    if (mode === "live") {
      return liveMessages.map((msg) => {
        const text = getUIMessageText(msg)
        // Count tool invocations
        const toolParts = msg.parts?.filter((p) => p.type === "tool-invocation") || []
        return (
          <MessageBubble
            key={msg.id}
            message={{
              id: msg.id,
              role: msg.role as "user" | "assistant",
              text,
              toolResults: toolParts.map((p) => {
                const inv = (p as Record<string, unknown>).toolInvocation as {
                  toolName: string
                  args: Record<string, unknown>
                  output?: Record<string, unknown>
                } | undefined
                return {
                  toolName: inv?.toolName || "unknown",
                  args: inv?.args || {},
                  result: inv?.output || {},
                }
              }),
            }}
          />
        )
      })
    }

    return demoMessages.map((msg) => (
      <MessageBubble key={msg.id} message={msg} />
    ))
  }

  return (
    <>
      <div className="flex flex-1 min-h-0 gap-0 overflow-hidden relative">
        {/* Chat area */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {/* Messages or Welcome */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            {isWelcome ? (
              <WelcomeScreen
                onSelectAction={sendMessage}
                onStartVoiceAgent={() => setShowVoiceAgent(true)}
                disabled={isLoading}
              />
            ) : (
              <div className="flex flex-col gap-5 px-4 py-6 lg:px-8">
                {renderMessages()}
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate font-heading">
                    {quoteState.header.angebotstitel || "Angebot"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {totalPositions} Positionen -- {quoteState.header.unternehmensname}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowMobilePanel(true)}
                  >
                    <PanelRightOpen className="h-4 w-4 mr-1.5" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-1.5" />
                    Vorschau
                  </Button>
                  <Button size="sm" onClick={handleGenerateExcel} disabled={isGenerating}>
                    <Download className="h-4 w-4 mr-1.5" />
                    {isGenerating ? "..." : "Excel"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleSendToSales}>
                    <Mail className="h-4 w-4 mr-1.5" />
                    Sales
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-4 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <ChatInput onSend={sendMessage} onFileUpload={handleFileUpload} disabled={isLoading} />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setShowVoiceAgent(true)}
                aria-label="Voice Agent starten"
                title="Voice Agent"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress panel - desktop */}
        <div className="hidden w-80 shrink-0 border-l border-border bg-card/50 lg:flex lg:flex-col overflow-y-auto scrollbar-thin p-4">
          <QuoteProgressPanel
            quoteState={quoteState}
            onGenerateExcel={handleGenerateExcel}
            isGenerating={isGenerating}
            onNewQuote={handleNewQuote}
            onSendToSales={handleSendToSales}
          />
        </div>

        {/* Progress panel - mobile overlay */}
        {showMobilePanel && (
          <div className="absolute inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowMobilePanel(false)} />
            <div className="relative ml-auto w-80 max-w-[85vw] bg-card border-l border-border p-4 overflow-y-auto shadow-xl animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground font-heading">Angebotsdetails</span>
                <Button variant="ghost" size="icon" onClick={() => setShowMobilePanel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <QuoteProgressPanel
                quoteState={quoteState}
                onGenerateExcel={handleGenerateExcel}
                isGenerating={isGenerating}
                onNewQuote={handleNewQuote}
                onSendToSales={handleSendToSales}
              />
            </div>
          </div>
        )}
      </div>

      {/* Voice Agent Overlay */}
      <VoiceAgentOverlay
        open={showVoiceAgent}
        onClose={() => setShowVoiceAgent(false)}
        onSendMessage={handleVoiceSend}
      />

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
