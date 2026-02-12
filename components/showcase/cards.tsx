import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ds"

export function ShowcaseCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Basic card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Card</CardTitle>
          <CardDescription>
            A simple content container with header, content, and footer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            Cards use bg-card with a subtle border and shadow-sm. Padding is
            p-6 by default.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">
            Learn More
          </Button>
        </CardFooter>
      </Card>

      {/* Card with status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>With Status</CardTitle>
            <StatusBadge status="success">Live</StatusBadge>
          </div>
          <CardDescription>
            Cards work well with status badges for contextual information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-medium text-foreground">99.98%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response</span>
              <span className="font-medium text-foreground">42ms</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Requests</span>
              <span className="font-medium text-foreground">1.2M</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive card */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>Interactive</CardTitle>
          <CardDescription>
            Add hover:shadow-md for a subtle lift effect on interactive cards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            Use transition-shadow on the Card for smooth hover states. Great for
            clickable items.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm">Action</Button>
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
