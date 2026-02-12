"use client"

import { cn } from "@/lib/utils"
import { Sparkles, User, CheckCircle2 } from "lucide-react"

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

const TOOL_LABELS: Record<string, string> = {
  setHeaderField: "Kopfdaten gesetzt",
  addLicensePosition: "Lizenz hinzugefuegt",
  addServicePosition: "Dienstleistung hinzugefuegt",
  addSolutionPosition: "Solution hinzugefuegt",
  addCustomerServicePosition: "Customer Service hinzugefuegt",
  setLegalTerms: "Konditionen gesetzt",
  getQuoteSummary: "Zusammenfassung",
  generateExcel: "Excel generiert",
}

function renderMarkdown(text: string) {
  // Simple markdown rendering: bold, lists, horizontal rules
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Horizontal rule
    if (line.trim() === "---") {
      elements.push(<hr key={i} className="my-3 border-border/50" />)
      continue
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />)
      continue
    }

    // List items (numbered or bullet)
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/)
    const bulletMatch = line.match(/^[-*]\s+(.+)/)

    if (numberedMatch) {
      line = numberedMatch[2]
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="shrink-0 text-muted-foreground">{numberedMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(line) }} />
        </div>
      )
      continue
    }

    if (bulletMatch) {
      line = bulletMatch[1]
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="shrink-0 text-muted-foreground">-</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(line) }} />
        </div>
      )
      continue
    }

    // Headings
    if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} className="font-semibold mt-1">
          {line.replace(/\*\*/g, "")}
        </p>
      )
      continue
    }

    // Regular text with bold
    elements.push(
      <p key={i} dangerouslySetInnerHTML={{ __html: boldify(line) }} />
    )
  }

  return elements
}

function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
      )}

      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser && "items-end")}>
        {/* Tool results badges */}
        {!isUser && message.toolResults && message.toolResults.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.toolResults.map((tr, i) => (
              <span
                key={`${tr.toolName}-${i}`}
                className="inline-flex items-center gap-1 rounded-md bg-secondary/10 px-2 py-0.5 text-xs text-secondary"
              >
                <CheckCircle2 className="h-3 w-3" />
                {TOOL_LABELS[tr.toolName] || tr.toolName}
              </span>
            ))}
          </div>
        )}

        {/* Message text */}
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.text}</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {renderMarkdown(message.text)}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
