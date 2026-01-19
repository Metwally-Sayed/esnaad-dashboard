/**
 * Owner Verification Hooks
 * Hooks for fetching and managing owner verification data
 */

'use client'

import useSWR, { mutate } from 'swr'
import { useState } from 'react'
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
import {
  fetchVerificationStatus,
  fetchOwnerDocuments,
  uploadOwnerDocument,
  deleteOwnerDocument,
  submitDocumentsForReview,
  fetchPendingVerifications,
  fetchVerificationStats,
  fetchUserVerification,
  approveUserVerification,
  rejectUserVerification,
} from '@/lib/api/owner-verification.service'

// ===== Owner Hooks =====

/**
 * Hook to fetch current user's verification status
 */
export function useVerificationStatus() {
  const { data, error, isLoading } = useSWR<VerificationStatusResponse>(
    '/api/owner-verification/status',
    fetchVerificationStatus,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    status: data,
    isLoading,
    error,
    mutate: () => mutate('/api/owner-verification/status'),
  }
}

/**
 * Hook to fetch user's uploaded documents
 */
export function useOwnerDocuments() {
  const { data, error, isLoading } = useSWR<OwnerDocument[]>(
    '/api/owner-verification/documents',
    fetchOwnerDocuments,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    documents: data || [],
    isLoading,
    error,
    mutate: () => mutate('/api/owner-verification/documents'),
  }
}

/**
 * Hook for owner document mutations (upload, delete, submit)
 */
export function useOwnerDocumentMutations() {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const upload = async (data: UploadOwnerDocumentDto) => {
    setIsUploading(true)
    try {
      const document = await uploadOwnerDocument(data)
      // Invalidate caches
      await mutate('/api/owner-verification/documents')
      await mutate('/api/owner-verification/status')
      return document
    } finally {
      setIsUploading(false)
    }
  }

  const deleteDoc = async (documentId: string) => {
    setIsDeleting(true)
    try {
      await deleteOwnerDocument(documentId)
      // Invalidate caches
      await mutate('/api/owner-verification/documents')
      await mutate('/api/owner-verification/status')
    } finally {
      setIsDeleting(false)
    }
  }

  const submit = async () => {
    setIsSubmitting(true)
    try {
      const result = await submitDocumentsForReview()
      // Invalidate caches
      await mutate('/api/owner-verification/status')
      await mutate('/api/auth/me') // Update user's verification status
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    upload,
    deleteDocument: deleteDoc,
    submit,
    isUploading,
    isDeleting,
    isSubmitting,
  }
}

// ===== Admin Hooks =====

/**
 * Hook to fetch pending verifications (admin only)
 */
export function usePendingVerifications(filters?: VerificationFilters) {
  const queryParams = new URLSearchParams()
  if (filters?.page) queryParams.append('page', filters.page.toString())
  if (filters?.limit) queryParams.append('limit', filters.limit.toString())
  if (filters?.search) queryParams.append('search', filters.search)
  if (filters?.status) queryParams.append('status', filters.status)
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo)
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder)

  const queryString = queryParams.toString()
  const cacheKey = `/api/owner-verification/admin/verifications${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading } = useSWR(
    cacheKey,
    () => fetchPendingVerifications(filters || {}),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  return {
    verifications: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate: () => mutate(cacheKey),
  }
}

/**
 * Hook to fetch verification statistics (admin only)
 */
export function useVerificationStats() {
  const { data, error, isLoading } = useSWR<VerificationStats>(
    '/api/owner-verification/admin/stats',
    fetchVerificationStats,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    stats: data,
    isLoading,
    error,
    mutate: () => mutate('/api/owner-verification/admin/stats'),
  }
}

/**
 * Hook to fetch a specific user's verification details (admin only)
 */
export function useUserVerification(userId: string | null) {
  const { data, error, isLoading } = useSWR<UserVerificationDetails>(
    userId ? `/api/owner-verification/admin/verifications/${userId}` : null,
    userId ? () => fetchUserVerification(userId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    verification: data,
    isLoading,
    error,
    mutate: () => userId && mutate(`/api/owner-verification/admin/verifications/${userId}`),
  }
}

/**
 * Hook for admin verification mutations (approve, reject)
 */
export function useVerificationMutations() {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const approve = async (userId: string, data?: ApproveUserVerificationDto) => {
    setIsApproving(true)
    try {
      const result = await approveUserVerification(userId, data)
      // Invalidate caches
      await mutate('/api/owner-verification/admin/verifications')
      await mutate('/api/owner-verification/admin/stats')
      await mutate(`/api/owner-verification/admin/verifications/${userId}`)
      return result
    } finally {
      setIsApproving(false)
    }
  }

  const reject = async (userId: string, data: RejectUserVerificationDto) => {
    setIsRejecting(true)
    try {
      const result = await rejectUserVerification(userId, data)
      // Invalidate caches
      await mutate('/api/owner-verification/admin/verifications')
      await mutate('/api/owner-verification/admin/stats')
      await mutate(`/api/owner-verification/admin/verifications/${userId}`)
      return result
    } finally {
      setIsRejecting(false)
    }
  }

  return {
    approve,
    reject,
    isApproving,
    isRejecting,
  }
}
