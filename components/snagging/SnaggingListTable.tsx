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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  X,
  Home,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import { Snagging, SnaggingPriority, SnaggingStatus } from '@/lib/types/snagging.types'
import { useAuth } from '@/contexts/AuthContext'
import { useDeleteSnagging } from '@/lib/hooks/use-snagging'

interface SnaggingListTableProps {
  snaggings: Snagging[]
  isLoading?: boolean
  onDelete?: (id: string) => void
}

export function SnaggingListTable({
  snaggings,
  isLoading = false,
  onDelete,
}: SnaggingListTableProps) {
  const router = useRouter()
  const { userRole, userId } = useAuth()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteSnagging = useDeleteSnagging()

  const handleView = (snaggingId: string) => {
    router.push(`/snaggings/${snaggingId}`)
  }

  const handleDelete = (snaggingId: string) => {
    setDeleteId(snaggingId)
  }

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteSnagging.mutateAsync(deleteId)
      setDeleteId(null)
      onDelete?.(deleteId)
    }
  }

  const getStatusIcon = (status: SnaggingStatus) => {
    switch (status) {
      case SnaggingStatus.OPEN:
        return <Circle className="h-4 w-4" />
      case SnaggingStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4" />
      case SnaggingStatus.RESOLVED:
        return <CheckCircle2 className="h-4 w-4" />
      case SnaggingStatus.CLOSED:
        return <X className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: SnaggingStatus) => {
    switch (status) {
      case SnaggingStatus.OPEN:
        return 'destructive'
      case SnaggingStatus.IN_PROGRESS:
        return 'default'
      case SnaggingStatus.RESOLVED:
        return 'outline'
      case SnaggingStatus.CLOSED:
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getPriorityVariant = (priority: SnaggingPriority) => {
    switch (priority) {
      case SnaggingPriority.LOW:
        return 'secondary'
      case SnaggingPriority.MEDIUM:
        return 'default'
      case SnaggingPriority.HIGH:
        return 'outline'
      case SnaggingPriority.URGENT:
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getPriorityIcon = (priority: SnaggingPriority) => {
    if (priority === SnaggingPriority.URGENT || priority === SnaggingPriority.HIGH) {
      return <AlertTriangle className="h-3 w-3" />
    }
    return null
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    try {
      return format(new Date(date), 'MMM d, yyyy')
    } catch {
      return '-'
    }
  }

  const formatDateTime = (date: string | null | undefined) => {
    if (!date) return '-'
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a')
    } catch {
      return '-'
    }
  }

  const canDelete = (snagging: Snagging) => {
    if (userRole === 'admin') return true
    if (userRole === 'owner' && snagging.createdById === userId) return true
    return false
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Activity</TableHead>
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
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
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
        title="No snagging items found"
        description="Create a new snagging item to report issues or defects"
      />
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-center">
                <MessageSquare className="h-4 w-4 inline" />
              </TableHead>
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
                  <div className="max-w-[300px]">
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
                  <Badge variant={getStatusVariant(snagging.status)} className="gap-1">
                    {getStatusIcon(snagging.status)}
                    {snagging.status?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(snagging.priority)} className="gap-1">
                    {getPriorityIcon(snagging.priority)}
                    {snagging.priority || 'Medium'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{snagging.createdBy?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(snagging.createdAt)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(snagging.lastActivityAt)}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  {snagging._count?.messages ? (
                    <Badge variant="secondary" className="min-w-[2rem]">
                      {snagging._count.messages}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
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
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleView(snagging.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Thread
                      </DropdownMenuItem>
                      {canDelete(snagging) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(snagging.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Snagging
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the snagging item
              and all associated messages and attachments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteSnagging.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSnagging.isPending ? 'Deleting...' : 'Delete Snagging'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}