'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UnitsTable } from './UnitsTable'
import { UnitsFilters } from './UnitsFilters'
import { Button } from './ui/button'
import { Plus, Home, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUnits, useUnitMutations } from '@/lib/hooks/use-units'
import { UnitFilters } from '@/lib/types/api.types'
import { toast } from 'sonner'

export function UnitsPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState<UnitFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { units = [], pagination, isLoading, mutate } = useUnits(filters)
  const { deleteUnit, isDeleting } = useUnitMutations()

  const handleAddUnit = () => {
    router.push('/units/create')
  }

  const handleEditUnit = (unitId: string) => {
    router.push(`/units/${unitId}/edit`)
  }

  const handleDeleteUnit = async (unitId: string) => {
    try {
      await deleteUnit(unitId)
      toast.success('Unit deleted successfully')
      mutate() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete unit')
    }
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (newFilters: Partial<UnitFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header - Responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Units</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {isAdmin ? 'Manage and monitor all property units' : 'View property units and their details'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddUnit} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Units</p>
          <p className="text-2xl font-bold">{pagination?.total || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {Array.isArray(units) ? units.filter(u => u.status === 'available').length : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Occupied</p>
          <p className="text-2xl font-bold text-blue-600">
            {Array.isArray(units) ? units.filter(u => u.status === 'occupied').length : 0}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Maintenance</p>
          <p className="text-2xl font-bold text-yellow-600">
            {Array.isArray(units) ? units.filter(u => u.status === 'maintenance').length : 0}
          </p>
        </div>
      </div> */}

      {/* Filters */}
      <div className="mb-6">
        <UnitsFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      {/* Units Table */}
      <div className="mb-6">
        <UnitsTable
          units={units}
          isLoading={isLoading}
          onEdit={isAdmin ? handleEditUnit : undefined}
          onDelete={isAdmin ? handleDeleteUnit : undefined}
          isDeleting={isDeleting}
          
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} units
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