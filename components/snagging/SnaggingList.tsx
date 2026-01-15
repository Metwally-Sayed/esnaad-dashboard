'use client'

import { Snagging } from '@/lib/types/snagging.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FileText, Calendar, Building2 } from 'lucide-react'
import { format } from 'date-fns'

interface SnaggingListProps {
  snaggings: Snagging[]
  isLoading: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext?: boolean
    hasPrev?: boolean
  }
  onPageChange?: (page: number) => void
  onSnaggingClick: (id: string) => void
}

export function SnaggingList({
  snaggings,
  isLoading,
  pagination,
  onPageChange,
  onSnaggingClick
}: SnaggingListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (snaggings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No snagging reports found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {snaggings.map((snagging) => (
        <Card
          key={snagging.id}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSnaggingClick(snagging.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{snagging.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {snagging.description}
                </p>
              </div>
              {snagging.pdfUrl && (
                <FileText className="h-5 w-5 text-primary" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {snagging.unit && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{snagging.unit.unitNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(snagging.createdAt), 'MMM d, yyyy')}</span>
              </div>
              {snagging.items && snagging.items.some(item => item.images && item.images.length > 0) && (
                <span>{snagging.items.reduce((total, item) => total + (item.images?.length || 0), 0)} image{snagging.items.reduce((total, item) => total + (item.images?.length || 0), 0) !== 1 ? 's' : ''}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
