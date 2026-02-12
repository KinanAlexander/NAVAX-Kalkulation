import { Text } from "@/components/ds"
import { OpenStarterInV0Button } from "@/components/open-in-v0-button"

const REGISTRY_URL = "https://v0-navax-design-system-guide.vercel.app"

const COMPONENTS = [
  { name: "heading", cat: "Typography" },
  { name: "text", cat: "Typography" },
  { name: "stack", cat: "Layout" },
  { name: "section", cat: "Layout" },
  { name: "divider", cat: "Layout" },
  { name: "icon-button", cat: "Primitives" },
  { name: "status-badge", cat: "Primitives" },
  { name: "navax-logo", cat: "Brand" },
  { name: "stat-card", cat: "Data Display" },
  { name: "avatar-group", cat: "Data Display" },
  { name: "progress-bar", cat: "Data Display" },
  { name: "timeline", cat: "Data Display" },
  { name: "alert-banner", cat: "Feedback" },
  { name: "empty-state", cat: "Feedback" },
  { name: "skeleton-card", cat: "Feedback" },
  { name: "navbar", cat: "Navigation" },
  { name: "breadcrumbs", cat: "Navigation" },
  { name: "tab-nav", cat: "Navigation" },
  { name: "page-header", cat: "Navigation" },
  { name: "app-header", cat: "Composite" },
  { name: "app-sidebar", cat: "Composite" },
  { name: "app-footer", cat: "Composite" },
  { name: "data-table", cat: "Data Display" },
  { name: "form-field", cat: "Forms" },
  { name: "search-input", cat: "Forms" },
  { name: "toggle-button-group", cat: "Forms" },
  { name: "file-upload", cat: "Forms" },
  { name: "pricing-card", cat: "Marketing" },
  { name: "testimonial-card", cat: "Marketing" },
  { name: "feature-card", cat: "Marketing" },
  { name: "command-menu", cat: "Interactive" },
  { name: "user-menu", cat: "Interactive" },
  { name: "stepper", cat: "Interactive" },
  { name: "kbd", cat: "Interactive" },
]

const CATEGORIES = [
  ...new Set(COMPONENTS.map((c) => c.cat)),
]

export function ShowcaseRegistryInfo() {
  return (
    <div className="flex flex-col gap-6">
      {/* Install instructions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-base font-semibold text-foreground mb-2">
          Install via CLI
        </p>
        <Text variant="small" className="mb-4">
          After deploying this project, install any component with a single
          command:
        </Text>
        <pre className="rounded-md bg-muted px-4 py-3 text-sm font-mono text-foreground overflow-x-auto">
          {`npx shadcn@latest add ${REGISTRY_URL}/r/stat-card.json`}
        </pre>
        <Text variant="caption" className="mt-3">
          Each component resolves its own dependencies automatically.
        </Text>
      </div>

      {/* Component index */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold text-foreground">
            {COMPONENTS.length} Components
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {cat}
              </p>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.filter((c) => c.cat === cat).map((c) => (
                  <span
                    key={c.name}
                    className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-mono text-foreground"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter template CTA */}
      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-6 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-primary">
          Start a new project with the design system
        </p>
        <Text variant="small" className="max-w-md">
          Opens a starter template in v0 with the header, footer, and brand
          tokens pre-configured. Add more components as you build.
        </Text>
        <OpenStarterInV0Button className="mt-1 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90" />
      </div>
    </div>
  )
}
