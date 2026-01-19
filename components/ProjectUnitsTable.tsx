'use client'

import { useState } from 'react'
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
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Home,
  Bed,
  Bath,
  Maximize,
  User,
  Search,
  Filter,
  X
} from 'lucide-react'
import { Unit, UnitFilters } from '@/lib/types/api.types'
import { useUnitFormatters } from '@/lib/hooks/use-units'
import { useRouter } from 'next/navigation'
import { EmptyState } from './ui/empty-state'

interface ProjectUnitsTableProps {
  units: Unit[]
  isLoading?: boolean
  onEdit?: (unitId: string) => void
  onDelete?: (unitId: string) => void
  isDeleting?: boolean
  filters?: UnitFilters
  onFilterChange?: (filters: Partial<UnitFilters>) => void
}

export function ProjectUnitsTable({
  units,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
  filters,
  onFilterChange
}: ProjectUnitsTableProps) {
  const router = useRouter()
  const { formatDate, formatArea } = useUnitFormatters()
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(filters?.search || '')
  const [showFilters, setShowFilters] = useState(false)

  const handleView = (unitId: string) => {
    router.push(`/units/${unitId}`)
  }

  const handleDelete = (unitId: string) => {
    setDeleteUnitId(unitId)
  }

  const confirmDelete = () => {
    if (deleteUnitId && onDelete) {
      onDelete(deleteUnitId)
      setDeleteUnitId(null)
    }
  }

  const handleSearch = () => {
    onFilterChange?.({ search: searchTerm })
  }


  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading Filters */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Loading Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Number</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search units by number or building..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSearch} variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>


        {/* Units Table */}
        {units.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No units found"
            description={filters?.search ? 'No units match your search criteria' : 'This project has no units yet'}
          />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Unit Number</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">Building</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[80px]">Floor</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[80px]">Area</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px]">Bedrooms</TableHead>
                    <TableHead className="min-w-[120px]">Owner</TableHead>
                    <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => {
                    return (
                      <TableRow key={unit.id}>
                        <TableCell>
                          <div className="font-medium">{unit.unitNumber}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-muted-foreground">
                            {unit.buildingName || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {unit.floor ? `Floor ${unit.floor}` : '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Maximize className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatArea(unit.area)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            {unit.bedrooms && (
                              <div className="flex items-center gap-1">
                                <Bed className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{unit.bedrooms}</span>
                              </div>
                            )}
                            {unit.bathrooms && (
                              <div className="flex items-center gap-1">
                                <Bath className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{unit.bathrooms}</span>
                              </div>
                            )}
                            {!unit.bedrooms && !unit.bathrooms && '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {unit.owner ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{unit.owner.name || unit.owner.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                        <div className="flex items-center justify-end">
                          {onEdit || onDelete ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isDeleting}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleView(unit.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {onEdit && (
                                  <DropdownMenuItem onClick={() => onEdit(unit.id)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Unit
                                  </DropdownMenuItem>
                                )}
                                {onDelete && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleDelete(unit.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Unit
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(unit.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUnitId} onOpenChange={() => setDeleteUnitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the unit
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}