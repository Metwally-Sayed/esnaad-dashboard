/**
 * Snagging Service (v2)
 * API calls for snagging management
 */

import api, { getTokens } from './axios-config'
import { ApiResponse } from '@/lib/types/auth.types'
import {
  Snagging,
  CreateSnaggingDto,
  UpdateOwnerSignatureDto,
  SnaggingFilters,
  SnaggingListResponse
} from '@/lib/types/snagging.types'

class SnaggingService {
  // =============== Snagging CRUD ===============

  /**
   * Create a new snagging (admin only)
   */
  async createSnagging(data: CreateSnaggingDto): Promise<Snagging> {
    const response = await api.post<ApiResponse<Snagging>>('/snaggings', data)
    return response.data.data!
  }

  /**
   * Get all snaggings (admin only)
   */
  async getAllSnaggings(filters: SnaggingFilters = {}): Promise<SnaggingListResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.unitId) params.append('unitId', filters.unitId)
    if (filters.ownerId) params.append('ownerId', filters.ownerId)
    if (filters.search) params.append('search', filters.search)

    const response = await api.get<ApiResponse<SnaggingListResponse>>(
      `/snaggings?${params.toString()}`
    )
    return response.data.data!
  }

  /**
   * Get owner's snaggings
   */
  async getMySnaggings(filters: SnaggingFilters = {}): Promise<SnaggingListResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await api.get<ApiResponse<SnaggingListResponse>>(
      `/snaggings/my?${params.toString()}`
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
   * Get snaggings for a specific unit
   */
  async getUnitSnaggings(
    unitId: string,
    filters: SnaggingFilters = {},
    isAdmin: boolean = false
  ): Promise<SnaggingListResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    // Use the /unit/:unitId endpoint which handles both admin and owner access
    const response = await api.get<ApiResponse<SnaggingListResponse>>(
      `/snaggings/unit/${unitId}?${params.toString()}`
    )
    return response.data.data!
  }

  /**
   * Update owner signature
   */
  async updateOwnerSignature(id: string, data: UpdateOwnerSignatureDto): Promise<Snagging> {
    const response = await api.patch<ApiResponse<Snagging>>(
      `/snaggings/${id}/owner-signature`,
      data
    )
    return response.data.data!
  }

  /**
   * Regenerate PDF (admin only)
   */
  async regeneratePdf(id: string): Promise<Snagging> {
    const response = await api.post<ApiResponse<Snagging>>(`/snaggings/${id}/regenerate-pdf`)
    return response.data.data!
  }

  /**
   * Delete/Cancel a snagging (admin only)
   * Note: Snaggings are not actually deleted, they are cancelled for audit purposes
   */
  async deleteSnagging(id: string): Promise<void> {
    await api.post(`/snaggings/${id}/cancel`)
  }

  /**
   * Schedule appointment (owner only)
   */
  async scheduleAppointment(
    id: string,
    data: { scheduledAt: string; scheduledNote?: string }
  ): Promise<Snagging> {
    const response = await api.post<ApiResponse<Snagging>>(
      `/snaggings/${id}/schedule`,
      data
    )
    return response.data.data!
  }

  /**
   * Send snagging to owner (admin only)
   */
  async sendToOwner(id: string): Promise<Snagging> {
    const response = await api.post<ApiResponse<Snagging>>(
      `/snaggings/${id}/send`,
      {}
    )
    return response.data.data!
  }

  /**
   * Accept snagging and generate PDF (owner only)
   */
  async acceptSnagging(id: string): Promise<Snagging> {
    const response = await api.post<ApiResponse<Snagging>>(
      `/snaggings/${id}/accept`,
      {}
    )
    return response.data.data!
  }

  // =============== File Uploads ===============

  /**
   * Upload a single file directly to Cloudinary via backend
   * @param file File to upload
   * @param onProgress Progress callback (0-100)
   * @returns Promise with Cloudinary public URL and public_id
   */
  async uploadFileDirect(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ publicUrl: string; publicId: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Get the base URL from axios config
      const baseURL = api.defaults.baseURL || ''

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success && response.data?.publicUrl) {
              resolve({
                publicUrl: response.data.publicUrl,
                publicId: response.data.key // Cloudinary public_id
              })
            } else {
              reject(new Error(response.error || 'Upload failed'))
            }
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.error || `Upload failed with status ${xhr.status}`))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener('error', (e) => {
        alert(`XHR Error - Status: ${xhr.status}, ReadyState: ${xhr.readyState}, URL: ${baseURL}/uploads/cloudinary/direct`);
        reject(new Error('Upload failed - network error'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload failed - timeout (file may be too large)'))
      })

      // Updated endpoint: Cloudinary direct upload
      const uploadUrl = `${baseURL}/uploads/cloudinary/direct`;
      alert(`Uploading to: ${uploadUrl}`); // DEBUG
      xhr.open('POST', uploadUrl)
      xhr.timeout = 120000 // 2 minute timeout for large camera photos

      // Get auth token from cookies
      const { accessToken } = getTokens()
      if (accessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      }

      xhr.send(formData)
    })
  }

  /**
   * Helper: Upload multiple files with progress
   * @param files Array of files to upload
   * @param onProgress Progress callback (fileName, progress)
   * @returns Promise with array of upload results containing publicUrl and publicId
   */
  async uploadFiles(
    files: File[],
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<Array<{ publicUrl: string; publicId: string }>> {
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`)
      }
      // Allow any image/* type or empty type (common with mobile camera)
      const isValidType = ALLOWED_TYPES.includes(file.type) ||
                          file.type.startsWith('image/') ||
                          file.type === ''
      if (!isValidType) {
        throw new Error(`File ${file.name} is not a supported image type (${file.type})`)
      }
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 images allowed')
    }

    // Upload files sequentially to avoid overwhelming the server
    const uploadResults: Array<{ publicUrl: string; publicId: string }> = []

    for (const file of files) {
      const result = await this.uploadFileDirect(
        file,
        (progress) => onProgress?.(file.name, progress)
      )
      uploadResults.push(result)
    }

    return uploadResults
  }
}

export default new SnaggingService()
