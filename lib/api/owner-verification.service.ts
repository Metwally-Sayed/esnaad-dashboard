/**
 * Owner Verification Service
 * API calls for owner document verification
 */

import api from './axios-config'
import { ApiResponse, PaginatedResponse } from '@/lib/types/auth.types'
import {
  OwnerDocument,
  UploadOwnerDocumentDto,
  VerificationStatusResponse,
  ApproveUserVerificationDto,
  RejectUserVerificationDto,
  VerificationFilters,
  UserVerificationDetails,
  VerificationStats,
} from '@/lib/types/owner-verification.types'

// ===== Owner Endpoints =====

/**
 * Get current user's verification status
 */
export const fetchVerificationStatus = async (): Promise<VerificationStatusResponse> => {
  const response = await api.get<ApiResponse<VerificationStatusResponse>>('/owner-verification/status')
  return response.data.data!
}

/**
 * Get user's uploaded documents
 */
export const fetchOwnerDocuments = async (): Promise<OwnerDocument[]> => {
  const response = await api.get<ApiResponse<OwnerDocument[]>>('/owner-verification/documents')
  return response.data.data!
}

/**
 * Upload a document (passport or national ID)
 */
export const uploadOwnerDocument = async (data: UploadOwnerDocumentDto): Promise<OwnerDocument> => {
  const response = await api.post<ApiResponse<OwnerDocument>>('/owner-verification/documents', data)
  return response.data.data!
}

/**
 * Delete a document
 */
export const deleteOwnerDocument = async (documentId: string): Promise<void> => {
  await api.delete(`/owner-verification/documents/${documentId}`)
}

/**
 * Submit documents for admin review
 */
export const submitDocumentsForReview = async (): Promise<{ verificationStatus: string; message: string }> => {
  const response = await api.post<ApiResponse<{ verificationStatus: string; message: string }>>('/owner-verification/submit')
  return response.data.data!
}

// ===== Admin Endpoints =====

/**
 * Get all pending verifications (admin only)
 */
export const fetchPendingVerifications = async (
  filters: VerificationFilters = {}
): Promise<PaginatedResponse<UserVerificationDetails>> => {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.status) params.append('status', filters.status)
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.append('dateTo', filters.dateTo)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get<ApiResponse<PaginatedResponse<UserVerificationDetails>>>(
    `/owner-verification/admin/verifications?${params.toString()}`
  )
  return response.data.data!
}

/**
 * Get verification statistics (admin only)
 */
export const fetchVerificationStats = async (): Promise<VerificationStats> => {
  const response = await api.get<ApiResponse<VerificationStats>>('/owner-verification/admin/stats')
  return response.data.data!
}

/**
 * Get specific user's verification details (admin only)
 */
export const fetchUserVerification = async (userId: string): Promise<UserVerificationDetails> => {
  const response = await api.get<ApiResponse<UserVerificationDetails>>(`/owner-verification/admin/verifications/${userId}`)
  return response.data.data!
}

/**
 * Approve user verification (admin only)
 */
export const approveUserVerification = async (
  userId: string,
  data?: ApproveUserVerificationDto
): Promise<{ verificationStatus: string; message: string }> => {
  const response = await api.post<ApiResponse<{ verificationStatus: string; message: string }>>(
    `/owner-verification/admin/verifications/${userId}/approve`,
    data || {}
  )
  return response.data.data!
}

/**
 * Reject user verification (admin only)
 */
export const rejectUserVerification = async (
  userId: string,
  data: RejectUserVerificationDto
): Promise<{ verificationStatus: string; message: string }> => {
  const response = await api.post<ApiResponse<{ verificationStatus: string; message: string }>>(
    `/owner-verification/admin/verifications/${userId}/reject`,
    data
  )
  return response.data.data!
}
