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
  setHeaderField: "Kopfdaten",
  addLicensePosition: "Lizenz",
  addServicePosition: "Dienstleistung",
  addSolutionPosition: "Solution",
  addCustomerServicePosition: "Customer Service",
  setLegalTerms: "Konditionen",
  getQuoteSummary: "Zusammenfassung",
  generateExcel: "Excel",
}

function renderMarkdown(text: string) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    if (line.trim() === "---") {
      elements.push(
        <hr key={i} className="my-3 border-border/40" />
      )
      continue
    }

    if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />)
      continue
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/)
    const bulletMatch = line.match(/^[-*]\s+(.+)/)

    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="shrink-0 text-muted-foreground font-mono text-[11px] pt-px">
            {numberedMatch[1]}.
          </span>
          <span
            className="flex-1"
            dangerouslySetInnerHTML={{ __html: boldify(numberedMatch[2]) }}
          />
        </div>
      )
      continue
    }

    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary/60" />
          <span
            className="flex-1"
            dangerouslySetInnerHTML={{ __html: boldify(bulletMatch[1]) }}
          />
        </div>
      )
      continue
    }

    if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} className="font-semibold text-foreground mt-2 first:mt-0">
          {line.replace(/\*\*/g, "")}
        </p>
      )
      continue
    }

    elements.push(
      <p key={i} dangerouslySetInnerHTML={{ __html: boldify(line) }} />
    )
  }

  return elements
}

function boldify(text: string): string {
  return text.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-semibold text-foreground">$1</strong>'
  )
}

// Deduplicate tool badges by name
function deduplicateTools(
  tools: ChatMessage["toolResults"]
): { name: string; count: number }[] {
  if (!tools) return []
  const map = new Map<string, number>()
  for (const t of tools) {
    map.set(t.toolName, (map.get(t.toolName) || 0) + 1)
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const toolGroups = deduplicateTools(message.toolResults)

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isUser && "justify-end"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 text-primary-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}

      <div className={cn("flex max-w-[80%] flex-col gap-2", isUser && "items-end")}>
        {/* Tool badges */}
        {!isUser && toolGroups.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {toolGroups.map((tg) => (
              <span
                key={tg.name}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-medium text-secondary ring-1 ring-secondary/20"
              >
                <CheckCircle2 className="h-3 w-3" />
                {TOOL_LABELS[tg.name] || tg.name}
                {tg.count > 1 && (
                  <span className="ml-0.5 rounded-full bg-secondary/20 px-1.5 text-[10px] font-bold">
                    {tg.count}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Message */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground ring-1 ring-border"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.text}</p>
          ) : (
            <div className="flex flex-col gap-0.5">{renderMarkdown(message.text)}</div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  )
}
