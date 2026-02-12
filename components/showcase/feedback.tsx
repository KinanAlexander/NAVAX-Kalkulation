"use client"

import { AlertBanner, EmptyState, SkeletonCard } from "@/components/ds"
import { Button } from "@/components/ui/button"
import { Info, CheckCircle2, AlertTriangle, XCircle, Inbox, Plus } from "lucide-react"

export function ShowcaseFeedback() {
  return (
    <div className="flex flex-col gap-8">
      {/* Alert Banners */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Alert Banners</p>
        <div className="flex flex-col gap-3">
          <AlertBanner variant="default" icon={<Info />} title="Information">
            <p className="text-sm">Your trial ends in 7 days. Upgrade to keep full access.</p>
          </AlertBanner>
          <AlertBanner variant="success" icon={<CheckCircle2 />} title="Success">
            <p className="text-sm">Your changes have been saved successfully.</p>
          </AlertBanner>
          <AlertBanner variant="warning" icon={<AlertTriangle />} title="Warning" dismissible>
            <p className="text-sm">API rate limit approaching. Consider upgrading your plan.</p>
          </AlertBanner>
          <AlertBanner variant="destructive" icon={<XCircle />} title="Error" dismissible>
            <p className="text-sm">Failed to process payment. Please check your card details.</p>
          </AlertBanner>
          <AlertBanner variant="muted">
            <p className="text-sm">This is a muted announcement for low-priority info.</p>
          </AlertBanner>
        </div>
      </div>

      {/* Empty States */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Empty States</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <EmptyState
            icon={<Inbox />}
            title="No messages yet"
            description="When you receive messages, they will appear here."
            action={
              <Button size="sm">
                <Plus className="size-4" />
                Compose
              </Button>
            }
          />
          <EmptyState
            title="No results found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button variant="outline" size="sm">
                Clear filters
              </Button>
            }
          />
        </div>
      </div>

      {/* Skeleton Cards */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">
          Loading Skeletons
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard showAvatar lines={2} />
          <SkeletonCard showImage lines={2} />
        </div>
      </div>
    </div>
  )
}
