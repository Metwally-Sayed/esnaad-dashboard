'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileText, Plus, Eye, Download, Trash2, MoreVertical } from 'lucide-react'
import { useUnitDocuments, useDocumentMutations } from '@/lib/hooks/use-unit-documents'
import { DocumentCategory } from '@/lib/types/unit-documents.types'
import { UploadDocumentDialog } from './UploadDocumentDialog'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { EmptyState } from '@/components/ui/empty-state'

interface UnitDocumentsSectionProps {
  unitId: string
  unitNumber: string
}

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.CONTRACT]: 'Contract',
  [DocumentCategory.BILL]: 'Bill',
  [DocumentCategory.OTHER]: 'Other',
}

const CATEGORY_VARIANTS: Record<DocumentCategory, 'default' | 'secondary' | 'outline'> = {
  [DocumentCategory.CONTRACT]: 'default',
  [DocumentCategory.BILL]: 'secondary',
  [DocumentCategory.OTHER]: 'outline',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round(bytes / Math.pow(k, i) * 10) / 10} ${sizes[i]}`
}

export function UnitDocumentsSection({ unitId, unitNumber }: UnitDocumentsSectionProps) {
  const { isAdmin } = useAuth()
  const { documents, isLoading, mutate } = useUnitDocuments(unitId)
  const { createDocument, deleteDocument, downloadDocument, isLoading: isMutating } = useDocumentMutations()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null)

  const handleUploadSuccess = async (documentData: {
    title: string
    category: DocumentCategory
    fileKey: string
    mimeType: string
    sizeBytes: number
  }) => {
    try {
      await createDocument(unitId, documentData, {
        onSuccess: () => {
          mutate() // Refresh the documents list
          setIsUploadDialogOpen(false)
        },
      })
    } catch (error) {
      // Error already handled by mutation hook
      console.error('Failed to create document:', error)
    }
  }

  const handleView = (document: any) => {
    window.open(document.fileUrl, '_blank')
  }

  const handleDownload = (document: any) => {
    downloadDocument(document.id, document.title)
  }

  const handleDeleteClick = (documentId: string) => {
    setDeleteDocumentId(documentId)
  }

  const handleDeleteConfirm = async () => {
    if (deleteDocumentId) {
      await deleteDocument(deleteDocumentId, {
        onSuccess: () => {
          mutate() // Refresh the documents list
        },
      })
      setDeleteDocumentId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsUploadDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents"
              description={
                isAdmin
                  ? 'Upload documents for this unit using the button above'
                  : 'No documents have been uploaded for this unit yet'
              }
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Size</TableHead>
                    <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{document.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={CATEGORY_VARIANTS[document.category]}>
                          {CATEGORY_LABELS[document.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatFileSize(document.sizeBytes)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {format(new Date(document.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(document)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(document)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(document.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {isAdmin && (
        <UploadDocumentDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          unitId={unitId}
          unitNumber={unitNumber}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDocumentId} onOpenChange={() => setDeleteDocumentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this document
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isMutating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isMutating ? 'Deleting...' : 'Delete Document'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
