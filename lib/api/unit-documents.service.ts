import api from './axios-config'
import {
  UnitDocument,
  CreateDocumentDto,
  DocumentFilters,
  DocumentsPaginationResponse
} from '@/lib/types/unit-documents.types'

interface ApiResponse<T> {
  success: boolean
  data: T
}

class UnitDocumentsService {
  async getUnitDocuments(
    unitId: string,
    filters?: Omit<DocumentFilters, 'unitId' | 'search'>
  ): Promise<DocumentsPaginationResponse> {
    const response = await api.get<ApiResponse<DocumentsPaginationResponse>>(
      `/units/${unitId}/documents`,
      { params: filters }
    )
    return response.data.data
  }

  async getAllDocuments(filters?: DocumentFilters): Promise<DocumentsPaginationResponse> {
    const response = await api.get<ApiResponse<DocumentsPaginationResponse>>(
      '/documents',
      { params: filters }
    )
    return response.data.data
  }

  async getDocument(documentId: string): Promise<UnitDocument> {
    const response = await api.get<ApiResponse<UnitDocument>>(
      `/documents/${documentId}`
    )
    return response.data.data
  }

  async createDocument(
    unitId: string,
    data: CreateDocumentDto
  ): Promise<UnitDocument> {
    const response = await api.post<ApiResponse<UnitDocument>>(
      `/units/${unitId}/documents`,
      data
    )
    return response.data.data
  }

  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`)
  }

  async getDownloadUrl(documentId: string): Promise<{ url: string }> {
    const response = await api.get<ApiResponse<{ url: string }>>(
      `/documents/${documentId}/download`
    )
    return response.data.data
  }

  downloadDocument(url: string, filename: string) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Direct upload to R2 via backend (bypasses presigned URL signature issues)
  async uploadFileDirect(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{
    publicUrl: string
    key: string
    fileName: string
    mimeType: string
    sizeBytes: number
  }> {
    // Use FormData to send file to backend
    const formData = new FormData()
    formData.append('file', file)

    // Use axios for consistency with all other API calls
    const response = await api.post<ApiResponse<{
      publicUrl: string
      key: string
      fileName: string
      mimeType: string
      sizeBytes: number
    }>>(
      '/uploads/r2/direct',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      }
    )

    return response.data.data
  }
}

export const unitDocumentsService = new UnitDocumentsService()
export default unitDocumentsService
