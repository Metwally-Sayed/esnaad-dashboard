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
  Building2,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Home,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useProject, useProjectMutations, useProjectFormatters } from '@/lib/hooks/use-projects'
import { useUnits, useUnitMutations } from '@/lib/hooks/use-units'
import { useAuth } from '@/contexts/AuthContext'
import { ProjectDialog } from './ProjectDialog'
import { ProjectUnitsTable } from './ProjectUnitsTable'
import { AuditLogsTable } from './AuditLogsTable'
import { useProjectAuditLogs } from '@/lib/hooks/use-audit-logs'
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
import { toast } from 'sonner'
import { UnitFilters } from '@/lib/types/api.types'

interface ProjectDetailsPageProps {
  projectId: string
}

export function ProjectDetailsPage({ projectId }: ProjectDetailsPageProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { project, isLoading, error, mutate } = useProject(projectId)
  const { deleteProject, isDeleting } = useProjectMutations()
  const { deleteUnit, isDeleting: isDeletingUnit } = useUnitMutations()
  const { formatDate, formatStatus } = useProjectFormatters()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Units state
  const [unitsFilters, setUnitsFilters] = useState<UnitFilters>({
    projectId: projectId,
    page: 1,
    limit: 10,
    sortBy: 'unitNumber',
    sortOrder: 'asc'
  })

  const { units, pagination: unitsPagination, isLoading: isLoadingUnits, mutate: mutateUnits } = useUnits(unitsFilters)
  const { auditLogs, isLoading: auditLoading } = useProjectAuditLogs(projectId, {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const handleDelete = async () => {
    try {
      await deleteProject(projectId)
      toast.success('Project deleted successfully')
      router.push('/projects')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project')
    }
  }

  const handleProjectSaved = () => {
    setIsEditDialogOpen(false)
    mutate() // Refresh the project data
  }

  // Unit handlers
  const handleEditUnit = (unitId: string) => {
    router.push(`/units/${unitId}/edit`)
  }

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await deleteUnit(unitId)
      toast.success('Unit deleted successfully')
      mutateUnits() // Refresh the units list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete unit')
    }
  }

  const handleUnitsFilterChange = (filters: Partial<UnitFilters>) => {
    setUnitsFilters(prev => ({
      ...prev,
      ...filters,
      projectId: projectId, // Always keep projectId filter
      page: filters.search !== undefined ? 1 : prev.page
    }))
  }

  const handleUnitsPageChange = (page: number) => {
    setUnitsFilters(prev => ({ ...prev, page }))
  }

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
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

  if (error || !project) {
    return (
      <div className="max-w-[1440px] mx-auto p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load project details'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const status = formatStatus(project.status)
  // Check both _count.units and units array length
  const unitCount = project._count?.units || project.units?.length || 0

  return (
    <div className="max-w-[1440px] mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </div>
        )}
      </div>

      {/* Project Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl">{project.name}</CardTitle>
                <Badge className={status.className}>
                  {status.label}
                </Badge>
              </div>
              {project.description && (
                <CardDescription className="text-base">
                  {project.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Project Image */}
          {project.imageUrl && (
            <div className="mb-6">
              <img
                src={project.imageUrl}
                alt={project.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Project Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Location */}
            {project.location && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-lg">{project.location}</p>
              </div>
            )}

            {/* Start Date */}
            {project.startDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Start Date</span>
                </div>
                <p className="text-lg">{formatDate(project.startDate)}</p>
              </div>
            )}

            {/* End Date */}
            {project.endDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">End Date</span>
                </div>
                <p className="text-lg">{formatDate(project.endDate)}</p>
              </div>
            )}

            {/* Total Units */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Total Units</span>
              </div>
              <p className="text-lg">{unitCount} units</p>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-lg">{formatDate(project.createdAt)}</p>
            </div>

            {/* Last Updated */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <p className="text-lg">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Project Units
              </CardTitle>
              <CardDescription>
                Manage and view all units in this project
              </CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => router.push('/units/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Units Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Units</p>
              <p className="text-2xl font-bold">{unitsPagination?.total || 0}</p>
            </div>
            <div className="bg-background p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {units.filter(u => !u.ownerId).length}
              </p>
            </div>
            <div className="bg-background p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Occupied</p>
              <p className="text-2xl font-bold text-blue-600">
                {units.filter(u => u.ownerId).length}
              </p>
            </div>
            <div className="bg-background p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">
                0
              </p>
            </div>
          </div>

          {/* Units Table */}
          <ProjectUnitsTable
            units={units}
            isLoading={isLoadingUnits}
            onEdit={isAdmin ? handleEditUnit : undefined}
            onDelete={isAdmin ? handleDeleteUnit : undefined}
            isDeleting={isDeletingUnit}
            filters={unitsFilters}
            onFilterChange={handleUnitsFilterChange}
          />

          {/* Pagination */}
          {unitsPagination && unitsPagination.totalPages > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-muted-foreground text-sm">
                  Showing {(unitsPagination.page - 1) * unitsPagination.limit + 1} to{' '}
                  {Math.min(unitsPagination.page * unitsPagination.limit, unitsPagination.total)} of{' '}
                  {unitsPagination.total} units
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={unitsPagination.page === 1}
                    onClick={() => handleUnitsPageChange(unitsPagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const maxVisible = 5;
                      let start = Math.max(1, unitsPagination.page - Math.floor(maxVisible / 2));
                      let end = Math.min(unitsPagination.totalPages, start + maxVisible - 1);

                      if (end - start < maxVisible - 1) {
                        start = Math.max(1, end - maxVisible + 1);
                      }

                      const pages = [];
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      return pages.map((page) => (
                        <Button
                          key={page}
                          variant={page === unitsPagination.page ? 'default' : 'outline'}
                          size="sm"
                          className="w-9"
                          onClick={() => handleUnitsPageChange(page)}
                        >
                          {page}
                        </Button>
                      ));
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={unitsPagination.page === unitsPagination.totalPages}
                    onClick={() => handleUnitsPageChange(unitsPagination.page + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
        <ProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          projectId={projectId}
          onSave={handleProjectSaved}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{project.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}