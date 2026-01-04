// Handover Status Enum
export enum HandoverStatus {
  DRAFT = 'DRAFT',
  SENT_TO_OWNER = 'SENT_TO_OWNER',
  OWNER_CONFIRMED = 'OWNER_CONFIRMED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  ADMIN_CONFIRMED = 'ADMIN_CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Handover Item Status Enum
export enum HandoverItemStatus {
  OK = 'OK',
  NOT_OK = 'NOT_OK',
  NA = 'NA'
}

// Handover Item
export interface HandoverItem {
  id: string
  handoverId: string
  category: string
  label: string
  expectedValue?: string
  actualValue?: string
  status: HandoverItemStatus
  notes?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// Handover Attachment
export interface HandoverAttachment {
  id: string
  handoverId: string
  itemId?: string
  url: string
  key: string
  mimeType: string
  sizeBytes: number
  caption?: string
  createdAt: string
}

// Handover Message
export interface HandoverMessage {
  id: string
  handoverId: string
  userId: string
  user?: {
    id: string
    name?: string
    email: string
    role: string
  }
  body: string
  attachments?: HandoverAttachment[]
  createdAt: string
  updatedAt: string
}

// Main Handover Interface
export interface Handover {
  id: string
  unitId: string
  unit?: {
    id: string
    unitNumber: string
    buildingName?: string
    floor?: number
    area?: number
    project?: {
      id: string
      name: string
    }
  }
  ownerId: string
  owner?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  createdByAdminId: string
  createdByAdmin?: {
    id: string
    name: string
    email: string
  }
  status: HandoverStatus
  scheduledAt?: string
  handoverAt?: string
  notes?: string
  internalNotes?: string
  items?: HandoverItem[]
  attachments?: HandoverAttachment[]
  messages?: HandoverMessage[]
  documentUrl?: string
  documentId?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  cancelledAt?: string
}

// Create/Update DTOs
export interface CreateHandoverDto {
  unitId: string
  ownerId: string
  scheduledAt?: string
  handoverAt?: string
  notes?: string
  items?: Omit<HandoverItem, 'id' | 'handoverId' | 'createdAt' | 'updatedAt'>[]
  attachments?: Omit<HandoverAttachment, 'id' | 'handoverId' | 'createdAt'>[]
}

export interface UpdateHandoverDto {
  scheduledAt?: string | null
  handoverAt?: string | null
  notes?: string
  internalNotes?: string
  items?: Omit<HandoverItem, 'id' | 'handoverId' | 'createdAt' | 'updatedAt'>[]
  attachments?: Omit<HandoverAttachment, 'id' | 'handoverId' | 'createdAt'>[]
}

// Action DTOs
export interface SendToOwnerDto {
  message?: string
}

export interface OwnerConfirmDto {
  acknowledgement?: string
}

export interface RequestChangesDto {
  message: string
}

export interface AdminConfirmDto {
  finalNotes?: string
}

export interface CancelHandoverDto {
  reason: string
}

export interface CreateHandoverMessageDto {
  body: string
  attachments?: Omit<HandoverAttachment, 'id' | 'handoverId' | 'createdAt'>[]
}

// Filter DTOs
export interface HandoverFilters {
  status?: HandoverStatus
  unitId?: string
  ownerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'handoverAt' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface MessageFilters {
  cursor?: string
  limit?: number
}

// Pagination Response
export interface HandoverPaginationResponse {
  items: Handover[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore?: boolean
  }
}

export interface MessagePaginationResponse {
  items: HandoverMessage[]
  pagination: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
    cursor?: string
    hasMore?: boolean
  }
}

// Upload types
export interface PresignedUrlRequest {
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface PresignedUrlResponse {
  url: string
  key: string
  expiresAt: string
}

// Helper functions for status
export function getStatusLabel(status: HandoverStatus): string {
  const labels: Record<HandoverStatus, string> = {
    [HandoverStatus.DRAFT]: 'Draft',
    [HandoverStatus.SENT_TO_OWNER]: 'Sent to Owner',
    [HandoverStatus.OWNER_CONFIRMED]: 'Owner Confirmed',
    [HandoverStatus.CHANGES_REQUESTED]: 'Changes Requested',
    [HandoverStatus.ADMIN_CONFIRMED]: 'Admin Confirmed',
    [HandoverStatus.COMPLETED]: 'Completed',
    [HandoverStatus.CANCELLED]: 'Cancelled'
  }
  return labels[status] || status
}

export function getStatusColor(status: HandoverStatus): string {
  const colors: Record<HandoverStatus, string> = {
    [HandoverStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [HandoverStatus.SENT_TO_OWNER]: 'bg-blue-100 text-blue-800',
    [HandoverStatus.OWNER_CONFIRMED]: 'bg-purple-100 text-purple-800',
    [HandoverStatus.CHANGES_REQUESTED]: 'bg-yellow-100 text-yellow-800',
    [HandoverStatus.ADMIN_CONFIRMED]: 'bg-indigo-100 text-indigo-800',
    [HandoverStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [HandoverStatus.CANCELLED]: 'bg-red-100 text-red-800'
  }
  return colors[status] || ''
}

export function getItemStatusColor(status: HandoverItemStatus): string {
  const colors: Record<HandoverItemStatus, string> = {
    [HandoverItemStatus.OK]: 'bg-green-100 text-green-800',
    [HandoverItemStatus.NOT_OK]: 'bg-red-100 text-red-800',
    [HandoverItemStatus.NA]: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || ''
}

// Check if handover is editable
export function isHandoverEditable(status: HandoverStatus): boolean {
  return [
    HandoverStatus.DRAFT,
    HandoverStatus.SENT_TO_OWNER,
    HandoverStatus.CHANGES_REQUESTED
  ].includes(status)
}

// Check allowed actions per role and status
export function getAllowedActions(handover: Handover, role: 'ADMIN' | 'OWNER'): string[] {
  const actions: string[] = ['view']

  if (role === 'ADMIN') {
    if (isHandoverEditable(handover.status)) {
      actions.push('edit')
    }

    switch (handover.status) {
      case HandoverStatus.DRAFT:
        actions.push('send', 'cancel')
        break
      case HandoverStatus.SENT_TO_OWNER:
        actions.push('cancel')
        break
      case HandoverStatus.OWNER_CONFIRMED:
        actions.push('admin-confirm', 'cancel')
        break
      case HandoverStatus.CHANGES_REQUESTED:
        actions.push('send', 'cancel')
        break
      case HandoverStatus.ADMIN_CONFIRMED:
        actions.push('complete')
        break
    }
  } else if (role === 'OWNER') {
    switch (handover.status) {
      case HandoverStatus.SENT_TO_OWNER:
        actions.push('owner-confirm', 'request-changes')
        break
    }
  }

  // Messages allowed for all except completed/cancelled
  if (![HandoverStatus.COMPLETED, HandoverStatus.CANCELLED].includes(handover.status)) {
    actions.push('message')
  }

  return actions
}