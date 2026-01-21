/**
 * Notification Service
 * API calls for notification endpoints
 */

import api from './axios-config'
import {
  Notification,
  NotificationFilters,
  NotificationListResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllReadResponse,
} from '@/lib/types/notification.types'

class NotificationService {
  /**
   * Get notifications with pagination and filtering
   * Supports unreadOnly filter and pagination
   */
  async getNotifications(filters?: NotificationFilters): Promise<NotificationListResponse> {
    const response = await api.get('/notifications', { params: filters })
    return response.data
  }

  /**
   * Get unread notification count for badge display
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get('/notifications/unread-count')
    return response.data
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<MarkAsReadResponse> {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  }

  /**
   * Mark all or selected notifications as read
   * If notificationIds is provided, marks only those notifications
   * Otherwise marks all unread notifications
   */
  async markAllAsRead(notificationIds?: string[]): Promise<MarkAllReadResponse> {
    const response = await api.post('/notifications/mark-all-read', {
      notificationIds,
    })
    return response.data
  }
}

export const notificationService = new NotificationService()
export default notificationService
