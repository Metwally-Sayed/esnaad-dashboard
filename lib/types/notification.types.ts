export type NotificationType =
  | 'HANDOVER_SENT_TO_OWNER'
  | 'HANDOVER_ACCEPTED'
  | 'HANDOVER_MESSAGE_CREATED'
  | 'REQUEST_CREATED'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'REQUEST_MESSAGE_CREATED'
  | 'OWNER_VERIFICATION_APPROVED'
  | 'OWNER_VERIFICATION_REJECTED'
  | 'SNAGGING_SENT_TO_OWNER'
  | 'SNAGGING_ACCEPTED'
  | 'SNAGGING_CANCELLED'
  | 'SERVICE_CHARGE_CREATED'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  entityType?: string | null
  entityId?: string | null
  actionUrl?: string | null
  metadata?: any
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface NotificationFilters {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export interface NotificationListResponse {
  success: boolean
  data: Notification[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface UnreadCountResponse {
  success: boolean
  data: {
    count: number
  }
}

export interface MarkAsReadResponse {
  success: boolean
  data: Notification
  message: string
}

export interface MarkAllReadResponse {
  success: boolean
  data: {
    count: number
  }
  message: string
}
