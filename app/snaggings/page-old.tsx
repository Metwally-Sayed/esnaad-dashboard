'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMySnaggings } from '@/lib/hooks/use-snagging'
import { SnaggingFilters as FiltersType } from '@/lib/types/snagging.types'
import { SnaggingListTable } from '@/components/snagging/SnaggingListTable'
import { SnaggingFilters } from '@/components/snagging/SnaggingFilters'
import { SnaggingCreateDialog } from '@/components/snagging/SnaggingCreateDialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SnaggingsPage() {
  const router = useRouter()
  const { userRole } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Fetch owner's snaggings
  const { data, isLoading, mutate } = useMySnaggings(filters)

  const handleFilterChange = (newFilters: Partial<FiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleSnaggingCreated = (snaggingId: string) => {
    // Navigate to the new snagging or refresh the list
    setShowCreateDialog(false)
    mutate() // Refresh the list
    router.push(`/snaggings/${snaggingId}`)
  }

  // Redirect admins to admin snagging page
  if (userRole === 'admin') {
    router.push('/admin/snaggings')
    return null
  }

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Snagging Items</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            View and manage issues reported for your units
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold">{data?.pagination?.total || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-2xl font-bold text-red-600">
            {data?.data.filter((s) => s.status === 'OPEN').length || 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">
            {data?.data.filter((s) => s.status === 'IN_PROGRESS').length || 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.data.filter((s) => s.status === 'RESOLVED').length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <SnaggingFilters
          currentFilters={filters}
          onFilterChange={handleFilterChange}
          showUnitFilter={false}
        />
      </div>

      {/* Table */}
      <div className="mb-6">
        <SnaggingListTable
          snaggings={data?.data || []}
          isLoading={isLoading}
        />
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} items
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === 1}
              onClick={() => handlePageChange(data.pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {(() => {
                const maxVisible = 5
                let start = Math.max(1, data.pagination.page - Math.floor(maxVisible / 2))
                let end = Math.min(data.pagination.totalPages, start + maxVisible - 1)

                if (end - start < maxVisible - 1) {
                  start = Math.max(1, end - maxVisible + 1)
                }

                const pages = []
                for (let i = start; i <= end; i++) {
                  pages.push(i)
                }

                return pages.map((page) => (
                  <Button
                    key={page}
                    variant={page === data.pagination.page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === data.pagination.totalPages}
              onClick={() => handlePageChange(data.pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog - Note: No unitId since owner can select from their units */}
      <SnaggingCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleSnaggingCreated}
      />
    </div>
  )
}