"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { UIMessage } from "ai"
import { Bot, User, Wrench, Check } from "lucide-react"

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

interface MessageBubbleProps {
  message: UIMessage
  className?: string
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const text = getUIMessageText(message)

  // Collect tool invocation parts (AI SDK 6 format)
  const toolParts = message.parts?.filter(
    (p) => p.type === "tool-invocation"
  ) ?? []

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {text && (
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            <div className="whitespace-pre-wrap">{text}</div>
          </div>
        )}

        {toolParts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {toolParts.map((part, idx) => {
              if (part.type !== "tool-invocation") return null
              const { toolInvocation } = part
              const toolName = toolInvocation.toolName
              const state = part.state

              // Friendly German labels for tool names
              const toolLabels: Record<string, string> = {
                setHeaderField: "Kopfdaten aktualisiert",
                addLicensePosition: "Lizenzposition hinzugefuegt",
                addServicePosition: "Dienstleistung hinzugefuegt",
                addSolutionPosition: "NAVAX Solution hinzugefuegt",
                addCustomerServicePosition: "Customer Service hinzugefuegt",
                setLegalTerms: "Konditionen gesetzt",
                getQuoteSummary: "Zusammenfassung",
                generateExcel: "Excel generiert",
              }

              const label = toolLabels[toolName] || toolName

              if (state === "output-available") {
                const output = toolInvocation.output as Record<string, unknown> | undefined
                const msg = output?.message as string | undefined

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs text-foreground"
                  >
                    <Check className="h-3 w-3 shrink-0 text-secondary" />
                    <span>{msg || label}</span>
                  </div>
                )
              }

              if (state === "input-available" || state === "input-streaming") {
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
                  >
                    <Wrench className="h-3 w-3 shrink-0 animate-spin" />
                    <span>{label}...</span>
                  </div>
                )
              }

              return null
            })}
          </div>
        )}
      </div>
    </div>
  )
}
