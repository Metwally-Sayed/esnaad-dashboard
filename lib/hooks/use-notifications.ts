import useSWR, { useSWRConfig } from 'swr'
import { notificationService } from '@/lib/api/notification.service'
import { NotificationFilters } from '@/lib/types/notification.types'
import { toast } from 'sonner'

// Polling interval: 60 seconds (60000ms)
const POLLING_INTERVAL = 60000

/**
 * Hook for fetching notifications with pagination and polling
 * Automatically refetches every 60 seconds
 */
export function useNotifications(filters?: NotificationFilters) {
  const { data, error, isLoading, mutate } = useSWR(
    ['notifications', filters],
    () => notificationService.getNotifications(filters),
    {
      refreshInterval: POLLING_INTERVAL, // Poll every 60 seconds
      revalidateOnFocus: true, // Also refresh when user returns to tab
      revalidateOnReconnect: true,
    }
  )

  return {
    notifications: data?.data ?? [],
    pagination: data?.meta,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for fetching unread notification count with polling
 * Used for displaying badge count in NotificationBell
 */
export function useUnreadCount() {
  const { data, error, mutate } = useSWR(
    'notifications-unread-count',
    () => notificationService.getUnreadCount(),
    {
      refreshInterval: POLLING_INTERVAL, // Poll every 60 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    unreadCount: data?.data?.count ?? 0,
    isLoading: !error && !data,
    error,
    mutate,
  }
}

/**
 * Hook for notification mutations (mark as read, mark all read)
 */
export function useNotificationMutations() {
  const { mutate } = useSWRConfig()

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId)

      // Invalidate notification cache to trigger refetch
      mutate((key) => Array.isArray(key) && key[0] === 'notifications')
      mutate('notifications-unread-count')

      return result
    } catch (error: any) {
      toast.error(error?.message || 'Failed to mark notification as read')
      throw error
    }
  }

  const markAllAsRead = async (notificationIds?: string[]) => {
    try {
      const result = await notificationService.markAllAsRead(notificationIds)

      // Invalidate notification cache to trigger refetch
      mutate((key) => Array.isArray(key) && key[0] === 'notifications')
      mutate('notifications-unread-count')

      toast.success(result.message)
      return result
    } catch (error: any) {
      toast.error(error?.message || 'Failed to mark notifications as read')
      throw error
    }
  }

  return {
    markAsRead,
    markAllAsRead,
  }
}
