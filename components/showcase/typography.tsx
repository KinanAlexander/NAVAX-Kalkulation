import { Heading, Text } from "@/components/ds"

export function ShowcaseTypography() {
  return (
    <div className="flex flex-col gap-8">
      {/* Headings */}
      <div className="flex flex-col gap-4">
        <Heading level={1}>Heading Level 1 — DM Sans Semibold</Heading>
        <Heading level={2}>Heading Level 2 — DM Sans Semibold</Heading>
        <Heading level={3}>Heading Level 3 — DM Sans Semibold</Heading>
        <Heading level={4}>Heading Level 4 — DM Sans Semibold</Heading>
      </div>

      {/* Body variants */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <Text variant="lead">
          Lead paragraph. Used for introductions and hero descriptions. Slightly
          larger and muted for visual hierarchy.
        </Text>
        <Text variant="body">
          Body text. The default for all content. Set in Inter at 16px with
          relaxed line-height for comfortable reading across long passages.
        </Text>
        <Text variant="small">
          Small text. Used for captions, metadata, and secondary information.
        </Text>
        <Text variant="caption">
          Caption text. Used for the smallest annotations and helper text.
        </Text>
        <div>
          <Text as="span" variant="body">
            {"Inline code: "}
          </Text>
          <Text as="span" variant="code">
            {"const brand = '#79217a'"}
          </Text>
        </div>
      </div>

      {/* Font specimens */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Sans — Inter
          </p>
          <p className="font-sans text-2xl text-foreground">
            Aa Bb Cc 123
          </p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Heading — DM Sans
          </p>
          <p className="font-heading text-2xl font-semibold text-foreground">
            Aa Bb Cc 123
          </p>
        </div>
        <div className="rounded-lg border border-border p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Mono — JetBrains Mono
          </p>
          <p className="font-mono text-2xl text-foreground">
            Aa Bb Cc 123
          </p>
        </div>
      </div>
    </div>
  )
}
