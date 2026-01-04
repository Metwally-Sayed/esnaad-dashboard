'use client'

import { useState } from 'react'
import { useUnitSnaggings } from '@/lib/hooks/use-snagging'
import { SnaggingFilters as FiltersType } from '@/lib/types/snagging.types'
import { SnaggingListTable } from './SnaggingListTable'
import { SnaggingCreateDialog } from './SnaggingCreateDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SnaggingListProps {
  unitId: string
  unitNumber?: string
  ownerId?: string
}

export function SnaggingList({ unitId, unitNumber, ownerId }: SnaggingListProps) {
  const { userId, userRole } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 5, // Smaller limit for embedded view
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Fetch snaggings for this unit
  const { data, isLoading } = useUnitSnaggings(unitId, filters)

  const isOwner = ownerId && ownerId === userId
  const isAdmin = userRole === 'admin'
  // Admin can always create, owner can create for their units
  const canCreate = isAdmin || isOwner

  // Debug logging
  console.log('SnaggingList permissions:', {
    ownerId,
    userId,
    userRole,
    isOwner,
    isAdmin,
    canCreate
  })

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleSnaggingCreated = (snaggingId: string) => {
    // You could navigate to the snagging or just refresh the list
    setShowCreateDialog(false)
  }

  const getStatusCounts = () => {
    if (!data?.data) return { open: 0, inProgress: 0, resolved: 0 }

    return {
      open: data.data.filter((s) => s.status === 'OPEN').length,
      inProgress: data.data.filter((s) => s.status === 'IN_PROGRESS').length,
      resolved: data.data.filter((s) => s.status === 'RESOLVED').length,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <CardTitle>Snagging Items</CardTitle>
              {data?.pagination?.total && data.pagination.total > 0 && (
                <Badge variant="secondary">{data.pagination.total}</Badge>
              )}
            </div>
            {canCreate && (
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Report Issue
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Summary */}
          {data?.pagination?.total && data.pagination.total > 0 && (
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Open:</span>
                <span className="font-medium">{statusCounts.open}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">In Progress:</span>
                <span className="font-medium">{statusCounts.inProgress}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Resolved:</span>
                <span className="font-medium">{statusCounts.resolved}</span>
              </div>
            </div>
          )}

          {/* Snagging Table */}
          <SnaggingListTable
            snaggings={data?.data || []}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <SnaggingCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        unitId={unitId}
        unitNumber={unitNumber}
        onSuccess={handleSnaggingCreated}
      />
    </>
  )
}