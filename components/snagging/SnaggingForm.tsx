'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploader, ImageWithComment } from './ImageUploader'
import { useUnits } from '@/lib/hooks/use-units'
import { useUsers } from '@/lib/hooks/use-users'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CreateSnaggingDto } from '@/lib/types/snagging.types'

const createSnaggingSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  ownerId: z.string().min(1, 'Owner is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  images: z.array(z.object({
    imageUrl: z.string().url(),
    comment: z.string().max(1000).optional(),
    sortOrder: z.number()
  })).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed')
})

type SnaggingFormData = z.infer<typeof createSnaggingSchema>

interface SnaggingFormProps {
  onSubmit: (data: CreateSnaggingDto) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function SnaggingForm({ onSubmit, onCancel, isLoading = false }: SnaggingFormProps) {
  const [images, setImages] = useState<ImageWithComment[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('')

  const { units, isLoading: unitsLoading } = useUnits({ limit: 100 })
  const { users: owners, isLoading: ownersLoading } = useUsers({ role: 'OWNER', limit: 100 })

  // Filter owners based on selected unit
  const availableOwners = selectedUnitId
    ? owners.filter(owner => {
        const unit = units.find(u => u.id === selectedUnitId)
        return unit?.ownerId === owner.id
      })
    : owners

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SnaggingFormData>({
    resolver: zodResolver(createSnaggingSchema),
    defaultValues: {
      unitId: '',
      ownerId: '',
      title: '',
      description: '',
      images: []
    }
  })

  // Update form when images change
  useEffect(() => {
    const imageData = images
      .filter(img => img.imageUrl) // Only include uploaded images
      .map((img, index) => ({
        imageUrl: img.imageUrl!,
        comment: img.comment || '',
        sortOrder: img.sortOrder
      }))
    
    setValue('images', imageData, { shouldValidate: true })
  }, [images, setValue])

  // Update owner when unit changes
  useEffect(() => {
    if (selectedUnitId) {
      const unit = units.find(u => u.id === selectedUnitId)
      if (unit?.ownerId) {
        setSelectedOwnerId(unit.ownerId)
        setValue('ownerId', unit.ownerId, { shouldValidate: true })
      } else {
        setSelectedOwnerId('')
        setValue('ownerId', '', { shouldValidate: true })
      }
    }
  }, [selectedUnitId, units, setValue])

  const onFormSubmit = async (data: SnaggingFormData) => {
    try {
      await onSubmit(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create snagging')
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Unit Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Information</CardTitle>
          <CardDescription>Select the unit for this snagging report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitId">Unit *</Label>
            <Select
              value={selectedUnitId}
              onValueChange={(value) => {
                setSelectedUnitId(value)
                setValue('unitId', value, { shouldValidate: true })
              }}
              disabled={unitsLoading || isLoading}
            >
              <SelectTrigger id="unitId">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.unitNumber} {unit.buildingName && `- ${unit.buildingName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unitId && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.unitId.message}
              </p>
            )}
          </div>

          {/* Owner Selection */}
          <div className="space-y-2">
            <Label htmlFor="ownerId">Owner *</Label>
            <Select
              value={selectedOwnerId}
              onValueChange={(value) => {
                setSelectedOwnerId(value)
                setValue('ownerId', value, { shouldValidate: true })
              }}
              disabled={ownersLoading || isLoading || !selectedUnitId}
            >
              <SelectTrigger id="ownerId">
                <SelectValue placeholder={selectedUnitId ? "Select owner" : "Select unit first"} />
              </SelectTrigger>
              <SelectContent>
                {availableOwners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name || owner.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ownerId && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.ownerId.message}
              </p>
            )}
            {selectedUnitId && availableOwners.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No owner assigned to this unit. Please assign an owner first.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Snagging Details */}
      <Card>
        <CardHeader>
          <CardTitle>Snagging Details</CardTitle>
          <CardDescription>Provide title and description for this snagging report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Kitchen cabinet damage"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the issue in detail..."
              rows={5}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload images with comments (maximum 10 images)</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            value={images}
            onChange={setImages}
            maxFiles={10}
            maxSize={5}
            disabled={isLoading}
          />
          {errors.images && (
            <p className="text-sm text-destructive flex items-center gap-1 mt-2">
              <AlertCircle className="h-4 w-4" />
              {errors.images.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Snagging'
          )}
        </Button>
      </div>
    </form>
  )
}
