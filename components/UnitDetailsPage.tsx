'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertDescription } from './ui/alert'
import {
  ArrowLeft,
  Home,
  Building2,
  MapPin,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  User,
  Ruler,
  Bed,
  Bath,
  Hash,
  UserPlus,
  UserMinus,
  Loader2
} from 'lucide-react'
import { useUnit, useUnitMutations, useUnitFormatters } from '@/lib/hooks/use-units'
import { useAuth } from '@/contexts/AuthContext'
import { UnitSnaggingList } from './snagging/UnitSnaggingList'
import { UnitSnaggingWidget } from './snagging/UnitSnaggingWidget'
import { useProjects } from '@/lib/hooks/use-projects'
import { CreateUnitDto, UpdateUnitDto } from '@/lib/types/api.types'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { FormDialog } from './ui/form-dialog'
import { AuditLogsTable } from './AuditLogsTable'
import { useUnitAuditLogs } from '@/lib/hooks/use-audit-logs'
import { UnitHandoversList } from './handover/UnitHandoversList'
import { UnitHandoverWidget } from './handover/UnitHandoverWidget'
import { UnitDocumentsSection } from './documents/UnitDocumentsSection'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { toast } from 'sonner'
import { useUsers } from '@/lib/hooks/use-users'

// Unit form validation schema
const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required').max(50),
  buildingName: z.string().optional(),
  floor: z.union([z.number(), z.string()]).optional(),
  area: z.union([z.number(), z.string()]).optional(),
  bedrooms: z.union([z.number(), z.string()]).optional(),
  bathrooms: z.union([z.number(), z.string()]).optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
})

type UnitFormData = z.infer<typeof unitSchema>

interface UnitDetailsPageProps {
  unitId: string
}

