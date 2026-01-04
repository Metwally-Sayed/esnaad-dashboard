/**
 * Snagging Module Types
 */

import { Role } from './auth.types'

// Enums
export enum SnaggingStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum SnaggingPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Core Types
export interface Snagging {
  id: string
  title: string
  description?: string | null
  status: SnaggingStatus
  priority: SnaggingPriority
  unitId: string
  unit?: {
    id: string
    unitNumber: string
    buildingName?: string | null
    owner?: {
      id: string
      name: string | null
      email: string
    } | null
  }
  createdById: string
  createdBy: {
    id: string
    name: string | null
    email: string
    role: Role
  }
  assignedToId?: string | null
  assignedTo?: {
    id: string
    name: string | null
    email: string
  } | null
  lastActivityAt: string
  resolvedAt?: string | null
  closedAt?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    messages: number
    attachments: number
  }
}

export interface SnaggingMessage {
  id: string
  snaggingId: string
  bodyTitle?: string | null
  bodyText: string
  content?: string // Keep for backward compatibility, map from bodyText
  authorId?: string
  authorUserId?: string
  author: {
    id: string
    name: string | null
    email: string
    role: Role
  }
  attachments: SnaggingAttachment[]
  isEdited?: boolean
  editedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface SnaggingAttachment {
  id: string
  snaggingId?: string | null
  messageId?: string | null
  url: string
  fileName: string
  fileSize?: number | null
  mimeType?: string | null
  thumbnailUrl?: string | null
  createdAt: string
}

// DTOs
export interface CreateSnaggingDto {
  title: string
  description?: string
  priority: SnaggingPriority
  unitId: string
  attachments?: Array<{
    url: string
    fileName: string
    mimeType: string
    sizeBytes: number
  }>
}

export interface UpdateSnaggingDto {
  title?: string
  description?: string
  status?: SnaggingStatus
  priority?: SnaggingPriority
  assignedToId?: string | null
}

// Message DTOs
export interface CreateSnaggingMessageDto {
  bodyTitle?: string
  bodyText: string
  attachments?: Array<{
    url: string
    fileName: string
    mimeType: string
    sizeBytes: number
  }>
}

export interface UpdateSnaggingMessageDto {
  bodyTitle?: string
  bodyText?: string
}

// Filter Types
export interface SnaggingFilters {
  page?: number
  limit?: number
  search?: string
  status?: SnaggingStatus | 'ALL'
  priority?: SnaggingPriority | 'ALL'
  unitId?: string
  createdById?: string
  assignedToId?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

// Response Types
export interface SnaggingListResponse {
  data: Snagging[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SnaggingMessagesResponse {
  data: SnaggingMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// Upload Types
export interface PresignedUrlRequest {
  fileName: string
  fileType: string
  fileSize: number
}

export interface PresignedUrlResponse {
  uploadUrl: string
  fileUrl: string
  fields?: Record<string, string>
}

export interface BatchPresignedUrlRequest {
  files: PresignedUrlRequest[]
}

export interface BatchPresignedUrlResponse {
  urls: PresignedUrlResponse[]
}