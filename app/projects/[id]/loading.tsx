import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Back button skeleton */}
      <Skeleton className="h-10 w-24 mb-6" />

      {/* Project header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-48" />
          <Skeleton className="h-20 w-48" />
          <Skeleton className="h-20 w-48" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-12 w-full mb-6" />

      {/* Content skeleton */}
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
