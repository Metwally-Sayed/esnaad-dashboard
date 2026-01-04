'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSnaggings, useMySnaggings } from '@/lib/hooks/use-snagging'
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
  const isAdmin = userRole === 'admin'
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Use different hooks based on role
  // Admin sees all snaggings, owner sees only their snaggings
  const adminData = useSnaggings(filters)
  const ownerData = useMySnaggings(filters)

  const { data, isLoading, mutate } = isAdmin ? adminData : ownerData

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

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary" />
            {isAdmin ? 'All Snagging Issues' : 'My Snagging Issues'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin
              ? 'Manage and track all snagging items across all units'
              : 'Track and manage snagging items for your units'}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Filters */}
      <SnaggingFilters
        currentFilters={filters}
        onFilterChange={handleFilterChange}
        showUnitFilter={false}
      />

      {/* Snagging List Table */}
      <div className="mb-6">
        <SnaggingListTable
          snaggings={data?.data || []}
          isLoading={isLoading}
          onDelete={(id) => mutate()}
        />
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === 1}
              onClick={() => handlePageChange(data.pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === data.pagination.totalPages}
              onClick={() => handlePageChange(data.pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <SnaggingCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleSnaggingCreated}
      />
    </div>
  )
}