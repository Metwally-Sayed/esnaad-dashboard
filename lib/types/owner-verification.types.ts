/**
 * Owner Verification Types
 * For passport/national ID document verification workflow
 */

export enum OwnerDocumentType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID'
}

export enum DocumentApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum OwnerVerificationStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface OwnerDocument {
  id: string
  userId: string
  type: OwnerDocumentType
  fileKey: string // Cloudinary URL
  mimeType: string
  sizeBytes: number
  status: DocumentApprovalStatus
  rejectionReason?: string | null
  reviewedByAdminId?: string | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt: string
  // Relations
  user?: {
    id: string
    name?: string | null
    email: string
    verificationStatus: OwnerVerificationStatus
  }
  reviewedByAdmin?: {
    id: string
    name?: string | null
    email: string
  }
}

export interface UploadOwnerDocumentDto {
  type: OwnerDocumentType
  fileKey: string
  mimeType: string
  sizeBytes: number
}

export interface VerificationStatusResponse {
  verificationStatus: OwnerVerificationStatus
  verificationNote?: string | null
  documents: OwnerDocument[]
  canSubmit: boolean
}

export interface ApproveUserVerificationDto {
  note?: string
}

export interface RejectUserVerificationDto {
  reason: string
}

export interface VerificationFilters {
  status?: OwnerVerificationStatus
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
}

export interface UserVerificationDetails {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  role: string
  verificationStatus: OwnerVerificationStatus
  verificationNote?: string | null
  createdAt: string
  updatedAt: string
  ownerDocuments: OwnerDocument[]
}

export interface VerificationStats {
  pendingDocuments: number
  pendingApproval: number
  approved: number
  rejected: number
  total: number
}
