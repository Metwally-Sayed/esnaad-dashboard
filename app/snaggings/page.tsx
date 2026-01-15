'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import useSWR from 'swr'
import snaggingService from '@/lib/api/snagging.service'
import { SnaggingFilters, SnaggingListResponse } from '@/lib/types/snagging.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, FileText, Image, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SnaggingListTable } from '@/components/snagging/SnaggingListTable'
import { SnaggingFilters as SnaggingFiltersComponent } from '@/components/snagging/SnaggingFilters'

export default function SnaggingsPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [filters, setFilters] = useState<SnaggingFilters>({
    page: 1,
    limit: 20
  })

  // Fetch owner's snaggings
  const { data, isLoading, mutate } = useSWR<SnaggingListResponse>(
    user?.role === 'OWNER' ? ['/snaggings/my', filters] : null,
    () => snaggingService.getMySnaggings(filters),
    {
      revalidateOnFocus: false
    }
  )

  // Block all access - owners should use unit profile widget instead
  // Admins should use /admin/snaggings
  if (user?.role !== 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  // Redirect to admin snaggings page
  if (isAdmin) {
    router.push('/admin/snaggings')
    return null
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<SnaggingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  // Calculate stats
  const totalSnaggings = data?.meta?.total || 0
  const withPdf = data?.data?.filter(s => s.pdfUrl).length || 0
  const withImages = data?.data?.filter(s => s.items && s.items.some(item => item.images && item.images.length > 0)).length || 0

  const pagination = data?.meta

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-primary" />
            My Snagging Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            View snagging inspection reports for your units
          </p>
        </div>
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSnaggings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF Available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{withPdf}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              With Images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{withImages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <SnaggingFiltersComponent
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Snaggings Table */}
      <Card>
        <CardContent className="p-0">
          <SnaggingListTable
            snaggings={data?.data || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} reports
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
