export enum DocumentCategory {
  CONTRACT = 'CONTRACT',
  BILL = 'BILL',
  OTHER = 'OTHER'
}

export interface UnitDocument {
  id: string
  unitId: string
  title: string
  category: DocumentCategory
  fileKey: string
  publicUrl?: string // Cloudinary URL
  mimeType: string
  sizeBytes: number
  uploadedByUserId: string
  uploadedBy?: {
    id: string
    name?: string
    email: string
    role?: string
  }
  unit?: {
    id: string
    unitNumber: string
    buildingName?: string
    ownerId?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateDocumentDto {
  title: string
  category: DocumentCategory
  fileKey: string
  mimeType: string
  sizeBytes: number
}

export interface DocumentFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  unitId?: string
  category?: DocumentCategory
  search?: string
}

export interface DocumentsPaginationResponse {
  data: UnitDocument[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
