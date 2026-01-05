import useSWR, { mutate as globalMutate } from 'swr'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  UnitDocument,
  DocumentFilters,
  DocumentsPaginationResponse,
  CreateDocumentDto
} from '@/lib/types/unit-documents.types'
import { unitDocumentsService } from '@/lib/api/unit-documents.service'

const DOCUMENT_KEYS = {
  unitDocuments: (unitId: string, filters?: Omit<DocumentFilters, 'unitId' | 'search'>) =>
    ['unit-documents', unitId, filters],
  allDocuments: (filters?: DocumentFilters) => ['all-documents', filters],
  document: (id: string) => ['document', id]
}

const unitDocumentsFetcher = async ([_, unitId, filters]: [
  string,
  string,
  Omit<DocumentFilters, 'unitId' | 'search'>?
]) => {
  return unitDocumentsService.getUnitDocuments(unitId, filters)
}

const allDocumentsFetcher = async ([_, filters]: [string, DocumentFilters?]) => {
  return unitDocumentsService.getAllDocuments(filters)
}

export function useUnitDocuments(
  unitId: string | undefined,
  filters?: Omit<DocumentFilters, 'unitId' | 'search'>
) {
  const key = unitId ? DOCUMENT_KEYS.unitDocuments(unitId, filters) : null
  const { data, error, mutate } = useSWR<DocumentsPaginationResponse>(
    key,
    unitDocumentsFetcher,
    {
      revalidateOnFocus: false
    }
  )

  return {
    documents: data?.data || [],
    pagination: data?.meta,
    isLoading: !error && !data && !!unitId,
    error,
    mutate
  }
}

export function useAllDocuments(filters?: DocumentFilters) {
  const key = DOCUMENT_KEYS.allDocuments(filters)
  const { data, error, mutate } = useSWR<DocumentsPaginationResponse>(
    key,
    allDocumentsFetcher,
    {
      revalidateOnFocus: false
    }
  )

  return {
    documents: data?.data || [],
    pagination: data?.meta,
    isLoading: !error && !data,
    error,
    mutate
  }
}

export function useDocumentMutations() {
  const [isLoading, setIsLoading] = useState(false)

  const createDocument = async (
    unitId: string,
    data: CreateDocumentDto,
    options?: {
      onSuccess?: (document: UnitDocument) => void
      onError?: (error: Error) => void
    }
  ) => {
    setIsLoading(true)
    try {
      const document = await unitDocumentsService.createDocument(unitId, data)

      globalMutate(
        key => Array.isArray(key) && (key[0] === 'unit-documents' || key[0] === 'all-documents'),
        undefined,
        { revalidate: true }
      )

      toast.success('Document uploaded successfully')
      options?.onSuccess?.(document)
      return document
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document')
      options?.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDocument = async (
    documentId: string,
    options?: {
      onSuccess?: () => void
      onError?: (error: Error) => void
    }
  ) => {
    setIsLoading(true)
    try {
      await unitDocumentsService.deleteDocument(documentId)

      globalMutate(
        key => Array.isArray(key) && (key[0] === 'unit-documents' || key[0] === 'all-documents'),
        undefined,
        { revalidate: true }
      )

      toast.success('Document deleted successfully')
      options?.onSuccess?.()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete document')
      options?.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const downloadDocument = async (
    documentId: string,
    filename: string
  ) => {
    try {
      const { url } = await unitDocumentsService.getDownloadUrl(documentId)
      unitDocumentsService.downloadDocument(url, filename)
      toast.success('Downloading document...')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download document')
      throw error
    }
  }

  return {
    createDocument,
    deleteDocument,
    downloadDocument,
    isLoading
  }
}
