'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, AlertCircle, FileText, Calendar, Building2, Eye } from 'lucide-react'
import { useUnitSnaggings } from '@/lib/hooks/use-snagging'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface UnitSnaggingListProps {
  unitId: string
  unitNumber: string
  ownerId?: string
}

export function UnitSnaggingList({ unitId, unitNumber, ownerId }: UnitSnaggingListProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useUnitSnaggings(unitId, {
    page,
    limit
  })

  const snaggings = data?.data || []
  const pagination = data?.meta

  const handleViewSnagging = (id: string) => {
    router.push(`/snaggings/${id}`)
  }

  const handleCreateSnagging = () => {
    router.push(`/snaggings/create?unitId=${unitId}`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Snagging Reports</CardTitle>
              <CardDescription>Unit {unitNumber}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snagging Reports</CardTitle>
          <CardDescription>Unit {unitNumber}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Failed to load snagging reports'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Snagging Reports</CardTitle>
            <CardDescription>
              Unit {unitNumber} • {pagination?.total || 0} total
            </CardDescription>
          </div>
          <Button onClick={handleCreateSnagging} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Snagging
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!snaggings || snaggings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No snagging reports found for this unit</p>
            <Button onClick={handleCreateSnagging} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Snagging Report
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {snaggings.map((snagging) => (
              <Card
                key={snagging.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleViewSnagging(snagging.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{snagging.title}</CardTitle>
                        {snagging.pdfUrl && (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {snagging.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {snagging.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {snagging.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(snagging.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    {snagging.items && snagging.items.some(item => item.images && item.images.length > 0) && (
                      <span>{snagging.items.reduce((total, item) => total + (item.images?.length || 0), 0)} image{snagging.items.reduce((total, item) => total + (item.images?.length || 0), 0) !== 1 ? 's' : ''}</span>
                    )}
                    {snagging.owner && (
                      <span>Owner: {snagging.owner.name || snagging.owner.email}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
