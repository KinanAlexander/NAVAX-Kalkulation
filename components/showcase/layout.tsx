import { Stack, Divider } from "@/components/ds"

export function ShowcaseLayout() {
  return (
    <div className="flex flex-col gap-8">
      {/* Stack */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">
          Stack — Vertical
        </p>
        <div className="rounded-lg border border-border p-6">
          <Stack gap="sm">
            <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary">
              Item 1
            </div>
            <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary">
              Item 2
            </div>
            <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary">
              Item 3
            </div>
          </Stack>
        </div>
      </div>

      {/* Horizontal stack */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">
          Stack — Horizontal
        </p>
        <div className="rounded-lg border border-border p-6">
          <Stack direction="horizontal" gap="sm" align="center">
            <div className="rounded-md bg-secondary border border-border px-4 py-3 text-sm text-secondary-foreground">
              Left
            </div>
            <div className="rounded-md bg-secondary border border-border px-4 py-3 text-sm text-secondary-foreground">
              Center
            </div>
            <div className="rounded-md bg-secondary border border-border px-4 py-3 text-sm text-secondary-foreground">
              Right
            </div>
          </Stack>
        </div>
      </div>

      {/* Dividers */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">
          Divider Variants
        </p>
        <div className="rounded-lg border border-border p-6 flex flex-col gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Plain</p>
            <Divider />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">With Label</p>
            <Divider label="or continue with" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Vertical (in row)</p>
            <div className="flex items-center gap-4 h-10">
              <span className="text-sm text-foreground">Left</span>
              <Divider orientation="vertical" />
              <span className="text-sm text-foreground">Right</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
