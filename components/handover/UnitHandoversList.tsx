'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { HandoverStatusBadge } from './HandoverStatusBadge'
import { HandoverCreateDialog } from '@/components/handovers/HandoverCreateDialog'
import { unitHandoverService } from '@/lib/api/handover.service'
import { HandoverFilters, Handover } from '@/lib/types/handover.types'
import useSWR from 'swr'
import { Plus, FileText, ArrowRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { EmptyState } from '@/components/ui/empty-state'

interface UnitHandoversListProps {
  unitId: string
  unitNumber: string
  ownerId?: string | null
}

export function UnitHandoversList({ unitId, unitNumber, ownerId }: UnitHandoversListProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<HandoverFilters>({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { data, error, isLoading, mutate } = useSWR(
    ['unit-handovers', unitId, filters],
    () => unitHandoverService.getHandoversForUnit(unitId, filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  // Debug logging
  console.log('UnitHandoversList Debug:', {
    unitId,
    data,
    items: data?.items,
    pagination: data?.pagination,
    error,
    isLoading
  })

  const handovers = data?.items || []
  const pagination = data?.pagination

  const handleCreateHandover = () => {
    setShowCreateDialog(true)
  }

  const handleHandoverCreated = (handoverId: string) => {
    setShowCreateDialog(false)
    mutate() // Refresh the list
    router.push(`/handovers/${handoverId}`)
  }

  const handleViewHandover = (handoverId: string) => {
    router.push(`/handovers/${handoverId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Handovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Handovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load handovers
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Handovers
            </CardTitle>
            <CardDescription className="mt-1">
              Formal handover agreements for unit {unitNumber}
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={handleCreateHandover} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Handover
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {handovers.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No handovers created yet"
            description={
              isAdmin && !ownerId
                ? "Assign an owner to this unit before creating handovers"
                : "Formal handover agreements will appear here"
            }
            action={
              isAdmin && ownerId
                ? {
                    label: "Create First Handover",
                    onClick: handleCreateHandover,
                    icon: Plus
                  }
                : undefined
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {handovers.map((handover) => (
                  <TableRow key={handover.id}>
                    <TableCell>
                      <HandoverStatusBadge status={handover.status} />
                    </TableCell>
                    <TableCell>
                      {handover.scheduledAt ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(handover.scheduledAt), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(handover.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHandover(handover.id)}
                      >
                        View
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Show more button if there are more handovers */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/units/${unitId}/handovers`)}
                >
                  View All Handovers ({pagination.total})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Create Handover Dialog */}
      <HandoverCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        unitId={unitId}
        unitNumber={unitNumber}
        ownerId={ownerId || undefined}
        onSuccess={handleHandoverCreated}
      />
    </Card>
  )
}