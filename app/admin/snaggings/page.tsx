'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SnaggingListTable } from '@/components/snagging/SnaggingListTable'
import { useAuth } from '@/contexts/AuthContext'
import { useUnits } from '@/lib/hooks/use-units'
import { useUsers } from '@/lib/hooks/use-users'
import useSWR from 'swr'
import snaggingService from '@/lib/api/snagging.service'
import { SnaggingFilters, SnaggingListResponse } from '@/lib/types/snagging.types'
import { Plus, Search, RefreshCw, AlertTriangle, FileText, Image } from 'lucide-react'

export default function AdminSnaggingsPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAuth()
  const [filters, setFilters] = useState<SnaggingFilters>({
    page: 1,
    limit: 20
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Redirect non-admin users (using useEffect for client-side redirect)
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, authLoading, router])

  // Don't render anything while checking auth or if not admin
  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Fetch all snaggings
  const { data, isLoading, mutate } = useSWR<SnaggingListResponse>(
    ['/admin/snaggings', filters],
    () => snaggingService.getAllSnaggings(filters),
    {
      revalidateOnFocus: false
    }
  )

  // Fetch units and owners for filters
  const { units } = useUnits({ limit: 100 })
  const { users: owners } = useUsers({ role: 'OWNER', limit: 100 })

  const handleFilterChange = (newFilters: Partial<SnaggingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm || undefined })
  }

  const handleDelete = () => {
    mutate()
  }

  // Calculate stats
  const totalSnaggings = data?.meta?.total || 0
  const withPdf = data?.data?.filter(s => s.pdfUrl).length || 0
  const acceptedCount = data?.data?.filter(s => s.status === 'ACCEPTED').length || 0

  const pagination = data?.meta

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-primary" />
            Snagging Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all snagging inspection reports across all units
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/snaggings/create')} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Snagging
          </Button>
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              PDF Generated
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
            <div className="text-2xl font-bold text-blue-600">
              {data?.data?.filter(s => s.items && s.items.some(item => item.images && item.images.length > 0)).length || 0}
            </div>
          </CardContent>
        </Card>
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
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Unit</label>
              <Select
                value={filters.unitId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange({ unitId: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Owner</label>
              <Select
                value={filters.ownerId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange({ ownerId: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
            </div>
            <div className="flex items-end">
              {(filters.unitId || filters.ownerId || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setFilters({ page: 1, limit: 20 })
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snaggings Table */}
      <Card>
        <CardContent className="p-0">
          <SnaggingListTable
            snaggings={data?.data || []}
            isLoading={isLoading}
            onDelete={handleDelete}
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
