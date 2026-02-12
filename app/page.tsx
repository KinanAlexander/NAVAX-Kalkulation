import { AppSidebar } from "@/components/ds/app-sidebar"
import { PageHeader } from "@/components/ds/page-header"
import { StatCard } from "@/components/ds/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, TrendingUp, Activity } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <PageHeader
            title="Dashboard"
            description="Welcome back. Here is an overview of your workspace."
          />

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total customers"
              value="1,248"
              trend="up"
              description="+12% from last month"
              icon={<Users />}
            />
            <StatCard
              label="Revenue"
              value="€84,320"
              trend="up"
              description="+8.2% from last month"
              icon={<TrendingUp />}
            />
            <StatCard
              label="Active projects"
              value="34"
              trend="neutral"
              description="Across 6 teams"
              icon={<Activity />}
            />
            <StatCard
              label="Conversion rate"
              value="3.2%"
              trend="up"
              description="+0.4% from last month"
              icon={<BarChart3 />}
            />
          </div>

          {/* Placeholder content cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                      <div className="h-3 flex-1 rounded bg-muted" />
                      <div className="h-3 w-16 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-md bg-accent" />
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div className="h-3 w-3/4 rounded bg-muted" />
                        <div className="h-2.5 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
