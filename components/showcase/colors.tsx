function Swatch({
  name,
  className,
  textClassName,
  value,
}: {
  name: string
  className: string
  textClassName: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-20 w-full rounded-lg border border-border ${className}`}
      />
      <div>
        <p className={`text-sm font-medium ${textClassName}`}>{name}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

export function ShowcaseColors() {
  return (
    <div className="flex flex-col gap-8">
      {/* Core palette */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Core NAVAX Palette</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <Swatch
            name="Magenta"
            className="bg-primary"
            textClassName="text-foreground"
            value="#79217A"
          />
          <Swatch
            name="Teal"
            className="bg-secondary"
            textClassName="text-foreground"
            value="#006F6E"
          />
          <Swatch
            name="Blue"
            className="bg-info"
            textClassName="text-foreground"
            value="#2769B2"
          />
          <Swatch
            name="Foreground"
            className="bg-foreground"
            textClassName="text-foreground"
            value="#1F2937"
          />
          <Swatch
            name="Background"
            className="bg-background"
            textClassName="text-foreground"
            value="#FFFFFF"
          />
        </div>
      </div>

      {/* Semantic colors */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Semantic Colors</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <Swatch
            name="Accent"
            className="bg-accent"
            textClassName="text-foreground"
            value="Teal tint"
          />
          <Swatch
            name="Muted"
            className="bg-muted"
            textClassName="text-foreground"
            value="Cool gray"
          />
          <Swatch
            name="Destructive"
            className="bg-destructive"
            textClassName="text-foreground"
            value="#E53935"
          />
          <Swatch
            name="Success"
            className="bg-success"
            textClassName="text-foreground"
            value="#1A9A5C"
          />
          <Swatch
            name="Warning"
            className="bg-warning"
            textClassName="text-foreground"
            value="#E99200"
          />
        </div>
      </div>
    </div>
  )
}
