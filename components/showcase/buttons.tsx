import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ds"
import { Mail, ArrowRight, Plus, Settings, Trash2 } from "lucide-react"

export function ShowcaseButtons() {
  return (
    <div className="flex flex-col gap-8">
      {/* Variants */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Variants</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Sizes</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <Plus />
          </Button>
        </div>
      </div>

      {/* With icons */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">With Icons</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Mail />
            Send Email
          </Button>
          <Button variant="outline">
            Continue
            <ArrowRight />
          </Button>
          <Button variant="secondary">
            <Settings />
            Settings
          </Button>
        </div>
      </div>

      {/* Icon Buttons */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Icon Buttons</p>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="Add item" variant="default" size="sm">
            <Plus />
          </IconButton>
          <IconButton label="Settings" variant="outline" size="md">
            <Settings />
          </IconButton>
          <IconButton label="Delete" variant="ghost" size="lg">
            <Trash2 />
          </IconButton>
        </div>
      </div>

      {/* Disabled */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Disabled</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Primary</Button>
          <Button variant="secondary" disabled>
            Secondary
          </Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
        </div>
      </div>
    </div>
  )
}
