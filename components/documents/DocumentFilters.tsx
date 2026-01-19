'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react'
import { DocumentFilters as DocumentFiltersType, DocumentCategory } from '@/lib/types/unit-documents.types'
import { useUnits } from '@/lib/hooks/use-units'
import { useUsers } from '@/lib/hooks/use-users'

interface DocumentFiltersProps {
  onFilterChange: (filters: Partial<DocumentFiltersType>) => void
  currentFilters: DocumentFiltersType
  showUnitFilter?: boolean // For admin view
}

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.CONTRACT]: 'Contract',
  [DocumentCategory.BILL]: 'Bill',
  [DocumentCategory.OTHER]: 'Other',
}

export function DocumentFilters({
  onFilterChange,
  currentFilters,
  showUnitFilter = false,
}: DocumentFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '')
  const [isExpanded, setIsExpanded] = useState(false)

  // Fetch units and users for admin filters
  const { units } = useUnits({ limit: 100 })
  const { users } = useUsers({ limit: 100 })

  const handleSearch = () => {
    onFilterChange({ search: searchTerm })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      category: value === 'all' ? undefined : (value as DocumentCategory),
    })
  }

  const handleUnitChange = (value: string) => {
    onFilterChange({
      unitId: value === 'all' ? undefined : value,
    })
  }

  const handleUploadedByChange = (value: string) => {
    onFilterChange({
      uploadedByUserId: value === 'all' ? undefined : value,
    })
  }

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy })
  }

  const handleSortOrderToggle = () => {
    onFilterChange({
      sortOrder: currentFilters.sortOrder === 'asc' ? 'desc' : 'asc',
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    onFilterChange({
      search: undefined,
      category: undefined,
      unitId: undefined,
      uploadedByUserId: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }

  const hasActiveFilters = currentFilters.search || currentFilters.category || currentFilters.unitId || currentFilters.uploadedByUserId

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={showUnitFilter ? "Search by title or unit..." : "Search by title..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  onFilterChange({ search: undefined })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>

        {/* Filter Toggle */}
        <Button
          variant={isExpanded ? 'default' : 'outline'}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">
              Active
            </span>
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4 border rounded-lg bg-muted/30">
          {/* Unit Filter (Admin only) */}
          {showUnitFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Select
                value={currentFilters.unitId || 'all'}
                onValueChange={handleUnitChange}
              >
                <SelectTrigger>
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
            </div>
          )}

          {/* Uploaded By Filter (Admin only) */}
          {showUnitFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Uploaded By</label>
              <Select
                value={currentFilters.uploadedByUserId || 'all'}
                onValueChange={handleUploadedByChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={currentFilters.category || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={currentFilters.sortBy || 'createdAt'}
              onValueChange={handleSortChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="sizeBytes">File Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort Order</label>
            <Button
              variant="outline"
              onClick={handleSortOrderToggle}
              className="w-full justify-start"
            >
              {currentFilters.sortOrder === 'asc' ? (
                <>
                  <SortAsc className="h-4 w-4 mr-2" />
                  Ascending
                </>
              ) : (
                <>
                  <SortDesc className="h-4 w-4 mr-2" />
                  Descending
                </>
              )}
            </Button>
          </div>

          {/* Clear Filters */}
          <div className="space-y-2 flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
