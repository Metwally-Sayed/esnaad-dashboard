/**
 * Snagging Service
 * API calls for snagging management
 */

import api from './axios-config'
import { ApiResponse } from '@/lib/types/auth.types'
import {
  Snagging,
  SnaggingMessage,
  CreateSnaggingDto,
  UpdateSnaggingDto,
  CreateSnaggingMessageDto,
  UpdateSnaggingMessageDto,
  SnaggingFilters,
  SnaggingListResponse,
  SnaggingMessagesResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
  BatchPresignedUrlRequest,
  BatchPresignedUrlResponse
} from '@/lib/types/snagging.types'

class SnaggingService {
  // =============== Snagging CRUD ===============

  /**
   * Get all snaggings (admin only)
   */
  async getSnaggings(filters: SnaggingFilters = {}): Promise<SnaggingListResponse> {
    const params = new URLSearchParams()

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status)
    if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority)
    if (filters.unitId) params.append('unitId', filters.unitId)
    if (filters.createdById) params.append('createdById', filters.createdById)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await api.get<ApiResponse<SnaggingListResponse>>(
      `/snaggings?${params.toString()}`
    )
    return response.data.data!
  }

  /**
   * Get my snaggings (owner view)
   */
  async getMySnaggings(filters: SnaggingFilters = {}): Promise<SnaggingListResponse> {
    const params = new URLSearchParams()

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status)
    if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority)
    if (filters.unitId) params.append('unitId', filters.unitId)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await api.get<ApiResponse<SnaggingListResponse>>(
      `/snaggings/my?${params.toString()}`
    )
    return response.data.data!
  }

  /**
   * Get snaggings for a specific unit
   * Uses the /snaggings endpoint for admins (to see all snaggings)
   * Uses the /my endpoint for owners (to see only their snaggings)
   */
  async getUnitSnaggings(unitId: string, filters: SnaggingFilters = {}, isAdmin: boolean = false): Promise<SnaggingListResponse> {
    const params = new URLSearchParams()

    params.append('unitId', unitId)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status)
    if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    // Use /snaggings endpoint for admins to see all snaggings
    // Use /my endpoint for owners to see only their snaggings
    const endpoint = isAdmin ? '/snaggings' : '/snaggings/my'

    const response = await api.get<ApiResponse<SnaggingListResponse>>(
      `${endpoint}?${params.toString()}`
    )
    return response.data.data!
  }

  /**
   * Get a single snagging by ID
   */
  async getSnaggingById(id: string): Promise<Snagging> {
    const response = await api.get<ApiResponse<Snagging>>(`/snaggings/${id}`)
    return response.data.data!
  }

  /**
   * Create a new snagging
   */
  async createSnagging(data: CreateSnaggingDto): Promise<Snagging> {
    const response = await api.post<ApiResponse<Snagging>>('/snaggings', data)
    return response.data.data!
  }

  /**
   * Update a snagging (uses PATCH as per backend)
   */
  async updateSnagging(id: string, data: UpdateSnaggingDto): Promise<Snagging> {
    const response = await api.patch<ApiResponse<Snagging>>(`/snaggings/${id}`, data)
    return response.data.data!
  }

  /**
   * Delete a snagging
   */
  async deleteSnagging(id: string): Promise<void> {
    await api.delete(`/snaggings/${id}`)
  }

  // =============== Messages ===============

  /**
   * Get messages for a snagging (with pagination)
   */
  async getSnaggingMessages(
    snaggingId: string,
    page = 1,
    limit = 20
  ): Promise<SnaggingMessagesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await api.get<ApiResponse<SnaggingMessagesResponse>>(
      `/snaggings/${snaggingId}/messages?${params.toString()}`
    )
    return response.data.data!
  }

  /**
   * Create a message in a snagging thread
   */
  async createSnaggingMessage(
    snaggingId: string,
    data: CreateSnaggingMessageDto
  ): Promise<SnaggingMessage> {
    const response = await api.post<ApiResponse<SnaggingMessage>>(
      `/snaggings/${snaggingId}/messages`,
      data
    )
    return response.data.data!
  }

  /**
   * Update a message
   */
  async updateSnaggingMessage(
    snaggingId: string,
    messageId: string,
    data: UpdateSnaggingMessageDto
  ): Promise<SnaggingMessage> {
    const response = await api.put<ApiResponse<SnaggingMessage>>(
      `/snaggings/${snaggingId}/messages/${messageId}`,
      data
    )
    return response.data.data!
  }

  /**
   * Delete a message
   */
  async deleteSnaggingMessage(snaggingId: string, messageId: string): Promise<void> {
    await api.delete(`/snaggings/${snaggingId}/messages/${messageId}`)
  }

  // =============== File Uploads ===============

  /**
   * Get presigned URL for single file upload
   */
  async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    // Convert to backend format
    const backendRequest = {
      files: [{
        fileName: request.fileName,
        mimeType: request.fileType,
        sizeBytes: request.fileSize
      }]
    }

    const response = await api.post<ApiResponse<any>>(
      '/uploads/r2/presign',
      backendRequest
    )

    // Convert response to expected format
    const uploadData = response.data.data?.uploads?.[0]
    if (!uploadData) {
      throw new Error('Failed to get presigned URL')
    }

    return {
      uploadUrl: uploadData.presignedUrl || uploadData.uploadUrl,
      fileUrl: uploadData.publicUrl || uploadData.fileUrl,
      fields: uploadData.fields || {}
    }
  }

  /**
   * Get presigned URLs for multiple files
   */
  async getBatchPresignedUrls(
    request: BatchPresignedUrlRequest
  ): Promise<BatchPresignedUrlResponse> {
    // Convert to backend format
    const backendRequest = {
      files: request.files.map(file => ({
        fileName: file.fileName,
        mimeType: file.fileType,
        sizeBytes: file.fileSize
      }))
    }

    const response = await api.post<ApiResponse<any>>(
      '/uploads/r2/presign',
      backendRequest
    )

    // Convert response to expected format
    const uploads = response.data.data?.uploads || []
    return {
      urls: uploads.map((upload: any) => ({
        uploadUrl: upload.presignedUrl || upload.uploadUrl,
        fileUrl: upload.publicUrl || upload.fileUrl,
        fields: upload.fields || {}
      }))
    }
  }

  /**
   * Upload file to R2 using presigned URL
   */
  async uploadToR2(
    presignedUrl: string,
    file: File,
    fields?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const formData = new FormData()

    // Add any required fields first (for S3/R2 compatibility)
    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // Add the file last
    formData.append('file', file)

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('POST', presignedUrl)
      xhr.send(formData)
    })
  }

  /**
   * Helper: Upload multiple files with progress
   */
  async uploadFiles(
    files: File[],
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<string[]> {
    // Validate files
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`)
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`File ${file.name} is not a supported image type`)
      }
    }

    // Get presigned URLs
    const presignedRequests: PresignedUrlRequest[] = files.map(file => ({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    }))

    const { urls } = await this.getBatchPresignedUrls({ files: presignedRequests })

    // Upload files in parallel
    const uploadPromises = files.map((file, index) => {
      const presignedData = urls[index]
      return this.uploadToR2(
        presignedData.uploadUrl,
        file,
        presignedData.fields,
        (progress) => onProgress?.(file.name, progress)
      ).then(() => presignedData.fileUrl)
    })

    return Promise.all(uploadPromises)
  }
}

export default new SnaggingService()