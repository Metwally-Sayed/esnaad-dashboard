/**
 * Units Hooks
 * SWR hooks for units data fetching and mutations
 */

'use client'

import useSWR from 'swr'
import { useState } from 'react'
import unitsService from '@/lib/api/units.service'
import {
  Unit,
  CreateUnitDto,
  UpdateUnitDto,
  AssignOwnerDto,
  UnitFilters
} from '@/lib/types/api.types'

interface UnitsResponse {
  data: Unit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface SingleUnitResponse {
  unit: Unit
}

/**
 * Hook to fetch units list with pagination and filtering
 */
export function useUnits(filters?: UnitFilters) {
  const queryString = filters ? new URLSearchParams(filters as any).toString() : ''
  const { data, error, isLoading, mutate } = useSWR<UnitsResponse>(
    `/units${queryString ? `?${queryString}` : ''}`,
    () => unitsService.getUnits(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    units: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook to fetch a single unit by ID
 */
export function useUnit(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<SingleUnitResponse>(
    id ? `/units/${id}` : null,
    () => unitsService.getUnit(id!),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    unit: data?.unit,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for unit mutations (create, update, delete, assign/remove owner)
 */
export function useUnitMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUnit = async (data: CreateUnitDto) => {
    try {
      setIsCreating(true)
      setError(null)
      const response = await unitsService.createUnit(data)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create unit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const updateUnit = async (id: string, data: UpdateUnitDto) => {
    try {
      setIsUpdating(true)
      setError(null)
      const response = await unitsService.updateUnit(id, data)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update unit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteUnit = async (id: string) => {
    try {
      setIsDeleting(true)
      setError(null)
      const response = await unitsService.deleteUnit(id)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete unit'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const assignOwner = async (id: string, data: AssignOwnerDto) => {
    try {
      setIsAssigning(true)
      setError(null)
      const response = await unitsService.assignOwner(id, data)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to assign owner'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsAssigning(false)
    }
  }

  const removeOwner = async (id: string) => {
    try {
      setIsAssigning(true)
      setError(null)
      const response = await unitsService.removeOwner(id)
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove owner'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsAssigning(false)
    }
  }

  return {
    createUnit,
    updateUnit,
    deleteUnit,
    assignOwner,
    removeOwner,
    isCreating,
    isUpdating,
    isDeleting,
    isAssigning,
    error,
  }
}

/**
 * Hook to format unit data for display
 */
export function useUnitFormatters() {
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatArea = (area?: number | null): string => {
    if (!area) return '-'
    return `${area} m²`
  }

  return {
    formatDate,
    formatArea,
  }
}