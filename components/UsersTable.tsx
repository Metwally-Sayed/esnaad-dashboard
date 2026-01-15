'use client'

import { useState, useCallback, memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  User,
  Mail,
  Shield,
  Calendar,
  Hash
} from 'lucide-react'
import { UserDetails } from '@/lib/types/api.types'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { EmptyState } from './ui/empty-state'

interface UsersTableProps {
  users: UserDetails[]
  isLoading?: boolean
  onEdit?: (userId: string) => void
  onDelete?: (userId: string) => void
  isDeleting?: boolean
}

export const UsersTable = memo(function UsersTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  isDeleting
}: UsersTableProps) {
  const router = useRouter()
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const handleView = useCallback((userId: string) => {
    router.push(`/users/${userId}`)
  }, [router])

  const handleDelete = useCallback((userId: string) => {
    setDeleteUserId(userId)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deleteUserId && onDelete) {
      onDelete(deleteUserId)
      setDeleteUserId(null)
    }
  }, [deleteUserId, onDelete])

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'OWNER':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStatusVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary'
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
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Units Owned</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
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

  if (!users || users.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No users found"
        description="Try adjusting your filters or search criteria"
      />
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell onClick={() => handleView(user.id)}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.name || 'Unnamed User'}
                      </p>
                      {user.externalClient?.nationalityId && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {user.externalClient.nationalityId}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={() => handleView(user.id)}>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell onClick={() => handleView(user.id)}>
                  <Badge variant={getRoleVariant(user.role)} className="gap-1">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell onClick={() => handleView(user.id)}>
                  <Badge variant={getStatusVariant(user.isActive)}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell onClick={() => handleView(user.id)}>
                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-md bg-muted text-sm font-medium">
                    {user.unitsCount || user._count?.ownedUnits || 0}
                  </span>
                </TableCell>
                <TableCell onClick={() => handleView(user.id)}>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={isDeleting}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleView(user.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(user.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
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
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})