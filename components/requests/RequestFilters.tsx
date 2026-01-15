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
import { RequestFilters as RequestFiltersType } from '@/lib/types/request.types'

interface RequestFiltersProps {
  onFilterChange: (filters: Partial<RequestFiltersType>) => void
  currentFilters: RequestFiltersType
}

export function RequestFilters({ onFilterChange, currentFilters }: RequestFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = () => {
    onFilterChange({ search: searchTerm })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy: sortBy as any })
  }

  const handleSortOrderToggle = () => {
    onFilterChange({
      sortOrder: currentFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleStatusChange = (status: string) => {
    onFilterChange({ status: status === 'all' ? undefined : status as any })
  }

  const handleTypeChange = (type: string) => {
    onFilterChange({ type: type === 'all' ? undefined : type as any })
  }

  const clearFilters = () => {
    setSearchTerm('')
    onFilterChange({
      search: undefined,
      status: undefined,
      type: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = currentFilters.search || currentFilters.status || currentFilters.type

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by visitor, company, unit..."
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
        <div className="p-4 border rounded-lg bg-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={currentFilters.status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={currentFilters.type || 'all'}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="GUEST_VISIT">Guest Visit</SelectItem>
                  <SelectItem value="WORK_PERMISSION">Work Permission</SelectItem>
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
                  <SelectItem value="approvedAt">Approved Date</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort Order</label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSortOrderToggle}
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
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
