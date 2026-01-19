import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Back Button Skeleton */}
      <Skeleton className="h-9 w-40 mb-4" />

      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-background to-muted/30 rounded-xl border p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="space-y-3 flex-1">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <Skeleton className="h-3 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-muted/30 p-6">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Checklist Card */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-muted/30 p-6">
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="p-6 space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>

          {/* Messages Card */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-muted/30 p-6">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-muted/30 p-6">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-6 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Timeline Card */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-muted/30 p-6">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
