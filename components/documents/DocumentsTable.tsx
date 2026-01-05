'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  FileText,
  Eye,
  Download,
  Trash2,
  MoreVertical,
  User,
  Home,
} from 'lucide-react'
import { UnitDocument, DocumentCategory } from '@/lib/types/unit-documents.types'
import { EmptyState } from '@/components/ui/empty-state'
import { format } from 'date-fns'

interface DocumentsTableProps {
  documents: UnitDocument[]
  isLoading: boolean
  onDelete?: (documentId: string) => void
  onDownload?: (documentId: string, filename: string) => void
  isDeleting?: boolean
  showUnitColumn?: boolean // For admin view
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

export function DocumentsTable({
  documents,
  isLoading,
  onDelete,
  onDownload,
  isDeleting,
  showUnitColumn = false,
}: DocumentsTableProps) {
  const router = useRouter()
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null)

  const handleView = (document: UnitDocument) => {
    const url = document.publicUrl || document.fileKey
    window.open(url, '_blank')
  }

  const handleDownload = (document: UnitDocument) => {
    if (onDownload) {
      onDownload(document.id, document.title)
    }
  }

  const handleDeleteClick = (documentId: string) => {
    setDeleteDocumentId(documentId)
  }

  const handleDeleteConfirm = async () => {
    if (deleteDocumentId && onDelete) {
      await onDelete(deleteDocumentId)
      setDeleteDocumentId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              {showUnitColumn && <TableHead>Unit</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                {showUnitColumn && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents found"
        description="No documents match your current filters. Try adjusting your search or filters to see results"
      />
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Title</TableHead>
                {showUnitColumn && <TableHead className="min-w-[120px]">Unit</TableHead>}
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[150px]">Uploaded By</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Created</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{document.title}</span>
                    </div>
                  </TableCell>
                  {showUnitColumn && (
                    <TableCell className="min-w-[120px]">
                      {document.unit ? (
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{document.unit.unitNumber}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={CATEGORY_VARIANTS[document.category]}>
                      {CATEGORY_LABELS[document.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell min-w-[150px]">
                    {document.uploadedBy ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {document.uploadedBy.name || document.uploadedBy.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatFileSize(document.sizeBytes)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell min-w-[120px] text-sm text-muted-foreground">
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
                        {onDelete && (
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
      </div>

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
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Document'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
