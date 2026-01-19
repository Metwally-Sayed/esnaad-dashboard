'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { handoverService } from '@/lib/api/handover.service'
import { useUnits } from '@/lib/hooks/use-units'
import { useAuth } from '@/contexts/AuthContext'
import { CreateHandoverDto } from '@/lib/types/handover.types'
import { toast } from 'sonner'
import { ArrowLeft, FileText, Plus, Loader2, AlertCircle } from 'lucide-react'

export function CreateHandoverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAdmin } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get unitId from query params if coming from unit details
  const preselectedUnitId = searchParams.get('unitId')

  const [formData, setFormData] = useState<Partial<CreateHandoverDto>>({
    unitId: preselectedUnitId || '',
    scheduledAt: undefined,
    notes: ''
  })

  // Fetch units for selection
  const { units, isLoading: unitsLoading } = useUnits({
    limit: 100
  })

  // Filter units to only show those with owners
  const unitsWithOwners = units?.filter(unit => unit.ownerId !== null && unit.ownerId !== undefined) || []

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      router.push('/handovers')
    }
  }, [isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.unitId) {
      toast.error('Please select a unit')
      return
    }

    // Find the selected unit to get the owner ID
    const selectedUnit = unitsWithOwners.find(u => u.id === formData.unitId)
    if (!selectedUnit || !selectedUnit.ownerId) {
      toast.error('Selected unit does not have an owner')
      return
    }

    setIsSubmitting(true)
    try {
      const handover = await handoverService.create({
        unitId: formData.unitId,
        ownerId: selectedUnit.ownerId,
        scheduledAt: formData.scheduledAt,
        notes: formData.notes
      })

      toast.success('Handover created successfully')
      router.push(`/handovers/${handover.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create handover')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return null
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
            <FileText className="h-6 w-6" />
            Create Handover Agreement
          </CardTitle>
          <CardDescription>
            Create a new formal handover agreement for a unit. The handover will be created in draft status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Unit Selection */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                disabled={!!preselectedUnitId}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitsLoading ? (
                    <div className="p-2 text-center text-muted-foreground">Loading units...</div>
                  ) : unitsWithOwners.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      No units with owners available
                    </div>
                  ) : (
                    unitsWithOwners.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.unitNumber} - {unit.owner?.name || unit.owner?.email}
                        {unit.buildingName && ` (${unit.buildingName})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Only units with assigned owners can have handovers
              </p>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled Date (Optional)</Label>
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
              <Label htmlFor="notes">Initial Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any initial notes or comments..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The handover will be created in DRAFT status. You can add items, attachments, and send it to the owner after creation.
              </AlertDescription>
            </Alert>

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
              <Button type="submit" disabled={isSubmitting || !formData.unitId}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Handover
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