export function UnitDetailsPage({ unitId }: UnitDetailsPageProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { unit, isLoading, error, mutate } = useUnit(unitId)
  const { deleteUnit, assignOwner, removeOwner, isDeleting, isAssigning, updateUnit, isUpdating } = useUnitMutations()
  const { formatDate, formatArea } = useUnitFormatters()
  const { projects } = useProjects({ limit: 100 }) // Load all projects for selection

  // Conditionally fetch admin-only data
  // Use enabled flag to prevent API calls for owners
  const usersData = useUsers(
    isAdmin
      ? { role: 'OWNER', limit: 100 }
      : { enabled: false } // Disable fetching for non-admins
  )
  const auditData = useUnitAuditLogs(
    isAdmin ? unitId : undefined, // Pass undefined to prevent fetching for non-admins
    isAdmin ? {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    } : undefined
  )

  // Extract data, defaulting to empty arrays for non-admins
  const users = usersData.users || []
  const auditLogs = auditData.auditLogs || []
  const auditLoading = auditData.isLoading

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState('')

  // Form setup for editing unit
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitNumber: '',
      buildingName: '',
      floor: undefined,
      area: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      description: '',
      projectId: 'none',
    },
  })

  // Load unit data into form when editing
  useEffect(() => {
    if (unit && isEditDialogOpen) {
      form.reset({
        unitNumber: unit.unitNumber,
        buildingName: unit.buildingName || '',
        floor: unit.floor || undefined,
        area: unit.area || undefined,
        bedrooms: unit.bedrooms || undefined,
        bathrooms: unit.bathrooms || undefined,
        description: unit.description || '',
        projectId: unit.projectId || 'none',
      })
    }
  }, [unit, isEditDialogOpen, form])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isEditDialogOpen) {
      form.reset()
    }
  }, [isEditDialogOpen, form])

  const handleDelete = async () => {
    try {
      await deleteUnit(unitId)
      toast.success('Unit deleted successfully')
      router.push('/units')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete unit')
    }
  }

  const handleSubmitUnit = form.handleSubmit(async (data) => {
    try {
      const unitData = {
        unitNumber: data.unitNumber,
        buildingName: data.buildingName || undefined,
        floor: data.floor ? Number(data.floor) : undefined,
        area: data.area ? Number(data.area) : undefined,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        description: data.description || undefined,
        projectId: data.projectId === "none" ? undefined : data.projectId || undefined,
      }

      await updateUnit(unitId, unitData as UpdateUnitDto)
      toast.success('Unit updated successfully')
      setIsEditDialogOpen(false)
      form.reset()
      mutate() // Refresh the unit data
    } catch (err: any) {
      toast.error(err.message || 'Failed to update unit')
    }
  })

  const handleAssignOwner = async () => {
    if (!selectedOwnerId) return

    try {
      await assignOwner(unitId, { ownerId: selectedOwnerId })
      toast.success('Owner assigned successfully')
      setIsAssignDialogOpen(false)
      setSelectedOwnerId('')
      mutate() // Refresh the unit data
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign owner')
    }
  }

  const handleRemoveOwner = async () => {
    try {
      await removeOwner(unitId)
      toast.success('Owner removed successfully')
      mutate() // Refresh the unit data
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove owner')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Units
          </Button>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !unit) {
    return (
      <div className="max-w-[1440px] mx-auto p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/units')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Units
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load unit details'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/units')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Units
          </Button>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {unit.ownerId ? (
              <Button
                variant="outline"
                onClick={() => handleRemoveOwner()}
                disabled={isAssigning}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Owner
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Owner
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Unit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Unit
            </Button>
          </div>
        )}
      </div>

      {/* Unit Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Home className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl">{unit.unitNumber}</CardTitle>
              </div>
              {unit.description && (
                <CardDescription className="text-base">
                  {unit.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Unit Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Building */}
            {unit.buildingName && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Building</span>
                </div>
                <p className="text-lg">{unit.buildingName}</p>
              </div>
            )}

            {/* Project */}
            {unit.project && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Project</span>
                </div>
                <p className="text-lg">{unit.project.name}</p>
              </div>
            )}

            {/* Floor */}
            {unit.floor !== null && unit.floor !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium">Floor</span>
                </div>
                <p className="text-lg">Floor {unit.floor}</p>
              </div>
            )}

            {/* Area */}
            {unit.area && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  <span className="text-sm font-medium">Area</span>
                </div>
                <p className="text-lg">{formatArea(unit.area)}</p>
              </div>
            )}

            {/* Bedrooms */}
            {unit.bedrooms !== null && unit.bedrooms !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bed className="h-4 w-4" />
                  <span className="text-sm font-medium">Bedrooms</span>
                </div>
                <p className="text-lg">{unit.bedrooms} {unit.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</p>
              </div>
            )}

            {/* Bathrooms */}
            {unit.bathrooms !== null && unit.bathrooms !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bath className="h-4 w-4" />
                  <span className="text-sm font-medium">Bathrooms</span>
                </div>
                <p className="text-lg">{unit.bathrooms} {unit.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</p>
              </div>
            )}

            {/* Owner */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Owner</span>
              </div>
              <p className="text-lg">
                {unit.owner ? (unit.owner.name || unit.owner.email) : 'Unassigned'}
              </p>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-lg">{formatDate(unit.createdAt)}</p>
            </div>

            {/* Last Updated */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <p className="text-lg">{formatDate(unit.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snagging Section - Admin creates/manages, owners view via widget */}
      {isAdmin && (
        <UnitSnaggingList
          unitId={unitId}
          unitNumber={unit.unitNumber}
          ownerId={unit.ownerId || undefined}
        />
      )}

      {/* Snagging Widget - For owners to view and accept snaggings */}
      {!isAdmin && (
        <UnitSnaggingWidget
          unitId={unitId}
          userRole="OWNER"
        />
      )}

      {/* Handovers Section - Admin only (owners access via unit widget) */}
      {isAdmin && (
        <UnitHandoversList
          unitId={unitId}
          unitNumber={unit.unitNumber}
          ownerId={unit.ownerId}
        />
      )}

      {/* Handover Widget - For owners to accept handovers */}
      {!isAdmin && (
        <UnitHandoverWidget
          unitId={unitId}
          unitName={`Unit ${unit.unitNumber}`}
        />
      )}

      {/* Documents Section */}
      <UnitDocumentsSection
        unitId={unitId}
        unitNumber={unit.unitNumber}
      />

      {/* Audit Logs Section - Only visible to admins */}
      {isAdmin && (
        <AuditLogsTable
          auditLogs={auditLogs}
          isLoading={auditLoading}
          showActor={true}
          showEntity={false}
          compact={true}
        />
      )}

      {/* Edit Dialog - Using FormDialog Pattern */}
      {isAdmin && (
        <FormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Unit"
          description="Update the unit details below"
          submitText="Update Unit"
          onSubmit={handleSubmitUnit}
          isLoading={isUpdating}
          maxWidth="2xl"
        >
          <Form {...form}>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Unit Number */}
                <FormField
                  control={form.control}
                  name="unitNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A-101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Building Name */}
                <FormField
                  control={form.control}
                  name="buildingName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tower A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project */}
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Project</SelectItem>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Floor */}
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Area */}
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sq m)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 75.5"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bedrooms */}
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bathrooms */}
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details about the unit..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description or notes about the unit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </FormDialog>
      )}

      {/* Assign Owner Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Owner</DialogTitle>
            <DialogDescription>
              Select an owner to assign to unit {unit.unitNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
              <SelectContent>
                {users?.filter(u => u.id !== unit.ownerId).map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignOwner}
              disabled={!selectedOwnerId || isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign Owner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete unit
              "{unit.unitNumber}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}