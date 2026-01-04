'use client'

import { useState } from 'react'
import { ProjectsTable } from './ProjectsTable'
import { ProjectsFilters } from './ProjectsFilters'
import { ProjectDialog } from './ProjectDialog'
import { Button } from './ui/button'
import { Plus, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects, useProjectMutations } from '@/lib/hooks/use-projects'
import { ProjectFilters } from '@/lib/types/api.types'
import { toast } from 'sonner'

export function ProjectsPage() {
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { projects = [], pagination, isLoading, mutate } = useProjects(filters)
  const { deleteProject, isDeleting } = useProjectMutations()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const handleAddProject = () => {
    setSelectedProject(null)
    setIsDialogOpen(true)
  }

  const handleEditProject = (projectId: string) => {
    setSelectedProject(projectId)
    setIsDialogOpen(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      toast.success('Project deleted successfully')
      mutate() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project')
    }
  }

  const handleProjectSaved = () => {
    setIsDialogOpen(false)
    setSelectedProject(null)
    mutate() // Refresh the list
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

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

      {/* Add/Edit Dialog */}
      {isAdmin && (
        <ProjectDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          projectId={selectedProject}
          onSave={handleProjectSaved}
        />
      )}
    </div>
  )
}