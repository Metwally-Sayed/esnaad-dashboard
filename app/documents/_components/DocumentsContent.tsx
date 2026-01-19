'use client'

import { useState } from 'react'
import { DocumentsTable } from '@/components/documents/DocumentsTable'
import { DocumentFilters } from '@/components/documents/DocumentFilters'
import { AddDocumentDialog } from '@/components/documents/AddDocumentDialog'
import { Button } from '@/components/ui/button'
import { FileText, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAllDocuments, useDocumentMutations } from '@/lib/hooks/use-unit-documents'
import { DocumentFilters as DocumentFiltersType, DocumentCategory } from '@/lib/types/unit-documents.types'
import { toast } from 'sonner'

export function DocumentsPage() {
  const { isAdmin, userId } = useAuth()
  const [filters, setFilters] = useState<DocumentFiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Owners can only see documents from their own units
  // The backend will filter by ownerId automatically based on the authenticated user
  const { documents = [], pagination, isLoading, mutate } = useAllDocuments(filters)
  const { createDocument, deleteDocument, downloadDocument, isLoading: isMutating } = useDocumentMutations()

  const handleAddDocument = async (
    unitId: string,
    documentData: {
      title: string
      category: DocumentCategory
      fileKey: string
      mimeType: string
      sizeBytes: number
    }
  ) => {
    try {
      await createDocument(unitId, documentData, {
        onSuccess: () => {
          mutate() // Refresh the list
          setIsAddDialogOpen(false)
        },
      })
    } catch (error) {
      // Error already handled by mutation hook
      console.error('Failed to create document:', error)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId)
      mutate() // Refresh the list
    } catch (error: any) {
      // Error already handled by mutation hook
      console.error('Delete error:', error)
    }
  }

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      await downloadDocument(documentId, filename)
    } catch (error: any) {
      // Error already handled by mutation hook
      console.error('Download error:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<DocumentFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header - Responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Documents</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {isAdmin
              ? 'Manage all unit documents across the system'
              : 'View and download documents for your units'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Documents</p>
          <p className="text-2xl font-bold">{pagination?.total || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Contracts</p>
          <p className="text-2xl font-bold text-blue-600">
            {Array.isArray(documents)
              ? documents.filter((d) => d.category === 'CONTRACT').length
              : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Bills</p>
          <p className="text-2xl font-bold text-green-600">
            {Array.isArray(documents)
              ? documents.filter((d) => d.category === 'BILL').length
              : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <DocumentFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
          showUnitFilter={isAdmin}
        />
      </div>

      {/* Documents Table */}
      <div className="mb-6">
        <DocumentsTable
          documents={documents}
          isLoading={isLoading}
          onDelete={isAdmin ? handleDeleteDocument : undefined}
          onDownload={handleDownloadDocument}
          isDeleting={isMutating}
          showUnitColumn={isAdmin}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} documents
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {(() => {
                const maxVisible = 5
                let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2))
                let end = Math.min(pagination.totalPages, start + maxVisible - 1)

                if (end - start < maxVisible - 1) {
                  start = Math.max(1, end - maxVisible + 1)
                }

                const pages = []
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={i === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                      className="min-w-[2.5rem]"
                    >
                      {i}
                    </Button>
                  )
                }

                return pages
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Document Dialog */}
      {isAdmin && (
        <AddDocumentDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleAddDocument}
        />
      )}
    </div>
  )
}
