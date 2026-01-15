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
import { EmptyState } from '@/components/ui/empty-state'
import {
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Trash2,
  Home,
  User,
  FileText,
  Image,
  Download,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { Snagging } from '@/lib/types/snagging.types'
import { useAuth } from '@/contexts/AuthContext'
import snaggingService from '@/lib/api/snagging.service'
import { toast } from 'sonner'

interface SnaggingListTableProps {
  snaggings: Snagging[]
  isLoading?: boolean
  onDelete?: () => void
}

export function SnaggingListTable({
  snaggings,
  isLoading = false,
  onDelete,
}: SnaggingListTableProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = (snaggingId: string) => {
    router.push(`/snaggings/${snaggingId}`)
  }

  const handleDelete = (snaggingId: string) => {
    setDeleteId(snaggingId)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    
    try {
      setIsDeleting(true)
      await snaggingService.deleteSnagging(deleteId)
      toast.success('Snagging cancelled successfully')
      setDeleteId(null)
      onDelete?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel snagging')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    try {
      return format(new Date(date), 'MMM d, yyyy')
    } catch {
      return '-'
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!snaggings || snaggings.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No snagging reports found"
        description="Create a new snagging report to document issues or defects"
      />
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-center">Images</TableHead>
            <TableHead>PDF</TableHead>
            <TableHead>Owner Signature</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snaggings.map((snagging) => (
            <TableRow
              key={snagging.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleView(snagging.id)}
            >
              <TableCell>
                <div className="max-w-[250px]">
                  <p className="font-medium truncate">{snagging.title}</p>
                  {snagging.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {snagging.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {snagging.unit && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{snagging.unit.unitNumber}</p>
                      {snagging.unit.buildingName && (
                        <p className="text-xs text-muted-foreground">
                          {snagging.unit.buildingName}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {snagging.owner && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{snagging.owner.name || snagging.owner.email}</p>
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {snagging.items && snagging.items.some(item => item.images && item.images.length > 0) ? (
                  <Badge variant="secondary" className="gap-1">
                    <Image className="h-3 w-3" />
                    {snagging.items.reduce((total, item) => total + (item.images?.length || 0), 0)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {snagging.pdfUrl ? (
                  <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
                    <FileText className="h-3 w-3" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {snagging.status === 'ACCEPTED' ? (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Pending</Badge>
                )}
              </TableCell>
              <TableCell>
                <p className="text-sm text-muted-foreground">
                  {formatDate(snagging.createdAt)}
                </p>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(snagging.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {snagging.pdfUrl && (
                      <DropdownMenuItem
                        onClick={() => window.open(snagging.pdfUrl!, '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                    )}
                    {isAdmin && snagging.status !== 'ACCEPTED' && snagging.status !== 'CANCELLED' && (
                      <DropdownMenuItem
                        onClick={() => handleDelete(snagging.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Snagging Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the snagging report as cancelled. The report will be kept for audit purposes but will no longer be active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Cancelling...' : 'Cancel Report'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
