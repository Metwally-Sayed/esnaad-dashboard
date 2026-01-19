'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateSnaggingContent } from './CreateSnaggingContent'

export function CreateSnaggingWrapper() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[900px] mx-auto p-4 md:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <CreateSnaggingContent />
    </Suspense>
  )
}
