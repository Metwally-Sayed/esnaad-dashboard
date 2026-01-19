'use client'

import { SnaggingListTable } from '@/components/snagging/SnaggingListTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import snaggingService from '@/lib/api/snagging.service'
import { useUnits } from '@/lib/hooks/use-units'
import { useUsers } from '@/lib/hooks/use-users'
import { SnaggingFilters, SnaggingListResponse, SnaggingStats } from '@/lib/types/snagging.types'
import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Image, Plus, RefreshCw, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'

export function SnaggingsContent() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [filters, setFilters] = useState<SnaggingFilters>({
    page: 1,
    limit: 20
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data based on role
  const { data, isLoading, mutate } = useSWR<SnaggingListResponse>(
    isAdmin ? ['/admin/snaggings', filters] : ['/snaggings/my', filters],
    () => isAdmin ? snaggingService.getAllSnaggings(filters) : snaggingService.getMySnaggings(filters),
    {
      revalidateOnFocus: false
    }
  )

  // Fetch stats from API (admin only)
  const { data: stats } = useSWR<SnaggingStats>(
    isAdmin ? '/snaggings/stats' : null,
    () => snaggingService.getStats(),
    { revalidateOnFocus: false }
  )

  // Fetch units and owners for filters (admin only)
  const { units } = useUnits({ limit: 100 })
  const { users: owners } = useUsers({ role: 'OWNER', limit: 100 })

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<SnaggingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm || undefined })
  }

  const handleDelete = () => {
    mutate()
  }

  // Use stats from API for accurate totals (admin) or calculate from page data (owner)
  const totalSnaggings = isAdmin ? (stats?.total ?? data?.meta?.total ?? 0) : (data?.meta?.total ?? 0)
  const withPdf = isAdmin ? (stats?.withPdf ?? 0) : (data?.data?.filter(s => s.pdfUrl).length ?? 0)
  const withImages = isAdmin ? (stats?.withImages ?? 0) : (data?.data?.filter(s => s.items && s.items.some(item => item.images && item.images.length > 0)).length ?? 0)
  const acceptedCount = stats?.accepted ?? 0

  const pagination = data?.meta

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-primary" />
            {isAdmin ? "Snagging Reports" : "My Snagging Reports"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "Manage all snagging inspection reports across all units"
              : "View snagging inspection reports for your units"}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => router.push('/snaggings/create')} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Snagging
            </Button>
          )}
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6`}>
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
        {isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                Accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          {isAdmin && (
            <>
              <Select
                value={filters.unitId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange({ unitId: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unitNumber} {unit.buildingName && `- ${unit.buildingName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.ownerId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange({ ownerId: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name || owner.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          {(filters.unitId || filters.ownerId || searchTerm) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setFilters({ page: 1, limit: 20 })
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Snaggings Table */}
      <div className="mb-6">
        <SnaggingListTable
          snaggings={data?.data || []}
          isLoading={isLoading}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} reports
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
                return pages.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
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
