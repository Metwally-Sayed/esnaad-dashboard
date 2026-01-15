'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HandoverStatusBadge } from './HandoverStatusBadge'
import { FormDialog } from '@/components/ui/form-dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { HandoverItemsBuilder, HandoverItemData } from '@/components/handover/HandoverItemsBuilder'
import { unitHandoverService } from '@/lib/api/handover.service'
import { unitsService } from '@/lib/api/units.service'
import { useCreateHandover } from '@/lib/hooks/use-handovers'
import { HandoverFilters, CreateHandoverDto, HandoverItemStatus } from '@/lib/types/handover.types'
import useSWR from 'swr'
import { Plus, FileText, ArrowRight, Clock, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'

interface UnitHandoversListProps {
  unitId: string
  unitNumber: string
  ownerId?: string | null
}

// Form validation schema
const createHandoverSchema = z.object({
  handoverDate: z.date({
    message: "Handover date is required",
  }),
  notes: z.string().optional(),
})

type CreateHandoverFormData = z.infer<typeof createHandoverSchema>

export function UnitHandoversList({ unitId, unitNumber, ownerId }: UnitHandoversListProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [existingHandover, setExistingHandover] = useState<{ id: string; status: string } | null>(null)
  const [checkingExisting, setCheckingExisting] = useState(false)
  const [items, setItems] = useState<HandoverItemData[]>([])
  const [itemsValid, setItemsValid] = useState(true)

  const [filters, setFilters] = useState<HandoverFilters>({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { data, error, isLoading, mutate } = useSWR(
    ['unit-handovers', unitId, filters],
    () => unitHandoverService.getHandoversForUnit(unitId, filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  // Form setup
  const form = useForm<CreateHandoverFormData>({
    resolver: zodResolver(createHandoverSchema),
    defaultValues: {
      handoverDate: undefined,
      notes: '',
    },
  })

  const { mutateAsync: createHandover, isPending } = useCreateHandover()

  // Debug logging
  console.log('UnitHandoversList Debug:', {
    unitId,
    data,
    items: data?.items,
    pagination: data?.pagination,
    error,
    isLoading
  })

  const handovers = data?.items || []
  const pagination = data?.pagination

  // Check for existing handover when dialog opens
  const checkForExistingHandover = async () => {
    try {
      setCheckingExisting(true)
      setExistingHandover(null)

      const handoverData = await unitsService.getUnitHandover(unitId)

      if (handoverData.exists && handoverData.handover && handoverData.handover.status !== 'CANCELLED') {
        setExistingHandover({
          id: handoverData.handover.id,
          status: handoverData.handover.status
        })
        toast.error('This unit already has an active handover')
      }
    } catch (error) {
      console.error('Error checking for existing handover:', error)
    } finally {
      setCheckingExisting(false)
    }
  }

  // Reset form and check for existing handover when dialog opens
  useEffect(() => {
    if (showCreateDialog) {
      form.reset({
        handoverDate: undefined,
        notes: '',
      })
      setItems([])
      setExistingHandover(null)
      checkForExistingHandover()
    }
  }, [showCreateDialog])

  const handleCreateHandover = () => {
    setShowCreateDialog(true)
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    // Validate items before submission
    if (items.length > 0 && !itemsValid) {
      toast.error('Please fix validation errors in checklist items')
      return
    }

    // Block if existing handover found
    if (existingHandover) {
      toast.error('Cannot create handover - this unit already has an active handover')
      return
    }

    if (!ownerId) {
      toast.error('This unit does not have an owner assigned')
      return
    }

    try {
      const createData: CreateHandoverDto = {
        unitId,
        ownerId,
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

      const result = await createHandover(createData)

      setShowCreateDialog(false)
      form.reset()
      setItems([])
      mutate() // Refresh the list
      router.push(`/handovers/${result.id}`)
      toast.success('Handover created successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create handover')
    }
  })

  const handleViewHandover = (handoverId: string) => {
    router.push(`/handovers/${handoverId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Handovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Handovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load handovers
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Handovers
            </CardTitle>
            <CardDescription className="mt-1">
              Formal handover agreements for unit {unitNumber}
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={handleCreateHandover} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Handover
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {handovers.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No handovers created yet"
            description={
              isAdmin && !ownerId
                ? "Assign an owner to this unit before creating handovers"
                : "Formal handover agreements will appear here"
            }
            action={
              isAdmin && ownerId
                ? {
                    label: "Create First Handover",
                    onClick: handleCreateHandover,
                    icon: Plus
                  }
                : undefined
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {handovers.map((handover) => (
                  <TableRow key={handover.id}>
                    <TableCell>
                      <HandoverStatusBadge status={handover.status} />
                    </TableCell>
                    <TableCell>
                      {handover.scheduledAt ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(handover.scheduledAt), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(handover.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHandover(handover.id)}
                      >
                        View
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Show more button if there are more handovers */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/units/${unitId}/handovers`)}
                >
                  View All Handovers ({pagination.total})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Create Handover Dialog - Using FormDialog Pattern */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Create Handover Agreement"
        description={`Create a new handover agreement for Unit ${unitNumber}.`}
        submitText="Create Handover"
        isLoading={isPending}
        onSubmit={handleSubmit}
        isSubmitDisabled={!!existingHandover || checkingExisting || (items.length > 0 && !itemsValid) || !ownerId}
        maxWidth="4xl"
      >
        {/* Alert for existing handover */}
        {existingHandover && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Handover Already Exists</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                This unit already has an active handover (Status: {existingHandover.status}).
                Only one handover per unit is allowed.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateDialog(false)
                  router.push(`/handovers/${existingHandover.id}`)
                }}
                className="ml-4"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Existing
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Alert for missing owner */}
        {!ownerId && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Owner Assigned</AlertTitle>
            <AlertDescription>
              This unit does not have an owner assigned. Please assign an owner before creating a handover.
            </AlertDescription>
          </Alert>
        )}

        {/* Form with Tabs */}
        <Form {...form}>
          <form className="space-y-6">
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
                {/* Unit Display (read-only) */}
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input
                      value={`Unit ${unitNumber}`}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    This handover will be created for this unit.
                  </FormDescription>
                </FormItem>

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
                          disabled={isPending || !!existingHandover}
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
                          disabled={isPending || !!existingHandover}
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
                  disabled={isPending || !!existingHandover}
                  onValidationChange={(isValid, errors) => {
                    setItemsValid(isValid)
                  }}
                />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </FormDialog>
    </Card>
  )
}