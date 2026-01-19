'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useUserMutations, useUsers } from '@/lib/hooks/use-users'
import { UserFilters } from '@/lib/types/api.types'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { UsersFilters } from '@/components/UsersFilters'
import { UsersTable } from '@/components/UsersTable'
import { Button } from '@/components/ui/button'

export function UsersContent() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { users = [], meta: pagination, isLoading, mutate } = useUsers(filters)
  const { deleteUser, isDeleting } = useUserMutations()

  const handleAddUser = () => {
    // TODO: Implement user dialog/modal
    router.push('/users/new')
  }

  const handleEditUser = (userId: string) => {
    router.push(`/users/${userId}/edit`)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      toast.success('User deleted successfully')
      mutate() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Users</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage and monitor all system users' : 'View user information and details'}
          </p>
        </div>
        {/* {isAdmin && (
          <Button onClick={handleAddUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )} */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{pagination?.total || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {Array.isArray(users) ? users.filter(u => u.isActive).length : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold text-destructive">
            {Array.isArray(users) ? users.filter(u => u.role === 'ADMIN').length : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Owners</p>
          <p className="text-2xl font-bold text-blue-600">
            {Array.isArray(users) ? users.filter(u => u.role === 'OWNER').length : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <UsersFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Users Table */}
      <div className="mb-6">
        <UsersTable
          users={users}
          isLoading={isLoading}
          onEdit={isAdmin ? handleEditUser : undefined}
          onDelete={isAdmin ? handleDeleteUser : undefined}
          isDeleting={isDeleting}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
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
                const maxVisible = 5;
                let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
                let end = Math.min(pagination.totalPages, start + maxVisible - 1);

                if (end - start < maxVisible - 1) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                const pages = [];
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                return pages.map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ));
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
    </div>
  )
}
