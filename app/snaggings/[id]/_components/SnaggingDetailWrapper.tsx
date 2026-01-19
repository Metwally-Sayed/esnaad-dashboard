'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import useSWR from 'swr'
import snaggingService from '@/lib/api/snagging.service'
import { Snagging } from '@/lib/types/snagging.types'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load the heavy SnaggingDetail component (649 lines)
const SnaggingDetail = dynamic(() => import('./SnaggingDetail').then(mod => ({ default: mod.SnaggingDetail })), {
  loading: () => (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  ),
});

interface SnaggingDetailWrapperProps {
  snaggingId: string
}

export function SnaggingDetailWrapper({ snaggingId }: SnaggingDetailWrapperProps) {
  const router = useRouter()
  const { user, isAdmin } = useAuth()

  // Redirect non-admins to dashboard
  // Owners should view snaggings via unit profile widget, not this page
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, router])

  const { data: snagging, isLoading, error, mutate } = useSWR<Snagging>(
    snaggingId ? `/snaggings/${snaggingId}` : null,
    () => snaggingService.getSnaggingById(snaggingId),
    {
      revalidateOnFocus: false
    }
  )

  // Block owner access
  if (user && !isAdmin) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view this page. Owners should view snagging reports from their unit profile.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !snagging) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Snagging not found or you don\'t have permission to view it'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SnaggingDetail
        snagging={snagging}
        onDelete={() => router.push('/snaggings')}
        onRegeneratePdf={() => mutate()}
      />
    </div>
  )
}
