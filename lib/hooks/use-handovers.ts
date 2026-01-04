import useSWR, { KeyedMutator, mutate as globalMutate } from 'swr'
import useSWRInfinite from 'swr/infinite'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Handover,
  HandoverPaginationResponse,
  HandoverFilters,
  CreateHandoverDto,
  UpdateHandoverDto,
  HandoverMessage,
  MessagePaginationResponse,
  MessageFilters,
  SendToOwnerDto,
  OwnerConfirmDto,
  RequestChangesDto,
  AdminConfirmDto,
  CancelHandoverDto,
  CreateHandoverMessageDto
} from '@/lib/types/handover.types'
import { handoverService, unitHandoverService } from '@/lib/api/handover.service'

// SWR key generators
const HANDOVER_KEYS = {
  list: (filters: HandoverFilters) => ['handovers', filters],
  detail: (id: string) => ['handover', id],
  unitHandovers: (unitId: string, filters?: Omit<HandoverFilters, 'unitId'>) =>
    ['unit-handovers', unitId, filters],
  messages: (handoverId: string) => ['handover-messages', handoverId]
}

// Custom fetcher for handovers
const handoverFetcher = async ([key, filters]: [string, HandoverFilters]) => {
  return handoverService.list(filters)
}

const handoverDetailFetcher = async ([key, id]: [string, string]) => {
  return handoverService.getById(id)
}

const unitHandoverFetcher = async ([key, unitId, filters]: [
  string,
  string,
  Omit<HandoverFilters, 'unitId'>?
]) => {
  return unitHandoverService.getHandoversForUnit(unitId, filters)
}

// Hook for listing handovers (Admin view)
export function useAdminHandovers(filters: HandoverFilters = {}) {
  const key = HANDOVER_KEYS.list(filters)
  const { data, error, mutate } = useSWR<HandoverPaginationResponse>(
    key,
    handoverFetcher,
    {
      revalidateOnFocus: false
    }
  )

  // Debug logging
  console.log('useAdminHandovers Debug:', {
    filters,
    data,
    items: data?.items,
    pagination: data?.pagination,
    error,
    isLoading: !error && !data
  })

  return {
    handovers: data?.items || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    error,
    mutate
  }
}

// Hook for owner's handovers (Owner view)
export function useMyHandovers(filters: Omit<HandoverFilters, 'ownerId'> = {}) {
  // The backend will filter by the current user automatically for owners
  return useAdminHandovers(filters)
}

// Hook for unit-specific handovers
export function useUnitHandovers(
  unitId: string | undefined,
  filters?: Omit<HandoverFilters, 'unitId'>
) {
  const key = unitId ? HANDOVER_KEYS.unitHandovers(unitId, filters) : null
  const { data, error, mutate } = useSWR<HandoverPaginationResponse>(
    key,
    unitHandoverFetcher,
    {
      revalidateOnFocus: false
    }
  )

  return {
    handovers: data?.items || [],
    pagination: data?.pagination,
    isLoading: !error && !data && !!unitId,
    error,
    mutate
  }
}

// Hook for single handover details
export function useHandover(id: string | undefined) {
  const key = id ? HANDOVER_KEYS.detail(id) : null
  const { data, error, mutate } = useSWR<Handover>(
    key,
    handoverDetailFetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000 // Refresh every 30 seconds for status updates
    }
  )

  return {
    handover: data,
    isLoading: !error && !data && !!id,
    error,
    mutate
  }
}

// Hook for handover messages with infinite scroll
export function useHandoverMessages(handoverId: string | undefined) {
  const getKey = (pageIndex: number, previousPageData: MessagePaginationResponse | null) => {
    if (!handoverId) return null
    if (previousPageData && !previousPageData.pagination.hasMore) return null

    const cursor = previousPageData?.items[previousPageData.items.length - 1]?.id

    return [`handover-messages`, handoverId, { cursor, limit: 20 }]
  }

  const fetcher = async ([key, id, filters]: [string, string, MessageFilters]) => {
    const result = await handoverService.getMessages(id, filters)
    console.log('Fetched messages:', result)
    return result
  }

  const {
    data,
    error,
    size,
    setSize,
    mutate,
    isLoading,
    isValidating
  } = useSWRInfinite<MessagePaginationResponse>(getKey, fetcher, {
    revalidateFirstPage: false
  })

  const messages = data ? data.flatMap(page => page.items) : []
  const hasMore = data && data.length > 0 && data[data.length - 1]?.pagination?.hasMore || false

  return {
    messages,
    isLoading: !error && !data && !!handoverId,
    isLoadingMore: isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined'),
    error,
    hasMore,
    loadMore: () => setSize(size + 1),
    mutate,
    isValidating
  }
}

