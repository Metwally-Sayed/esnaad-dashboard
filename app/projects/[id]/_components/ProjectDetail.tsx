'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  ChevronRight,
  CalendarIcon,
  Loader2
} from 'lucide-react'
import { useProject, useProjectMutations, useProjectFormatters } from '@/lib/hooks/use-projects'
import { useUnits, useUnitMutations } from '@/lib/hooks/use-units'
import { useAuth } from '@/contexts/AuthContext'
import { FormDialog } from '@/components/ui/form-dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ProjectUnitsTable } from '@/components/ProjectUnitsTable'
import { AuditLogsTable } from '@/components/AuditLogsTable'
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
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { UnitFilters, UpdateProjectDto } from '@/lib/types/api.types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Form schema
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(['active', 'completed', 'on-hold'] as const).optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectDetailsPageProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailsPageProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { project, isLoading, error, mutate } = useProject(projectId)
  const { deleteProject, isDeleting, updateProject, isUpdating } = useProjectMutations()
  const { deleteUnit, isDeleting: isDeletingUnit } = useUnitMutations()
  const { formatDate, formatStatus } = useProjectFormatters()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form initialization for edit dialog
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      status: 'active',
      imageUrl: '',
    },
  })

  // Load project data when editing
  useEffect(() => {
    if (project && isEditDialogOpen) {
      form.reset({
        name: project.name,
        description: project.description || '',
        location: project.location || '',
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        status: project.status,
        imageUrl: project.imageUrl || '',
      })
    }
  }, [project, isEditDialogOpen, form])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isEditDialogOpen) {
      form.reset()
    }
  }, [isEditDialogOpen, form])

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

  const handleProjectSubmit = async (data: ProjectFormData) => {
    try {
      const projectData = {
        name: data.name,
        description: data.description || undefined,
        location: data.location || undefined,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        status: data.status,
        imageUrl: data.imageUrl || undefined,
      }

      await updateProject(projectId, projectData as UpdateProjectDto)
      toast.success('Project updated successfully')
      setIsEditDialogOpen(false)
      mutate() // Refresh the project data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project')
    }
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
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Back</span>
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
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Back</span>
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
    <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit Project</span>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete Project</span>
            </Button>
          </div>
        )}
      </div>

      {/* Project Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <CardTitle className="text-2xl sm:text-3xl">{project.name}</CardTitle>
                <Badge className={status.className}>
                  {status.label}
                </Badge>
              </div>
              {project.description && (
                <CardDescription className="text-sm sm:text-base">
                  {project.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Project Image */}
          {project.imageUrl && (
            <div className="mb-4 sm:mb-6">
              <Image
                src={project.imageUrl}
                alt={project.name}
                width={1200}
                height={256}
                className="w-full h-48 sm:h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Project Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Location */}
            {project.location && (
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-base sm:text-lg">{project.location}</p>
              </div>
            )}

            {/* Start Date */}
            {project.startDate && (
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Start Date</span>
                </div>
                <p className="text-base sm:text-lg">{formatDate(project.startDate)}</p>
              </div>
            )}

            {/* End Date */}
            {project.endDate && (
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">End Date</span>
                </div>
                <p className="text-base sm:text-lg">{formatDate(project.endDate)}</p>
              </div>
            )}

            {/* Total Units */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Total Units</span>
              </div>
              <p className="text-base sm:text-lg">{unitCount} units</p>
            </div>

            {/* Created Date */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-base sm:text-lg">{formatDate(project.createdAt)}</p>
            </div>

            {/* Last Updated */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <p className="text-base sm:text-lg">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Home className="h-5 w-5" />
                Project Units
              </CardTitle>
              <CardDescription className="text-sm">
                Manage and view all units in this project
              </CardDescription>
            </div>
            {isAdmin && (
              <Button
                onClick={() => router.push(`/units/create?projectId=${projectId}`)}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Units Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-background p-2 sm:p-3 rounded-lg border">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Units</p>
              <p className="text-xl sm:text-2xl font-bold">{unitsPagination?.total || 0}</p>
            </div>
            <div className="bg-background p-2 sm:p-3 rounded-lg border">
              <p className="text-xs sm:text-sm text-muted-foreground">Available</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {units.filter(u => !u.ownerId).length}
              </p>
            </div>
            <div className="bg-background p-2 sm:p-3 rounded-lg border">
              <p className="text-xs sm:text-sm text-muted-foreground">Occupied</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {units.filter(u => u.ownerId).length}
              </p>
            </div>
            <div className="bg-background p-2 sm:p-3 rounded-lg border">
              <p className="text-xs sm:text-sm text-muted-foreground">Maintenance</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-4">
                <div className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
                  Showing {(unitsPagination.page - 1) * unitsPagination.limit + 1} to{' '}
                  {Math.min(unitsPagination.page * unitsPagination.limit, unitsPagination.total)} of{' '}
                  {unitsPagination.total} units
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={unitsPagination.page === 1}
                    onClick={() => handleUnitsPageChange(unitsPagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <div className="flex items-center gap-1 overflow-x-auto">
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
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
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
        <FormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Project"
          description="Update the project details below."
          submitText="Update Project"
          onSubmit={form.handleSubmit(handleProjectSubmit)}
          isLoading={isUpdating}
          maxWidth="lg"
        >
          <Form {...form}>
            <div className="space-y-4 sm:space-y-6">
              {/* Project Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter project name"
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter project description"
                        rows={3}
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter project location"
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isUpdating}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isUpdating}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isUpdating}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image URL */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Add a cover image URL for the project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </FormDialog>
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