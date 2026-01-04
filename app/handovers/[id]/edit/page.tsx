'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'
import { handoverService } from '@/lib/api/handover.service'
import { useHandover } from '@/lib/hooks/use-handovers'
import { useAuth } from '@/contexts/AuthContext'
import { UpdateHandoverDto, HandoverStatus } from '@/lib/types/handover.types'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Loader2, AlertCircle, Save } from 'lucide-react'

export default function EditHandoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { handover, isLoading, error, mutate } = useHandover(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<UpdateHandoverDto>({
    scheduledAt: undefined,
    notes: undefined
  })

  // Initialize form data when handover loads
  useState(() => {
    if (handover) {
      setFormData({
        scheduledAt: handover.scheduledAt,
        notes: handover.notes || ''
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      await handoverService.update(id, formData)
      toast.success('Handover updated successfully')
      mutate()
      router.push(`/handovers/${id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update handover')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check permissions
  if (!isAdmin) {
    return (
      <div className="max-w-[800px] mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to edit handovers
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
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
    )
  }

  if (error || !handover) {
    return (
      <div className="max-w-[800px] mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load handover'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check if handover can be edited
  const canEdit = handover.status === HandoverStatus.DRAFT ||
                  handover.status === HandoverStatus.CHANGES_REQUESTED

  if (!canEdit) {
    return (
      <div className="max-w-[800px] mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This handover cannot be edited in its current status ({handover.status})
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit Handover Agreement
          </CardTitle>
          <CardDescription>
            Update handover details for unit {handover.unit?.unitNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Unit Info (Read-only) */}
            <div className="space-y-2">
              <Label>Unit</Label>
              <div className="p-3 bg-muted rounded-md">
                {handover.unit?.unitNumber} - {handover.owner?.name || handover.owner?.email}
                {handover.unit?.buildingName && ` (${handover.unit.buildingName})`}
              </div>
            </div>

            {/* Status Info */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="p-3 bg-muted rounded-md">
                {handover.status.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled Date</Label>
              <DatePicker
                date={formData.scheduledAt ? new Date(formData.scheduledAt) : undefined}
                onSelect={(date) => setFormData({ ...formData, scheduledAt: date?.toISOString() })}
              />
              <p className="text-sm text-muted-foreground">
                The planned date for the handover meeting
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes or comments..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={6}
              />
            </div>

            {/* Info Alert */}
            {handover.status === HandoverStatus.CHANGES_REQUESTED && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The owner has requested changes to this handover. Make the necessary updates and send it back for review.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}