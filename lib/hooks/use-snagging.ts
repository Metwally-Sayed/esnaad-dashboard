/**
 * Snagging Hooks (v2)
 * SWR hooks for snagging data fetching and mutations
 */

'use client'

import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import snaggingService from '@/lib/api/snagging.service'
import {
  CreateSnaggingDto,
  SnaggingFilters,
  Snagging,
  UpdateOwnerSignatureDto,
} from '@/lib/types/snagging.types'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

// =============== SWR Key Factory ===============

export const snaggingKeys = {
  all: ['snaggings'] as const,
  lists: () => [...snaggingKeys.all, 'list'] as const,
  list: (filters: SnaggingFilters) => [...snaggingKeys.lists(), filters] as const,
  my: (filters: SnaggingFilters) => [...snaggingKeys.all, 'my', filters] as const,
  unit: (unitId: string, filters: SnaggingFilters, isAdmin: boolean = false) =>
    [...snaggingKeys.all, 'unit', unitId, filters, isAdmin] as const,
  details: () => [...snaggingKeys.all, 'detail'] as const,
  detail: (id: string) => [...snaggingKeys.details(), id] as const,
}

// =============== Fetcher Functions ===============

const fetchSnaggings = async (key: any[]) => {
  const filters = key[key.length - 1] as SnaggingFilters
  return snaggingService.getAllSnaggings(filters)
}

const fetchMySnaggings = async (key: any[]) => {
  const filters = key[key.length - 1] as SnaggingFilters
  return snaggingService.getMySnaggings(filters)
}

const fetchUnitSnaggings = async (key: any[]) => {
  const unitId = key[2] as string
  const filters = key[3] as SnaggingFilters
  const isAdmin = key[4] as boolean
  return snaggingService.getUnitSnaggings(unitId, filters, isAdmin)
}

const fetchSnagging = async (key: any[]) => {
  const id = key[key.length - 1] as string
  return snaggingService.getSnaggingById(id)
}

// =============== SWR Hooks ===============

/**
 * Hook to fetch snaggings list (admin view)
 */
export function useSnaggings(filters: SnaggingFilters = {}) {
  const { isAdmin } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    isAdmin ? snaggingKeys.list(filters) : null,
    fetchSnaggings,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

/**
 * Hook to fetch my snaggings (owner view)
 */
export function useMySnaggings(filters: SnaggingFilters = {}) {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const { data, error, isLoading, mutate } = useSWR(
    isOwner ? snaggingKeys.my(filters) : null,
    fetchMySnaggings,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

/**
 * Hook to fetch snaggings for a specific unit
 */
export function useUnitSnaggings(unitId: string, filters: SnaggingFilters = {}) {
  const { isAdmin } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    unitId ? snaggingKeys.unit(unitId, filters, isAdmin) : null,
    fetchUnitSnaggings,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

/**
 * Hook to fetch a single snagging
 */
export function useSnagging(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? snaggingKeys.detail(id) : null,
    fetchSnagging,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

// =============== SWR Mutations ===============

/**
 * Hook to create a snagging
 */
export function useCreateSnagging() {
  const { trigger, isMutating } = useSWRMutation(
    'create-snagging',
    async (_key, { arg }: { arg: CreateSnaggingDto }) => {
      const result = await snaggingService.createSnagging(arg)

      // Invalidate relevant caches
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'snaggings') {
          return true
        }
        return false
      })

      toast.success('Snagging created successfully')
      return result
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to create snagging')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to delete a snagging
 */
export function useDeleteSnagging() {
  const { trigger, isMutating } = useSWRMutation(
    'delete-snagging',
    async (_key, { arg }: { arg: string }) => {
      await snaggingService.deleteSnagging(arg)

      // Invalidate caches
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'snaggings') {
          return true
        }
        return false
      })

      toast.success('Snagging deleted successfully')
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete snagging')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to update owner signature
 */
export function useUpdateOwnerSignature(snaggingId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['update-owner-signature', snaggingId],
    async (_key, { arg }: { arg: UpdateOwnerSignatureDto }) => {
      const result = await snaggingService.updateOwnerSignature(snaggingId, arg)

      // Revalidate snagging detail
      mutate(snaggingKeys.detail(snaggingId))

      toast.success('Signature updated and PDF regenerated')
      return result
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update signature')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to regenerate PDF
 */
export function useRegeneratePdf(snaggingId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['regenerate-pdf', snaggingId],
    async () => {
      const result = await snaggingService.regeneratePdf(snaggingId)

      // Revalidate snagging detail
      mutate(snaggingKeys.detail(snaggingId))

      toast.success('PDF regenerated successfully')
      return result
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to regenerate PDF')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to upload files
 */
export function useUploadFiles() {
  const { trigger, isMutating } = useSWRMutation(
    'upload-files',
    async (_key, { arg }: {
      arg: {
        files: File[]
        onProgress?: (fileName: string, progress: number) => void
      }
    }) => {
      return snaggingService.uploadFiles(arg.files, arg.onProgress)
    },
    {
      onError: (error: any) => {
        toast.error(error.message || 'Failed to upload files')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to schedule appointment (owner only)
 */
export function useScheduleAppointment(snaggingId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['schedule-appointment', snaggingId],
    async (_key, { arg }: { arg: { scheduledAt: string; scheduledNote?: string } }) => {
      const result = await snaggingService.scheduleAppointment(snaggingId, arg)

      // Revalidate snagging detail
      mutate(snaggingKeys.detail(snaggingId))

      toast.success('Appointment scheduled successfully')
      return result
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to schedule appointment')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to send snagging to owner (admin only)
 */
export function useSendToOwner(snaggingId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['send-to-owner', snaggingId],
    async () => {
      const result = await snaggingService.sendToOwner(snaggingId)

      // Revalidate snagging detail and lists
      mutate(snaggingKeys.detail(snaggingId))
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'snaggings') {
          return true
        }
        return false
      })

      toast.success('Snagging sent to owner successfully.')
      return result
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to send snagging')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to accept snagging (owner only)
 */
export function useAcceptSnagging(snaggingId: string) {
  const { trigger, isMutating} = useSWRMutation(
    ['accept-snagging', snaggingId],
    async () => {
      const result = await snaggingService.acceptSnagging(snaggingId)

      // Revalidate snagging detail and unit list
      mutate(snaggingKeys.detail(snaggingId))
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'snaggings') {
          return true
        }
        return false
      })

      toast.success('Snagging accepted successfully. PDF has been generated.')
      return result
    },
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to accept snagging')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}
