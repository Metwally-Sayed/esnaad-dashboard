'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SnaggingForm } from '@/components/snagging/SnaggingForm'
import { CreateSnaggingDto } from '@/lib/types/snagging.types'
import snaggingService from '@/lib/api/snagging.service'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

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
    <div className="max-w-[900px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Create Snagging Report
          </CardTitle>
          <CardDescription>
            Create a new snagging inspection report with images and comments. The PDF will be automatically generated after creation.
          </CardDescription>
        </CardHeader>
      </Card>

      <SnaggingForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
