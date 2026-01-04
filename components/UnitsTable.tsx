'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
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
  Home,
  Building2,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  User,
  MapPin,
  Ruler
} from 'lucide-react'
import { Unit } from '@/lib/types/api.types'
import { useUnitFormatters } from '@/lib/hooks/use-units'
import { EmptyState } from './ui/empty-state'

interface UnitsTableProps {
  units: Unit[]
  isLoading: boolean
  onEdit?: (unitId: string) => void
  onDelete?: (unitId: string) => void
  isDeleting?: boolean
}

export function UnitsTable({
  units,
  isLoading,
  onEdit,
  onDelete,
  isDeleting
}: UnitsTableProps) {
  const router = useRouter()
  const { formatDate, formatArea } = useUnitFormatters()
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null)

  const handleView = (unitId: string) => {
    router.push(`/units/${unitId}`)
  }

  const handleDeleteClick = (unitId: string) => {
    setDeleteUnitId(unitId)
  }

  const handleDeleteConfirm = async () => {
    if (deleteUnitId && onDelete) {
      await onDelete(deleteUnitId)
      setDeleteUnitId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Number</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Bedrooms</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!units || units.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title="No units found"
        description="No units match your current filters. Try adjusting your search or filters to see results"
      />
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Unit Number</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Building</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[120px]">Project</TableHead>
                <TableHead className="hidden sm:table-cell">Floor</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead className="hidden lg:table-cell">Beds/Baths</TableHead>
                <TableHead className="min-w-[120px]">Owner</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {units.map((unit) => {
              return (
                <TableRow key={unit.id} className="cursor-pointer" onClick={() => handleView(unit.id)}>
                  <TableCell className="font-medium min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      {unit.unitNumber}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell min-w-[120px]">
                    {unit.buildingName ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {unit.buildingName}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell min-w-[120px]">
                    {unit.project ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {unit.project.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {unit.floor ? `Floor ${unit.floor}` : '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {unit.area ? (
                      <div className="flex items-center gap-1">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        {formatArea(unit.area)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">
                      {unit.bedrooms || 0} / {unit.bathrooms || 0}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {unit.owner ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{unit.owner.name || unit.owner.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(unit.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(unit.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Unit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(unit.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Unit
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUnitId} onOpenChange={() => setDeleteUnitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this unit
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Unit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}