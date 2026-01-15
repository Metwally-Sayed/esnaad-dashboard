/**
 * Snagging Module Types (v2)
 */

import { Role } from './auth.types'

// Core Types
export type SnaggingStatus = 'DRAFT' | 'SENT_TO_OWNER' | 'ACCEPTED' | 'CANCELLED'
export type SnaggingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface SnaggingItemImage {
  id: string
  imageUrl: string
  publicId?: string
  caption?: string | null
  sortOrder: number
  createdAt: string
}

export interface SnaggingItem {
  id: string
  snaggingId: string
  category: string
  label: string
  location: string
  severity: SnaggingSeverity
  notes?: string | null
  sortOrder: number
  images: SnaggingItemImage[]
  createdAt: string
}

export interface Snagging {
  id: string
  title: string
  description: string
  notes?: string | null
  status: SnaggingStatus
  unitId: string
  ownerId: string
  createdByAdminId: string
  scheduledAt?: string | null
  scheduledNote?: string | null
  acceptedAt?: string | null
  pdfUrl?: string | null
  pdfPublicId?: string | null
  createdAt: string
  updatedAt: string
  unit?: {
    id: string
    unitNumber: string
    buildingName?: string | null
    floor?: number | null
    area?: number | null
    bedrooms?: number | null
    address?: string | null
  }
  owner?: {
    id: string
    name: string | null
    email: string
    phone?: string | null
    nationalId?: string | null
  }
  createdByAdmin?: {
    id: string
    name: string | null
    email: string
  }
  items?: SnaggingItem[]
}

export interface SnaggingImage {
  id: string
  snaggingId: string
  imageUrl: string
  comment?: string | null
  sortOrder: number
  createdAt: string
}

// DTOs
export interface CreateSnaggingDto {
  unitId: string
  ownerId: string
  title: string
  description: string
  images: Array<{
    imageUrl: string
    comment?: string
    sortOrder: number
  }>
}

export interface UpdateOwnerSignatureDto {
  ownerSignatureUrl: string
}

// Filter Types
export interface SnaggingFilters {
  page?: number
  limit?: number
  unitId?: string
  ownerId?: string
  search?: string
}

// Response Types
export interface SnaggingListResponse {
  data: Snagging[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
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
  publicUrl: string
  key: string
  fields?: Record<string, string>
}

export interface BatchPresignedUrlRequest {
  files: PresignedUrlRequest[]
}

export interface BatchPresignedUrlResponse {
  uploads: PresignedUrlResponse[]
}
