import api from './axios-config'
import { Document } from '@/lib/types/handover.types'

interface DocumentsResponse {
  success: boolean
  data: Document[]
}

interface DocumentResponse {
  success: boolean
  data: Document
}

class DocumentsService {
  /**
   * Get all documents for a specific unit
   */
  async getUnitDocuments(unitId: string): Promise<Document[]> {
    const response = await api.get<DocumentsResponse>(`/documents/unit/${unitId}`)
    return response.data.data
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(documentId: string): Promise<Document> {
    const response = await api.get<DocumentResponse>(`/documents/${documentId}`)
    return response.data.data
  }

  /**
   * Get all documents (admin only)
   */
  async listDocuments(filters?: {
    module?: 'HANDOVER' | 'UNIT_PROFILE' | 'SNAGGING' | 'PROJECT'
    type?: 'PDF' | 'DOCX' | 'XLSX'
    unitId?: string
    page?: number
    limit?: number
  }): Promise<{ data: Document[]; meta: any }> {
    const response = await api.get<{ success: boolean; data: Document[]; meta: any }>('/documents', {
      params: filters
    })
    return {
      data: response.data.data,
      meta: response.data.meta
    }
  }

  /**
   * Download document
   */
  downloadDocument(url: string, filename: string) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Open document in new tab
   */
  openDocument(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export const documentsService = new DocumentsService()
export default documentsService
