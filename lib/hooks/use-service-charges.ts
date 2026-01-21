import useSWR, { mutate } from 'swr'
import serviceChargeService from '@/lib/api/service-charge.service'
import {
  ProjectServiceChargeFilters,
  UnitServiceChargeFilters,
  CreateProjectServiceChargeDto,
  UpdateProjectServiceChargeDto,
  OverrideUnitServiceChargeDto,
} from '@/lib/types/service-charge.types'
import { useState } from 'react'

/**
 * Hook to fetch all project service charges (Admin only)
 */
export function useProjectServiceCharges(filters?: ProjectServiceChargeFilters | null) {
  const { data, error, isLoading } = useSWR(
    filters !== null ? ['project-service-charges', filters] : null,
    () => serviceChargeService.getAllProjectServiceCharges(filters!),
    { revalidateOnFocus: false }
  )

  return {
    serviceCharges: data?.data ?? [],
    pagination: data?.meta,
    isLoading,
    error,
    mutate: () => mutate(['project-service-charges', filters]),
  }
}

/**
 * Hook to fetch a single project service charge by ID (Admin only)
 */
export function useProjectServiceCharge(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? ['project-service-charge', id] : null,
    () => (id ? serviceChargeService.getProjectServiceChargeById(id) : null),
    { revalidateOnFocus: false }
  )

  return {
    serviceCharge: data?.data,
    isLoading,
    error,
    mutate: () => mutate(['project-service-charge', id]),
  }
}

/**
 * Hook to fetch unit service charges for a project service charge (Admin only)
 */
export function useUnitServiceCharges(
  projectServiceChargeId: string | null,
  filters?: { page?: number; limit?: number }
) {
  const { data, error, isLoading } = useSWR(
    projectServiceChargeId ? ['unit-service-charges', projectServiceChargeId, filters] : null,
    () =>
      projectServiceChargeId
        ? serviceChargeService.getUnitServiceCharges(projectServiceChargeId, filters)
        : null,
    { revalidateOnFocus: false }
  )

  return {
    unitCharges: data?.data ?? [],
    pagination: data?.meta,
    isLoading,
    error,
    mutate: () => mutate(['unit-service-charges', projectServiceChargeId, filters]),
  }
}

/**
 * Hook to fetch owner service charges (Owner only)
 */
export function useOwnerServiceCharges(filters?: UnitServiceChargeFilters | null) {
  const { data, error, isLoading } = useSWR(
    filters !== null ? ['owner-service-charges', filters] : null,
    () => serviceChargeService.getOwnerServiceCharges(filters!),
    { revalidateOnFocus: false }
  )

  return {
    serviceCharges: data?.data ?? [],
    pagination: data?.meta,
    isLoading,
    error,
    mutate: () => mutate(['owner-service-charges', filters]),
  }
}

/**
 * Hook to fetch units for a project (for service charge creation)
 */
export function useUnitsForProject(projectId: string | null) {
  const { data, error, isLoading } = useSWR(
    projectId ? ['units-for-project', projectId] : null,
    () => (projectId ? serviceChargeService.getUnitsForProject(projectId) : null),
    { revalidateOnFocus: false }
  )

  return {
    units: data?.data ?? [],
    isLoading,
    error,
  }
}

/**
 * Hook to fetch all units from all projects (for service charge creation)
 */
export function useAllUnitsForServiceCharge() {
  const { data, error, isLoading } = useSWR(
    'all-units-for-service-charge',
    () => serviceChargeService.getAllUnitsForServiceCharge(),
    { revalidateOnFocus: false }
  )

  return {
    units: data?.data ?? [],
    isLoading,
    error,
  }
}

/**
 * Mutations for project service charges (Admin only)
 */
export function useProjectServiceChargeMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const createProjectServiceCharge = async (data: CreateProjectServiceChargeDto) => {
    setIsCreating(true)
    try {
      const result = await serviceChargeService.createProjectServiceCharge(data)
      mutate((key) => Array.isArray(key) && key[0] === 'project-service-charges')
      return result
    } finally {
      setIsCreating(false)
    }
  }

  const updateProjectServiceCharge = async (
    id: string,
    data: UpdateProjectServiceChargeDto
  ) => {
    setIsUpdating(true)
    try {
      const result = await serviceChargeService.updateProjectServiceCharge(id, data)
      mutate((key) => Array.isArray(key) && key[0] === 'project-service-charges')
      mutate(['project-service-charge', id])
      return result
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteProjectServiceCharge = async (id: string) => {
    setIsDeleting(true)
    try {
      const result = await serviceChargeService.deleteProjectServiceCharge(id)
      mutate((key) => Array.isArray(key) && key[0] === 'project-service-charges')
      return result
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    createProjectServiceCharge,
    updateProjectServiceCharge,
    deleteProjectServiceCharge,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

/**
 * Mutations for unit service charges (Admin only)
 */
export function useUnitServiceChargeMutations() {
  const [isOverriding, setIsOverriding] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const overrideUnitServiceCharge = async (
    id: string,
    data: OverrideUnitServiceChargeDto
  ) => {
    setIsOverriding(true)
    try {
      const result = await serviceChargeService.overrideUnitServiceCharge(id, data)
      mutate((key) => Array.isArray(key) && key[0] === 'unit-service-charges')
      return result
    } finally {
      setIsOverriding(false)
    }
  }

  const generatePdfStatement = async (id: string) => {
    setIsGeneratingPdf(true)
    try {
      const result = await serviceChargeService.generatePdfStatement(id)
      mutate((key) => Array.isArray(key) && key[0] === 'unit-service-charges')
      mutate((key) => Array.isArray(key) && key[0] === 'owner-service-charges')
      return result
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const downloadPdfStatement = async (id: string) => {
    const result = await serviceChargeService.downloadPdfStatement(id)
    if (result.data.url) {
      window.open(result.data.url, '_blank')
    }
    return result
  }

  return {
    overrideUnitServiceCharge,
    generatePdfStatement,
    downloadPdfStatement,
    isOverriding,
    isGeneratingPdf,
  }
}
