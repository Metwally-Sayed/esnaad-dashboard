import axios from './axios-config'
import { toast } from 'sonner'
import {
  Handover,
  HandoverPaginationResponse,
  HandoverFilters,
  CreateHandoverDto,
  UpdateHandoverDto,
  SendToOwnerDto,
  OwnerConfirmDto,
  RequestChangesDto,
  AdminConfirmDto,
  CancelHandoverDto,
  CreateHandoverMessageDto,
  HandoverMessage,
  HandoverAttachment,
  MessagePaginationResponse,
  MessageFilters,
  PresignedUrlRequest,
  PresignedUrlResponse
} from '@/lib/types/handover.types'

const API_BASE = '/handovers'

// Handover CRUD operations
export const handoverService = {
  // Create new handover (Admin only)
  async create(data: CreateHandoverDto): Promise<Handover> {
    try {
      const response = await axios.post<{ success: boolean; data: Handover }>(
        API_BASE,
        data
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to create handover'
      toast.error(errorMessage)
      throw error
    }
  },

  // List handovers with filters and pagination
  async list(filters: HandoverFilters = {}): Promise<HandoverPaginationResponse> {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      console.log(`Fetching handovers with params:`, params.toString())

      const response = await axios.get<{
        success: boolean;
        data: Handover[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }
      }>(
        `${API_BASE}?${params.toString()}`
      )

      console.log('Raw handover list API response:', response.data)

      // Transform the backend response to match frontend expectations
      const backendData = response.data

      // Check if data exists and is an array
      if (!backendData || !backendData.data) {
        console.warn('No data in handover list response, returning empty array')
        return {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
            hasMore: false
          }
        }
      }

      const handovers = Array.isArray(backendData.data) ? backendData.data : []

      const transformed = {
        items: handovers,
        pagination: {
          total: backendData.meta?.total || handovers.length,
          page: backendData.meta?.page || 1,
          limit: backendData.meta?.limit || 20,
          totalPages: backendData.meta?.totalPages || 1,
          hasMore: (backendData.meta?.page || 1) < (backendData.meta?.totalPages || 1)
        }
      }

      console.log('Transformed handover list response:', transformed)
      return transformed
    } catch (error: any) {
      console.error('Error fetching handovers:', error)

      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to fetch handovers'
      toast.error(errorMessage)

      // Return empty response on error
      return {
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasMore: false
        }
      }
    }
  },

  // Get handover by ID
  async getById(id: string): Promise<Handover> {
    try {
      const response = await axios.get<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}`
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to fetch handover details'
      toast.error(errorMessage)
      throw error
    }
  },

  // Update handover (Admin only)
  async update(id: string, data: UpdateHandoverDto): Promise<Handover> {
    try {
      const response = await axios.patch<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to update handover'
      toast.error(errorMessage)
      throw error
    }
  },

  // Workflow actions
  async sendToOwner(id: string, data?: SendToOwnerDto): Promise<Handover> {
    try {
      const response = await axios.post<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}/send`,
        data || {}
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to send handover to owner'
      toast.error(errorMessage)
      throw error
    }
  },

  async ownerConfirm(id: string, data?: OwnerConfirmDto): Promise<Handover> {
    try {
      const response = await axios.post<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}/owner-confirm`,
        data || {}
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to confirm handover'
      toast.error(errorMessage)
      throw error
    }
  },

  async requestChanges(id: string, data: RequestChangesDto): Promise<Handover> {
    try {
      const response = await axios.post<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}/request-changes`,
        data
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to request changes'
      toast.error(errorMessage)
      throw error
    }
  },

  async adminConfirm(id: string, data?: AdminConfirmDto): Promise<Handover> {
    try {
      const response = await axios.post<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}/admin-confirm`,
        data || {}
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to confirm handover'
      toast.error(errorMessage)
      throw error
    }
  },

  async complete(id: string): Promise<Handover> {
    try {
      const response = await axios.post<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}/complete`
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to complete handover'
      toast.error(errorMessage)
      throw error
    }
  },

  async cancel(id: string, data: CancelHandoverDto): Promise<Handover> {
    try {
      const response = await axios.post<{ success: boolean; data: Handover }>(
        `${API_BASE}/${id}/cancel`,
        data
      )
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to cancel handover'
      toast.error(errorMessage)
      throw error
    }
  },

  // NEW SIMPLIFIED FLOW: Owner accepts handover (generates PDF immediately)
  async acceptHandover(id: string): Promise<Handover & {
    document?: {
      id: string
      url: string
      key: string
    }
  }> {
    try {
      const response = await axios.post<{
        success: boolean;
        data: Handover & {
          document?: {
            id: string
            url: string
            key: string
          }
        };
        message?: string
      }>(
        `${API_BASE}/${id}/accept`
      )

      // Show success message if provided
      if (response.data.message) {
        toast.success(response.data.message)
      } else {
        toast.success('Handover accepted successfully')
      }

      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Failed to accept handover'
      toast.error(errorMessage)
      throw error
    }
  },

  // Messages
  async getMessages(
    handoverId: string,
    filters?: MessageFilters
  ): Promise<MessagePaginationResponse> {
    try {
      const params = new URLSearchParams()

      if (filters?.cursor) {
        params.append('cursor', filters.cursor)
      }
      if (filters?.limit) {
        params.append('limit', String(filters.limit))
      }

      console.log(`Fetching messages for handover ${handoverId} with params:`, params.toString())

      const response = await axios.get<{
        success: boolean;
        data: Array<{
          id: string
          handoverId: string
          authorUserId: string
          authorRole: string
          author: {
            id: string
            name?: string
            email: string
            role: string
          }
          body: string
          attachments?: HandoverAttachment[]
          createdAt: string
          deletedAt?: string | null
        }>
        meta: {
          hasMore: boolean
          nextCursor?: string | null
        }
      }>(
        `${API_BASE}/${handoverId}/messages?${params.toString()}`
      )

      console.log('Raw API response:', response.data)

      // Transform the backend response to match frontend expectations
      const backendData = response.data

      // Check if data exists and is an array
      if (!backendData || !backendData.data) {
        console.warn('No data in response, returning empty array')
        return {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
            hasMore: false
          }
        }
      }

      const messages = Array.isArray(backendData.data) ? backendData.data : []

      const transformed = {
        items: messages.map(msg => ({
          id: msg.id,
          handoverId: msg.handoverId,
          userId: msg.authorUserId,  // Map authorUserId to userId
          user: msg.author,  // Map author to user
          body: msg.body,
          attachments: msg.attachments || [],
          createdAt: msg.createdAt,
          updatedAt: msg.createdAt // Use createdAt as updatedAt since it's not in the response
        })),
        pagination: {
          total: messages.length,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasMore: backendData.meta?.hasMore || false,
          cursor: backendData.meta?.nextCursor || undefined
        }
      }

      console.log('Transformed response:', transformed)
      return transformed
    } catch (error: any) {
      console.error('Error fetching messages:', error)

      // Show error toast
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to fetch messages'
      toast.error(errorMessage)

      // Return empty response on error
      return {
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasMore: false
        }
      }
    }
  },

  async addMessage(
    handoverId: string,
    data: CreateHandoverMessageDto
  ): Promise<HandoverMessage> {
    const response = await axios.post<{
      success: boolean;
      data: {
        id: string
        handoverId: string
        authorUserId: string
        authorRole: string
        author: {
          id: string
          name?: string
          email: string
          role: string
        }
        body: string
        attachments?: HandoverAttachment[]
        createdAt: string
        deletedAt?: string | null
      }
    }>(
      `${API_BASE}/${handoverId}/messages`,
      data
    )

    // Transform the backend response to match frontend expectations
    const msg = response.data.data
    return {
      id: msg.id,
      handoverId: msg.handoverId,
      userId: msg.authorUserId,  // Map authorUserId to userId
      user: msg.author,  // Map author to user
      body: msg.body,
      attachments: msg.attachments || [],
      createdAt: msg.createdAt,
      updatedAt: msg.createdAt  // Use createdAt as updatedAt
    }
  },

  // Attachments
  async getUploadUrl(handoverId: string, data: {
    filename: string
    contentType: string
    size: number
  }): Promise<{ url: string; fields: Record<string, string> }> {
    const response = await axios.post<{ success: boolean; data: { url: string; fields: Record<string, string> } }>(
      `${API_BASE}/${handoverId}/attachments/presigned-url`,
      data
    )
    return response.data.data
  },

  async createAttachment(handoverId: string, data: {
    filename: string
    url: string
    mimeType: string
    size: number
    caption?: string
  }): Promise<HandoverAttachment> {
    const response = await axios.post<{ success: boolean; data: HandoverAttachment }>(
      `${API_BASE}/${handoverId}/attachments`,
      data
    )
    return response.data.data
  },

  async deleteAttachment(handoverId: string, attachmentId: string): Promise<void> {
    await axios.delete(`${API_BASE}/${handoverId}/attachments/${attachmentId}`)
  }
}

// Unit-specific handovers
export const unitHandoverService = {
  async getHandoversForUnit(
    unitId: string,
    filters?: Omit<HandoverFilters, 'unitId'>
  ): Promise<HandoverPaginationResponse> {
    return handoverService.list({ ...filters, unitId })
  }
}

// Upload service for attachments
export const uploadService = {
  async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await axios.post<{ success: boolean; data: PresignedUrlResponse }>(
      '/uploads/r2/presign',
      request
    )
    return response.data.data
  },

  async getPresignedUrls(requests: PresignedUrlRequest[]): Promise<PresignedUrlResponse[]> {
    const response = await axios.post<{ success: boolean; data: PresignedUrlResponse[] }>(
      '/uploads/r2/presign-batch',
      { files: requests }
    )
    return response.data.data
  },

  async uploadToR2(
    presignedUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  }
}