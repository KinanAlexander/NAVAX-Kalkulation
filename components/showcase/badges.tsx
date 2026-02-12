import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ds"

export function ShowcaseBadges() {
  return (
    <div className="flex flex-col gap-8">
      {/* Standard badges */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Standard Badges</p>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      {/* Status badges */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Status Badges</p>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="default">Active</StatusBadge>
          <StatusBadge status="success">Completed</StatusBadge>
          <StatusBadge status="warning">Pending</StatusBadge>
          <StatusBadge status="destructive">Failed</StatusBadge>
          <StatusBadge status="muted">Archived</StatusBadge>
        </div>
      </div>

      {/* Without dot */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Without Dot</p>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="default" dot={false}>
            v2.1.0
          </StatusBadge>
          <StatusBadge status="success" dot={false}>
            Shipped
          </StatusBadge>
          <StatusBadge status="warning" dot={false}>
            Beta
          </StatusBadge>
        </div>
      </div>
    </div>
  )
}