// Mutation helper hook
export function useHandoverMutations() {
  const [isLoading, setIsLoading] = useState(false)

  const createHandover = async (
    data: CreateHandoverDto,
    options?: {
      onSuccess?: (handover: Handover) => void
      onError?: (error: Error) => void
    }
  ) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.create(data)

      // Invalidate relevant caches
      globalMutate(
        key => Array.isArray(key) && (key[0] === 'handovers' || key[0] === 'unit-handovers'),
        undefined,
        { revalidate: true }
      )

      toast.success('Handover created successfully')
      options?.onSuccess?.(handover)
      return handover
    } catch (error: any) {
      // Error toast already shown in service layer
      options?.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateHandover = async (
    id: string,
    data: UpdateHandoverDto,
    options?: {
      onSuccess?: (handover: Handover) => void
      onError?: (error: Error) => void
      optimistic?: boolean
    }
  ) => {
    setIsLoading(true)

    // Optimistic update
    if (options?.optimistic) {
      await globalMutate(
        HANDOVER_KEYS.detail(id),
        async (current: Handover | undefined) => {
          if (!current) return current
          // Filter out null values and convert them to undefined
          const updatedData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = value === null ? undefined : value
            return acc
          }, {} as any)
          return { ...current, ...updatedData } as Handover
        },
        false
      )
    }

    try {
      const handover = await handoverService.update(id, data)

      // Revalidate caches
      globalMutate(HANDOVER_KEYS.detail(id))
      globalMutate(
        key => Array.isArray(key) && (key[0] === 'handovers' || key[0] === 'unit-handovers'),
        undefined,
        { revalidate: true }
      )

      toast.success('Handover updated successfully')
      options?.onSuccess?.(handover)
      return handover
    } catch (error: any) {
      // Revert optimistic update on error
      if (options?.optimistic) {
        globalMutate(HANDOVER_KEYS.detail(id))
      }
      toast.error(error.response?.data?.message || 'Failed to update handover')
      options?.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const sendToOwner = async (id: string, data?: SendToOwnerDto) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.sendToOwner(id, data)

      // Revalidate caches
      globalMutate(HANDOVER_KEYS.detail(id))
      globalMutate(
        key => Array.isArray(key) && key[0] === 'handovers',
        undefined,
        { revalidate: true }
      )

      toast.success('Handover sent to owner successfully')
      return handover
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send handover to owner')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const ownerConfirm = async (id: string, data?: OwnerConfirmDto) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.ownerConfirm(id, data)

      // Revalidate caches
      globalMutate(HANDOVER_KEYS.detail(id))
      globalMutate(
        key => Array.isArray(key) && key[0] === 'handovers',
        undefined,
        { revalidate: true }
      )

      toast.success('Handover confirmed successfully')
      return handover
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm handover')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const requestChanges = async (id: string, data: RequestChangesDto) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.requestChanges(id, data)

      // Revalidate caches
      globalMutate(HANDOVER_KEYS.detail(id))
      globalMutate(
        key => Array.isArray(key) && key[0] === 'handovers',
        undefined,
        { revalidate: true }
      )

      toast.success('Changes requested successfully')
      return handover
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request changes')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const adminConfirm = async (id: string, data?: AdminConfirmDto) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.adminConfirm(id, data)

      // Revalidate caches
      globalMutate(HANDOVER_KEYS.detail(id))
      globalMutate(
        key => Array.isArray(key) && key[0] === 'handovers',
        undefined,
        { revalidate: true }
      )

      toast.success('Handover confirmed by admin successfully')
      return handover
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm handover')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const completeHandover = async (id: string) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.complete(id)

      // Revalidate caches
      globalMutate(HANDOVER_KEYS.detail(id))
      globalMutate(
        key => Array.isArray(key) && key[0] === 'handovers',
        undefined,
        { revalidate: true }
      )

      toast.success('Handover completed and PDF generated successfully')
      return handover
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete handover')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const cancelHandover = async (id: string, data: CancelHandoverDto) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.cancel(id, data)

      // Revalidate caches
      globalMutate(HANDOVER_KEYS.detail(id))
      globalMutate(
        key => Array.isArray(key) && key[0] === 'handovers',
        undefined,
        { revalidate: true }
      )

      toast.success('Handover cancelled successfully')
      return handover
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel handover')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = async (handoverId: string, data: CreateHandoverMessageDto) => {
    try {
      const message = await handoverService.addMessage(handoverId, data)

      // Revalidate message cache
      globalMutate(
        key => Array.isArray(key) && key[0] === 'handover-messages' && key[1] === handoverId
      )

      toast.success('Message added successfully')
      return message
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add message')
      throw error
    }
  }

  return {
    createHandover,
    updateHandover,
    sendToOwner,
    ownerConfirm,
    requestChanges,
    adminConfirm,
    completeHandover,
    cancelHandover,
    addMessage,
    isLoading
  }
}

// Simple hook for creating handovers (used by dialog)
export function useCreateHandover() {
  const [isLoading, setIsLoading] = useState(false)

  const mutateAsync = async (data: CreateHandoverDto) => {
    setIsLoading(true)
    try {
      const handover = await handoverService.create(data)

      // Revalidate caches
      globalMutate(
        key => Array.isArray(key) && (key[0] === 'handovers' || key[0] === 'unit-handovers'),
        undefined,
        { revalidate: true }
      )

      toast.success('Handover created successfully')
      return handover
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create handover')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutateAsync,
    isLoading
  }
}