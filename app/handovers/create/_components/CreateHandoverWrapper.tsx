'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateHandoverContent } from './CreateHandoverContent'

export function CreateHandoverWrapper() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[800px] mx-auto p-4 md:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <CreateHandoverContent />
    </Suspense>
  )
}
