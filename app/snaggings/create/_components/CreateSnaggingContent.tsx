'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SnaggingForm } from '@/components/snagging/SnaggingForm'
import { CreateSnaggingDto } from '@/lib/types/snagging.types'
import snaggingService from '@/lib/api/snagging.service'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'

export function CreateSnaggingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAdmin } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get unitId from query params if coming from unit details
  const preselectedUnitId = searchParams.get('unitId')

  // Redirect non-admins to dashboard
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, router])

  // Block owner access - owners should use unit profile
  if (!user) {
    return null
  }

  if (user.role !== 'ADMIN') {
    // Double-check: only admins can access this page
    return null
  }

  const handleSubmit = async (data: CreateSnaggingDto) => {
    try {
      setIsSubmitting(true)
      const snagging = await snaggingService.createSnagging(data)
      toast.success('Snagging created successfully! PDF is being generated...')
      router.push(`/snaggings/${snagging.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create snagging')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Snaggings
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Create Snagging Report</h1>
        <p className="text-muted-foreground mt-1">
          Create a new snagging inspection report with images and comments. The PDF will be automatically generated after creation.
        </p>
      </div>

      <SnaggingForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
        preselectedUnitId={preselectedUnitId}
      />
    </div>
  )
}
