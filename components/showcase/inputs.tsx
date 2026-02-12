import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function ShowcaseInputs() {
  return (
    <div className="flex flex-col gap-8 max-w-md">
      {/* Basic input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>

      {/* Input with error */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="johndoe"
          className="border-destructive focus-visible:ring-destructive"
          defaultValue="ab"
        />
        <p className="text-sm text-destructive">
          Username must be at least 3 characters.
        </p>
      </div>

      {/* Disabled input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" placeholder="Cannot edit" disabled />
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          rows={4}
        />
      </div>

      {/* Form example */}
      <div className="rounded-lg border border-border p-6">
        <p className="text-sm font-medium mb-4 text-foreground">Example Form</p>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-name">Full Name</Label>
            <Input id="form-name" placeholder="Jane Smith" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="form-email">Email</Label>
            <Input
              id="form-email"
              type="email"
              placeholder="jane@example.com"
            />
          </div>
          <Button type="button" className="self-start">
            Submit
          </Button>
        </form>
      </div>
    </div>
  )
}
