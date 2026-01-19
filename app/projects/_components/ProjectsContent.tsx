'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ProjectsTable } from '@/components/ProjectsTable'
import { ProjectsFilters } from '@/components/ProjectsFilters'
import { Button } from '@/components/ui/button'
import { Plus, Building2, ChevronLeft, ChevronRight, CalendarIcon, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects, useProjectMutations, useProject } from '@/lib/hooks/use-projects'
import { ProjectFilters, CreateProjectDto, UpdateProjectDto } from '@/lib/types/api.types'
import { toast } from 'sonner'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Project form validation schema
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

export function ProjectsContent() {
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { projects = [], pagination, isLoading, mutate } = useProjects(filters)
  const { deleteProject, isDeleting, createProject, updateProject, isCreating, isUpdating } = useProjectMutations()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const { project: selectedProject, isLoading: isLoadingProject } = useProject(selectedProjectId || undefined)
  const isEditMode = !!selectedProjectId

  // Form setup
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
    if (selectedProject && isEditMode) {
      form.reset({
        name: selectedProject.name,
        description: selectedProject.description || '',
        location: selectedProject.location || '',
        startDate: selectedProject.startDate ? new Date(selectedProject.startDate) : undefined,
        endDate: selectedProject.endDate ? new Date(selectedProject.endDate) : undefined,
        status: selectedProject.status,
        imageUrl: selectedProject.imageUrl || '',
      })
    }
  }, [selectedProject, isEditMode, form])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset()
      setSelectedProjectId(null)
    }
  }, [isDialogOpen, form])

  const handleAddProject = useCallback(() => {
    setSelectedProjectId(null)
    setIsDialogOpen(true)
  }, [])

  const handleEditProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
    setIsDialogOpen(true)
  }, [])

  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      await deleteProject(projectId)
      toast.success('Project deleted successfully')
      mutate() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project')
    }
  }, [deleteProject, mutate])

  const handleSubmitProject = useMemo(() => form.handleSubmit(async (data) => {
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

      if (isEditMode && selectedProjectId) {
        await updateProject(selectedProjectId, projectData as UpdateProjectDto)
        toast.success('Project updated successfully')
      } else {
        await createProject(projectData as CreateProjectDto)
        toast.success('Project created successfully')
      }

      setIsDialogOpen(false)
      setSelectedProjectId(null)
      form.reset()
      mutate() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} project`)
    }
  }), [form, isEditMode, selectedProjectId, updateProject, createProject, mutate])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Projects</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage and monitor all property projects' : 'View property projects and their units'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="text-2xl font-bold">{pagination?.total || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-blue-600">
            {Array.isArray(projects) ? projects.filter(p => p.status === 'completed').length : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">On Hold</p>
          <p className="text-2xl font-bold text-yellow-600">
            {Array.isArray(projects) ? projects.filter(p => p.status === 'on-hold').length : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProjectsFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Projects Table */}
      <div className="mb-6">
        <ProjectsTable
          projects={projects}
          isLoading={isLoading}
          onEdit={isAdmin ? handleEditProject : undefined}
          onDelete={isAdmin ? handleDeleteProject : undefined}
          isDeleting={isDeleting}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} projects
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {(() => {
                const maxVisible = 5;
                let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
                let end = Math.min(pagination.totalPages, start + maxVisible - 1);

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
                    variant={page === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ));
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog - Using FormDialog Pattern */}
      {isAdmin && (
        <FormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={isEditMode ? 'Edit Project' : 'Add New Project'}
          description={isEditMode ? 'Update the project details below.' : 'Fill in the project details to create a new project.'}
          submitText={isEditMode ? 'Update Project' : 'Create Project'}
          onSubmit={handleSubmitProject}
          isLoading={isCreating || isUpdating}
          maxWidth="lg"
        >
          {isLoadingProject && isEditMode ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Form {...form}>
              <form className="space-y-6">
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
                          disabled={isCreating || isUpdating}
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
                          disabled={isCreating || isUpdating}
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
                          disabled={isCreating || isUpdating}
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
                                disabled={isCreating || isUpdating}
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
                            <Calendar
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
                                disabled={isCreating || isUpdating}
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
                            <Calendar
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
                        disabled={isCreating || isUpdating}
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
                          disabled={isCreating || isUpdating}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Add a cover image URL for the project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </FormDialog>
      )}
    </div>
  )
}