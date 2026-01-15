/**
 * Requests/Invitations Hooks
 * SWR hooks for request data fetching and mutations
 */

'use client'

import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'
import { requestService } from '@/lib/api/request.service'
import {
  CreateRequestDto,
  ApproveRequestDto,
  RejectRequestDto,
  RequestFilters,
  Request,
} from '@/lib/types/request.types'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

// =============== SWR Key Factory ===============

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: RequestFilters) => [...requestKeys.lists(), filters] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
}

// =============== Fetcher Functions ===============

const fetchRequests = async (key: any[]) => {
  const filters = key[key.length - 1] as RequestFilters
  return requestService.list(filters)
}

const fetchRequest = async (key: any[]) => {
  const id = key[key.length - 1] as string
  return requestService.getById(id)
}

// =============== SWR Hooks ===============

/**
 * Hook to fetch requests list
 * - Admin: sees all requests with filters
 * - Owner: sees only their requests
 */
export function useRequests(filters: RequestFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    requestKeys.list(filters),
    fetchRequests,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    data: data?.data || [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  }
}

/**
 * Hook to fetch a single request
 */
export function useRequest(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? requestKeys.detail(id) : null,
    fetchRequest,
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
 * Hook to create a request
 */
export function useCreateRequest() {
  const { trigger, isMutating } = useSWRMutation(
    'create-request',
    async (_key, { arg }: { arg: CreateRequestDto }) => {
      const result = await requestService.create(arg)

      // Invalidate relevant caches
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'requests') {
          return true
        }
        return false
      })

      toast.success('Request submitted successfully')
      return result
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to approve a request (admin only)
 */
export function useApproveRequest(requestId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['approve-request', requestId],
    async (_key, { arg }: { arg: ApproveRequestDto }) => {
      const result = await requestService.approve(requestId, arg)

      // Revalidate request detail and lists
      mutate(requestKeys.detail(requestId))
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'requests' && key[1] === 'list') {
          return true
        }
        return false
      })

      return result
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to reject a request (admin only)
 */
export function useRejectRequest(requestId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['reject-request', requestId],
    async (_key, { arg }: { arg: RejectRequestDto }) => {
      const result = await requestService.reject(requestId, arg)

      // Revalidate request detail and lists
      mutate(requestKeys.detail(requestId))
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'requests' && key[1] === 'list') {
          return true
        }
        return false
      })

      return result
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to cancel a request (owner can cancel their own)
 */
export function useCancelRequest(requestId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['cancel-request', requestId],
    async () => {
      const result = await requestService.cancel(requestId)

      // Revalidate request detail and lists
      mutate(requestKeys.detail(requestId))
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'requests' && key[1] === 'list') {
          return true
        }
        return false
      })

      return result
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}

/**
 * Hook to revoke a request (admin only)
 */
export function useRevokeRequest(requestId: string) {
  const { trigger, isMutating } = useSWRMutation(
    ['revoke-request', requestId],
    async (_key, { arg }: { arg: string }) => {
      const result = await requestService.revoke(requestId, arg)

      // Revalidate request detail and lists
      mutate(requestKeys.detail(requestId))
      mutate((key: any) => {
        if (Array.isArray(key) && key[0] === 'requests' && key[1] === 'list') {
          return true
        }
        return false
      })

      return result
    }
  )

  return {
    mutateAsync: trigger,
    isPending: isMutating,
  }
}
