import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      {/* Back Button Skeleton */}
      <Skeleton className="h-10 w-48" />

      {/* Request Detail Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    </div>
  )
}
