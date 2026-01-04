/**
 * Snagging Hooks
 * SWR hooks for snagging data fetching and mutations
 */

'use client'

import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import snaggingService from '@/lib/api/snagging.service'
import {
  CreateSnaggingDto,
  UpdateSnaggingDto,
  CreateSnaggingMessageDto,
  UpdateSnaggingMessageDto,
  SnaggingFilters,
  Snagging,
  SnaggingMessage
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
  messages: (snaggingId: string, page?: number) =>
    [...snaggingKeys.detail(snaggingId), 'messages', { page }] as const,
}

// =============== Fetcher Functions ===============

const fetchSnaggings = async (key: any[]) => {
  const filters = key[key.length - 1] as SnaggingFilters
  return snaggingService.getSnaggings(filters)
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

const fetchSnaggingMessages = async (key: any[]) => {
  const snaggingId = key[2] as string
  const options = key[key.length - 1] as { page?: number }
  return snaggingService.getSnaggingMessages(snaggingId, options.page || 1, 20)
}

// =============== SWR Hooks ===============

/**
 * Hook to fetch snaggings list (admin view)
 */
export function useSnaggings(filters: SnaggingFilters = {}) {
  const { userRole } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    userRole === 'admin' ? snaggingKeys.list(filters) : null,
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
  const { userRole } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    userRole === 'owner' ? snaggingKeys.my(filters) : null,
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

/**
 * Hook to fetch snagging messages with pagination
 */
export function useSnaggingMessages(snaggingId: string, page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    snaggingId ? snaggingKeys.messages(snaggingId, page) : null,
    fetchSnaggingMessages,
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
 * Hook to update a snagging
 */
export function useUpdateSnagging() {
  const { trigger, isMutating } = useSWRMutation(
    'update-snagging',
    async (_key, { arg }: { arg: { id: string; data: UpdateSnaggingDto } }) => {
      const result = await snaggingService.updateSnagging(arg.id, arg.data)

      // Update cache optimistically
      mutate(
        snaggingKeys.detail(arg.id),
        (current: any) => ({ ...current, ...arg.data }),
        false
      )

      // Invalidate lists
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'snaggings' && key[1] === 'list') {
          return true
        }
        return false
      })

      // Revalidate detail
      mutate(snaggingKeys.detail(arg.id))

      toast.success('Snagging updated successfully')
      return result
    },
    {
      onError: (error: any) => {
        toast.error('Failed to update snagging')
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
 * Hook to create a snagging message
 */
export function useCreateSnaggingMessage(snaggingId: string) {
  const { userId, userName } = useAuth()

  const { trigger, isMutating } = useSWRMutation(
    ['create-message', snaggingId],
    async (_key, { arg }: { arg: CreateSnaggingMessageDto }) => {
      const result = await snaggingService.createSnaggingMessage(snaggingId, arg)

      // Invalidate messages cache
      mutate(snaggingKeys.messages(snaggingId))

      // Update snagging detail (message count)
      mutate(snaggingKeys.detail(snaggingId))

      return result
    },
    {
      onError: (error: any) => {
        toast.error('Failed to send message')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to update a snagging message
 */
export function useUpdateSnaggingMessage(snaggingId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['update-message', snaggingId],
    async (_key, { arg }: { arg: { messageId: string; data: UpdateSnaggingMessageDto } }) => {
      const result = await snaggingService.updateSnaggingMessage(
        snaggingId,
        arg.messageId,
        arg.data
      )

      // Optimistically update the message
      mutate(
        snaggingKeys.messages(snaggingId),
        (current: any) => {
          if (current?.data) {
            return {
              ...current,
              data: current.data.map((msg: SnaggingMessage) =>
                msg.id === arg.messageId
                  ? { ...msg, bodyText: arg.data.bodyText || msg.bodyText, content: arg.data.bodyText || msg.content, isEdited: true }
                  : msg
              ),
            }
          }
          return current
        },
        false
      )

      // Revalidate
      mutate(snaggingKeys.messages(snaggingId))

      toast.success('Message updated')
      return result
    },
    {
      onError: (error: any) => {
        toast.error('Failed to update message')
      }
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to delete a snagging message
 */
export function useDeleteSnaggingMessage(snaggingId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['delete-message', snaggingId],
    async (_key, { arg }: { arg: string }) => {
      await snaggingService.deleteSnaggingMessage(snaggingId, arg)

      // Optimistically remove the message
      mutate(
        snaggingKeys.messages(snaggingId),
        (current: any) => {
          if (current?.data) {
            return {
              ...current,
              data: current.data.filter((msg: SnaggingMessage) => msg.id !== arg),
            }
          }
          return current
        },
        false
      )

      // Revalidate
      mutate(snaggingKeys.messages(snaggingId))
      mutate(snaggingKeys.detail(snaggingId))

      toast.success('Message deleted')
    },
    {
      onError: (error: any) => {
        toast.error('Failed to delete message')
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