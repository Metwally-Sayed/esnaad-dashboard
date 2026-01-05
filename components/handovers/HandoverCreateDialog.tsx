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
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateHandover } from '@/lib/hooks/use-handovers'
import { CreateHandoverDto, HandoverItemStatus } from '@/lib/types/handover.types'
import { Loader2, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUnits } from '@/lib/hooks/use-units'
import { DatePicker } from '@/components/ui/date-picker'
import { HandoverItemsBuilder, HandoverItemData } from '@/components/handover/HandoverItemsBuilder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Create schema factory to handle conditional unitId validation
const createHandoverSchema = (hasUnitId: boolean) => z.object({
  unitId: hasUnitId ? z.string().optional() : z.string().min(1, 'Unit is required'),
  handoverDate: z.date({
    message: "Handover date is required",
  }),
  notes: z.string().optional(),
})

type CreateHandoverFormData = z.infer<ReturnType<typeof createHandoverSchema>>

interface HandoverCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId?: string  // Optional for global creation
  unitNumber?: string
  ownerId?: string // Pass ownerId when creating from unit profile
  onSuccess?: (handoverId: string) => void
}

// Default checklist items for new handovers
const DEFAULT_CHECKLIST = [
  { item: 'Keys handed over', checked: false },
  { item: 'Unit inspection completed', checked: false },
  { item: 'All fixtures and fittings verified', checked: false },
  { item: 'Utilities meter readings recorded', checked: false },
  { item: 'Documentation provided', checked: false },
  { item: 'Damages or issues documented', checked: false },
  { item: 'Access cards/remotes provided', checked: false },
  { item: 'Emergency contacts shared', checked: false },
]

export function HandoverCreateDialog({
  open,
  onOpenChange,
  unitId,
  unitNumber,
  ownerId,
  onSuccess,
}: HandoverCreateDialogProps) {
  const router = useRouter()
  const { userRole, userId } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<HandoverItemData[]>([])
  const [itemsValid, setItemsValid] = useState(true)
  const createHandover = useCreateHandover()

  // Fetch units for selection when no unitId provided
  const { units } = useUnits(unitId ? {} : { ownerId: userRole === 'owner' && userId ? userId : undefined })

  const isAdmin = userRole === 'admin'

  const form = useForm<CreateHandoverFormData>({
    resolver: zodResolver(createHandoverSchema(!!unitId)),
    defaultValues: {
      unitId: unitId || '',
      handoverDate: undefined,
      notes: '',
    },
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        unitId: unitId || '',
        handoverDate: undefined,
        notes: '',
      })
      setItems([])
    }
  }, [open, unitId, form])

  const onSubmit = async (data: CreateHandoverFormData) => {
    try {
      // Validate items before submission
      if (items.length > 0 && !itemsValid) {
        toast.error('Please fix validation errors in checklist items')
        return
      }

      setIsSubmitting(true)

      // Determine final unitId - use prop unitId if provided, otherwise use form value
      const finalUnitId = unitId || data.unitId

      if (!finalUnitId) {
        toast.error('Please select a unit')
        setIsSubmitting(false)
        return
      }

      // Get ownerId - use provided ownerId or find from selected unit
      let finalOwnerId = ownerId

      if (!finalOwnerId) {
        const selectedUnit = units?.find(u => u.id === finalUnitId)
        if (!selectedUnit || !selectedUnit.ownerId) {
          toast.error('This unit does not have an owner assigned')
          setIsSubmitting(false)
          return
        }
        finalOwnerId = selectedUnit.ownerId
      }

      // Create handover with items
      const createData: CreateHandoverDto = {
        unitId: finalUnitId,
        ownerId: finalOwnerId,
        scheduledAt: data.handoverDate.toISOString(),
        notes: data.notes,
        items: items.length > 0 ? items.map(({ category, label, expectedValue, notes, sortOrder }) => ({
          category,
          label,
          expectedValue,
          notes,
          status: HandoverItemStatus.NA,
          sortOrder
        })) : undefined
      }

      const result = await createHandover.mutateAsync(createData)

      // Reset form
      form.reset()

      // Close dialog
      onOpenChange(false)

      // Call success callback or navigate to handover
      if (onSuccess) {
        onSuccess(result.id)
      } else {
        toast.success('Handover created successfully')
        router.push(`/handovers/${result.id}`)
      }
    } catch (error: any) {
      console.error('Failed to create handover:', error)
      toast.error(error.message || 'Failed to create handover')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Handover Agreement</DialogTitle>
          <DialogDescription>
            {unitId
              ? `Create a new handover agreement for Unit ${unitNumber || unitId}.`
              : 'Create a new handover agreement. Fill in the details and add checklist items.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="checklist">
                  Checklist Items
                  {items.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {items.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
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
                  This handover will be created for this unit.
                </FormDescription>
              </FormItem>
            ) : (
              // Show unit selection dropdown when no unitId (from /handovers route)
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
                      Select the unit for this handover agreement.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Handover Date */}
            <FormField
              control={form.control}
              name="handoverDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Handover Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="Select handover date"
                    />
                  </FormControl>
                  <FormDescription>
                    The scheduled date for the unit handover.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special instructions or notes about the handover..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Include any additional information relevant to the handover process.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

              </TabsContent>

              <TabsContent value="checklist" className="mt-6">
                <HandoverItemsBuilder
                  items={items}
                  onChange={setItems}
                  disabled={isSubmitting}
                  onValidationChange={(isValid, errors) => {
                    setItemsValid(isValid)
                  }}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (items.length > 0 && !itemsValid)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Handover
                    {items.length > 0 && !itemsValid && (
                      <Badge variant="destructive" className="ml-2">
                        Errors
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}