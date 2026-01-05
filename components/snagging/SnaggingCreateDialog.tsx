'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AttachmentUploader } from './AttachmentUploader'
import { useCreateSnagging } from '@/lib/hooks/use-snagging'
import { CreateSnaggingDto, SnaggingPriority } from '@/lib/types/snagging.types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUnits } from '@/lib/hooks/use-units'
import { unitDocumentsService } from '@/lib/api/unit-documents.service'

// Create schema factory to handle conditional unitId validation
const createSnaggingSchema = (hasUnitId: boolean) => z.object({
  unitId: hasUnitId ? z.string().optional() : z.string().min(1, 'Unit is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  priority: z.nativeEnum(SnaggingPriority).optional(),
  attachments: z.array(z.instanceof(File)).max(5, 'Maximum 5 files allowed'),
})

type CreateSnaggingFormData = z.infer<ReturnType<typeof createSnaggingSchema>>

interface SnaggingCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId?: string  // Make optional for global creation
  unitNumber?: string
  onSuccess?: (snaggingId: string) => void
}

export function SnaggingCreateDialog({
  open,
  onOpenChange,
  unitId,
  unitNumber,
  onSuccess,
}: SnaggingCreateDialogProps) {
  const router = useRouter()
  const { userRole, userId } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createSnagging = useCreateSnagging()

  // Fetch units for selection when no unitId provided
  const { units } = useUnits(unitId ? {} : { ownerId: userRole === 'owner' && userId ? userId : undefined })

  const isAdmin = userRole === 'admin'

  const form = useForm<CreateSnaggingFormData>({
    resolver: zodResolver(createSnaggingSchema(!!unitId)),
    defaultValues: {
      unitId: unitId || '',
      title: '',
      description: '',
      priority: isAdmin ? SnaggingPriority.MEDIUM : undefined, // Only set default for admin
      attachments: [],
    },
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        unitId: unitId || '',
        title: '',
        description: '',
        priority: isAdmin ? SnaggingPriority.MEDIUM : undefined,
        attachments: [],
      })
    }
  }, [open, unitId, isAdmin])

  const onSubmit = async (data: CreateSnaggingFormData) => {
    try {
      setIsSubmitting(true)

      // Upload attachments to Cloudinary
      let attachments: CreateSnaggingDto['attachments'] = []

      // Only try to upload if there are attachments
      if (data.attachments && data.attachments.length > 0) {
        try {
          console.log('Uploading files to Cloudinary. Files selected:', data.attachments.length)

          // Upload each file to Cloudinary
          const uploadPromises = data.attachments.map(async (file) => {
            const result = await unitDocumentsService.uploadFileDirect(file)
            return {
              url: result.publicUrl, // Use the full Cloudinary URL
              fileName: file.name,
              mimeType: file.type,
              sizeBytes: file.size
            }
          })

          attachments = await Promise.all(uploadPromises)
          console.log('All files uploaded successfully to Cloudinary')
        } catch (uploadError) {
          console.error('Upload failed:', uploadError)
          toast.error('Failed to upload images. Please try again.')
          setIsSubmitting(false)
          return // Don't continue if upload fails
        }
      }

      // Determine final unitId - use prop unitId if provided, otherwise use form value
      const finalUnitId = unitId || data.unitId

      if (!finalUnitId) {
        toast.error('Please select a unit')
        setIsSubmitting(false)
        return
      }

      // Create snagging
      const createData: CreateSnaggingDto = {
        title: data.title,
        description: data.description || '', // Provide empty string if no description
        priority: isAdmin ? (data.priority || SnaggingPriority.MEDIUM) : SnaggingPriority.MEDIUM, // Only admin can set priority
        unitId: finalUnitId,
        attachments, // Will be empty array if no files selected
      }

      const result = await createSnagging.mutateAsync(createData)

      // Reset form
      form.reset()

      // Close dialog
      onOpenChange(false)

      // Call success callback or navigate to thread
      if (onSuccess) {
        onSuccess(result.id)
      } else {
        router.push(`/snaggings/${result.id}`)
      }
    } catch (error: any) {
      console.error('Failed to create snagging:', error)
      toast.error(error.message || 'Failed to create snagging')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Priority options with descriptions
  const priorityOptions = [
    {
      value: SnaggingPriority.LOW,
      label: 'Low',
      description: 'Minor issues that do not affect functionality',
      className: 'text-blue-600',
    },
    {
      value: SnaggingPriority.MEDIUM,
      label: 'Medium',
      description: 'Issues that should be addressed but are not urgent',
      className: 'text-yellow-600',
    },
    {
      value: SnaggingPriority.HIGH,
      label: 'High',
      description: 'Important issues affecting functionality or safety',
      className: 'text-orange-600',
    },
    {
      value: SnaggingPriority.URGENT,
      label: 'Urgent',
      description: 'Critical issues requiring immediate attention',
      className: 'text-red-600',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            {unitId
              ? `Create a new snagging item for Unit ${unitNumber || unitId}. Provide details about the issue and attach relevant photos.`
              : 'Create a new snagging item. Select the unit and provide details about the issue.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Unit Selection/Display */}
            {unitId ? (
              // Show read-only unit info when unitId is provided (from unit profile)
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input
                    value={unitNumber ? `Unit ${unitNumber}` : `Unit ${unitId}`}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>
                  This snagging item will be assigned to this unit.
                </FormDescription>
              </FormItem>
            ) : (
              // Show unit selection dropdown when no unitId (from /snaggings route)
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Unit <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.unitNumber} - {unit.buildingName || 'No Building'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the unit where the issue is located.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the issue"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Field - only show for admins */}
            {isAdmin && (
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Priority <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className={option.className}>{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about the issue..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Include location, severity, and any other relevant details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <AttachmentUploader
                      value={field.value || []}
                      onChange={field.onChange}
                      maxFiles={5}
                      maxSize={10}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload up to 5 photos showing the issue (max 10MB each).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Snagging'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}