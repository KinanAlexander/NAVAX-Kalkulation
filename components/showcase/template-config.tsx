"use client"

import { useState } from "react"
import { Check, Copy, Info, ExternalLink, Terminal, FileCode2 } from "lucide-react"
import { Text } from "@/components/ds"
import { Switch } from "@/components/ui/switch"
import { OpenStarterInV0Button } from "@/components/open-in-v0-button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const REGISTRY_URL = "https://v0-navax-design-system-guide.vercel.app"

const COMPONENT_NAMES = [
  "heading", "text", "stack", "section", "divider", "icon-button",
  "status-badge", "navax-logo", "stat-card", "avatar-group", "progress-bar",
  "timeline", "alert-banner", "empty-state", "skeleton-card", "navbar",
  "breadcrumbs", "tab-nav", "page-header", "app-header", "app-sidebar",
  "app-footer", "data-table", "form-field", "search-input",
  "toggle-button-group", "file-upload", "pricing-card", "testimonial-card",
  "feature-card", "command-menu", "user-menu", "stepper", "kbd",
]

const V0_RULES_TEXT = `Always use the NAVAX design system when building UI.

Registry URL: ${REGISTRY_URL}/r

Install components with:
npx shadcn@latest add ${REGISTRY_URL}/r/<component-name>.json

Import from @/components/ds/<component-name>

Available components: ${COMPONENT_NAMES.join(", ")}

Use NAVAX design system components instead of custom implementations.
Always use the NAVAX brand tokens defined in globals.css (primary = magenta, secondary = teal).`

const MCP_CONFIG = `{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@canary", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "${REGISTRY_URL}/r/registry.json"
      }
    }
  }
}`

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={label || "Copy to clipboard"}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-6 ${className || ""}`}>
      {children}
    </div>
  )
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
      {n}
    </span>
  )
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="relative rounded-md bg-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <pre className="flex-1 whitespace-pre-wrap break-words text-xs font-mono text-foreground leading-relaxed overflow-x-auto">
          {code}
        </pre>
        <div className="shrink-0">
          <CopyButton text={code} label={label} />
        </div>
      </div>
    </div>
  )
}

export function ShowcaseTemplateConfig() {
  return (
    <div className="flex flex-col gap-8">

      {/* Quick Start */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Terminal className="h-5 w-5 text-primary" />
          <p className="text-lg font-semibold text-foreground">
            Quick Start
          </p>
        </div>
        <Text variant="small" className="mb-6">
          Open the starter template in v0 to get a project with the NAVAX
          header, footer, brand tokens, and fonts already configured.
          Then add more components from the registry as you build.
        </Text>

        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 flex flex-col items-center gap-4 text-center">
          <OpenStarterInV0Button />
          <Text variant="caption" className="max-w-md">
            Creates a new v0 project with the NAVAX app shell.
            All {COMPONENT_NAMES.length} components are available to add on demand.
          </Text>
        </div>
      </div>

      {/* v0 Template Setup */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <FileCode2 className="h-5 w-5 text-primary" />
          <p className="text-lg font-semibold text-foreground">
            v0 Template Setup
          </p>
        </div>
        <Text variant="small" className="mb-6">
          Create a reusable v0 template so every new project starts with
          the design system. Go to{" "}
          <strong>Settings &rarr; Templates &rarr; Create Template</strong>.
        </Text>

        <div className="flex flex-col gap-4">
          {/* NPM Packages */}
          <SectionCard>
            <div className="flex items-center gap-3 mb-4">
              <StepNumber n={1} />
              <p className="text-sm font-semibold text-foreground">
                NPM Packages
              </p>
              <InfoTooltip text="Leave empty. The design system uses a shadcn registry -- components are installed via CLI, not from npm." />
            </div>
            <div className="ml-9 rounded-md border border-border bg-muted/50 px-4 py-3">
              <p className="text-sm text-muted-foreground italic">
                Leave empty -- no npm package required
              </p>
            </div>
            <Text variant="caption" className="mt-2 ml-9">
              Components are distributed via the shadcn registry and
              installed individually with{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">
                npx shadcn@latest add
              </code>.
            </Text>
          </SectionCard>

          {/* Environment Variables */}
          <SectionCard>
            <div className="flex items-center gap-3 mb-4">
              <StepNumber n={2} />
              <p className="text-sm font-semibold text-foreground">
                Environment Variables
              </p>
              <InfoTooltip text="No secrets needed. The registry is publicly accessible." />
            </div>
            <div className="ml-9 rounded-md border border-border bg-muted/50 px-4 py-3">
              <p className="text-sm text-muted-foreground italic">
                None required
              </p>
            </div>
          </SectionCard>

          {/* Tech Stack */}
          <SectionCard>
            <div className="flex items-center gap-3 mb-4">
              <StepNumber n={3} />
              <p className="text-sm font-semibold text-foreground">
                Tech Stack
              </p>
              <InfoTooltip text="Enable both toggles. The design system builds on Tailwind CSS and extends shadcn/ui." />
            </div>
            <div className="ml-9 flex flex-col rounded-md border border-border overflow-hidden">
              <div className="flex items-center justify-between bg-muted/50 px-4 py-3 border-b border-border">
                <span className="text-sm font-medium text-foreground">
                  Tailwind CSS
                </span>
                <Switch checked disabled aria-label="Tailwind CSS enabled" />
              </div>
              <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium text-foreground">
                  shadcn/ui
                </span>
                <Switch checked disabled aria-label="shadcn/ui enabled" />
              </div>
            </div>
            <Text variant="caption" className="mt-2 ml-9">
              Enable both toggles, then click Create.
            </Text>
          </SectionCard>

          {/* v0 Rules */}
          <SectionCard>
            <div className="flex items-center gap-3 mb-4">
              <StepNumber n={4} />
              <p className="text-sm font-semibold text-foreground">
                Add v0 Rules
              </p>
            </div>
            <Text variant="small" className="mb-4 ml-9">
              Open the sidebar in v0 and click <strong>Rules</strong>.
              Paste the following so v0 always uses the design system:
            </Text>
            <div className="ml-9">
              <CodeBlock code={V0_RULES_TEXT} label="Copy v0 rules" />
            </div>
          </SectionCard>
        </div>
      </div>

      {/* MCP for AI editors */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-1">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <p className="text-base font-semibold text-foreground">
            AI Code Editors (Cursor, Windsurf)
          </p>
        </div>
        <Text variant="small" className="mb-4 ml-7">
          Add this MCP configuration to use the registry with Cursor,
          Windsurf, or other AI editors.
        </Text>
        <div className="ml-7">
          <CodeBlock code={MCP_CONFIG} label="Copy MCP config" />
        </div>
      </SectionCard>
    </div>
  )
}
