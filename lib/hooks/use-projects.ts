/**
 * Projects Hooks
 * SWR hooks for projects data fetching and mutations
 */

'use client'

import useSWR from 'swr'
import { useState } from 'react'
import projectsService from '@/lib/api/projects.service'
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilters,
  ProjectsResponse,
  SingleProjectResponse,
} from '@/lib/types/api.types'

/**
 * Hook to fetch projects list with pagination and filtering
 */
export function useProjects(filters?: ProjectFilters) {
  const queryString = filters ? new URLSearchParams(filters as any).toString() : ''
  const { data, error, isLoading, mutate } = useSWR<ProjectsResponse>(
    `/projects${queryString ? `?${queryString}` : ''}`,
    () => projectsService.getProjects(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    projects: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<SingleProjectResponse>(
    id ? `/projects/${id}` : null,
    () => projectsService.getProject(id!),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    project: data?.project,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for project mutations (create, update, delete)
 */
export function useProjectMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProject = async (data: CreateProjectDto) => {
    try {
      setIsCreating(true)
      setError(null)
      const response = await projectsService.createProject(data)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create project'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const updateProject = async (id: string, data: UpdateProjectDto) => {
    try {
      setIsUpdating(true)
      setError(null)
      const response = await projectsService.updateProject(id, data)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update project'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      setIsDeleting(true)
      setError(null)
      const response = await projectsService.deleteProject(id)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete project'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    createProject,
    updateProject,
    deleteProject,
    isCreating,
    isUpdating,
    isDeleting,
    error,
  }
}

/**
 * Hook to format project dates for display
 */
export function useProjectFormatters() {
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
        }
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
        }
      case 'on-hold':
        return {
          label: 'On Hold',
          className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
        }
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
        }
    }
  }

  return {
    formatDate,
    formatStatus,
  }
}