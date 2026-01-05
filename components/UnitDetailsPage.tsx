'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  UserMinus
} from 'lucide-react'
import { useUnit, useUnitMutations, useUnitFormatters } from '@/lib/hooks/use-units'
import { useAuth } from '@/contexts/AuthContext'
import { UnitDialog } from './UnitDialog'
import { SnaggingList } from './snagging/SnaggingList'
import { AuditLogsTable } from './AuditLogsTable'
import { useUnitAuditLogs } from '@/lib/hooks/use-audit-logs'
import { UnitHandoversList } from './handover/UnitHandoversList'
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

interface UnitDetailsPageProps {
  unitId: string
}

export function UnitDetailsPage({ unitId }: UnitDetailsPageProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { unit, isLoading, error, mutate } = useUnit(unitId)
  const { deleteUnit, assignOwner, removeOwner, isDeleting, isAssigning } = useUnitMutations()
  const { formatDate, formatArea } = useUnitFormatters()
  const { users } = useUsers({ role: 'OWNER', limit: 100 }) // Get all owners for assignment
  const { auditLogs, isLoading: auditLoading } = useUnitAuditLogs(unitId, {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState('')

  const handleDelete = async () => {
    try {
      await deleteUnit(unitId)
      toast.success('Unit deleted successfully')
      router.push('/units')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete unit')
    }
  }

  const handleUnitSaved = () => {
    setIsEditDialogOpen(false)
    mutate() // Refresh the unit data
  }

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

      {/* Snagging Section */}
      <SnaggingList
        unitId={unitId}
        unitNumber={unit.unitNumber}
        ownerId={unit.ownerId || undefined}
      />

      {/* Handovers Section */}
      <UnitHandoversList
        unitId={unitId}
        unitNumber={unit.unitNumber}
        ownerId={unit.ownerId}
      />

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

      {/* Edit Dialog */}
      {isAdmin && (
        <UnitDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          unitId={unitId}
          onSave={handleUnitSaved}
        />
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