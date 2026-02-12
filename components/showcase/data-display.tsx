import { StatCard, AvatarGroup, ProgressBar, Timeline } from "@/components/ds"
import { Users, DollarSign, Activity, TrendingUp, Check, Clock } from "lucide-react"

export function ShowcaseDataDisplay() {
  return (
    <div className="flex flex-col gap-8">
      {/* Stat Cards */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Stat Cards</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value="12,485"
            description="+14.2% from last month"
            trend="up"
            icon={<Users />}
          />
          <StatCard
            label="Revenue"
            value="$48.2k"
            description="+8.1% from last month"
            trend="up"
            icon={<DollarSign />}
          />
          <StatCard
            label="Active Now"
            value="342"
            description="-3.4% from yesterday"
            trend="down"
            icon={<Activity />}
          />
          <StatCard
            label="Growth Rate"
            value="24.5%"
            description="Steady"
            trend="neutral"
            icon={<TrendingUp />}
          />
        </div>
      </div>

      {/* Avatar Group */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Avatar Group</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-12">Small</span>
            <AvatarGroup
              size="sm"
              items={[
                { fallback: "JD" },
                { fallback: "AS" },
                { fallback: "MK" },
                { fallback: "RW" },
                { fallback: "PL" },
                { fallback: "TC" },
                { fallback: "BN" },
              ]}
              max={4}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-12">Medium</span>
            <AvatarGroup
              size="md"
              items={[
                { fallback: "JD" },
                { fallback: "AS" },
                { fallback: "MK" },
                { fallback: "RW" },
                { fallback: "PL" },
              ]}
              max={5}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-12">Large</span>
            <AvatarGroup
              size="lg"
              items={[
                { fallback: "JD" },
                { fallback: "AS" },
                { fallback: "MK" },
              ]}
              max={5}
            />
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">
          Progress Bars
        </p>
        <div className="flex flex-col gap-4 max-w-md">
          <ProgressBar value={72} label="Storage" showValue color="primary" />
          <ProgressBar value={95} label="Uptime" showValue color="success" />
          <ProgressBar value={45} label="CPU Usage" showValue color="warning" />
          <ProgressBar
            value={15}
            label="Error Rate"
            showValue
            color="destructive"
          />
        </div>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Timeline</p>
        <div className="max-w-md">
          <Timeline
            items={[
              {
                title: "Deployment completed",
                description: "Production build v2.4.1 deployed successfully.",
                timestamp: "2m ago",
                status: "completed",
                icon: <Check />,
              },
              {
                title: "Build in progress",
                description: "Running type checks and lint...",
                timestamp: "5m ago",
                status: "active",
                icon: <Clock />,
              },
              {
                title: "PR merged",
                description: "Feature: Add user dashboard analytics.",
                timestamp: "12m ago",
                status: "completed",
              },
              {
                title: "Review requested",
                timestamp: "1h ago",
                status: "pending",
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
