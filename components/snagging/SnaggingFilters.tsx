'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { type SnaggingFilters as SnaggingFiltersType, SnaggingStatus, SnaggingPriority } from '@/lib/types/snagging.types'

interface SnaggingFiltersProps {
  onFilterChange: (filters: Partial<SnaggingFiltersType>) => void
  currentFilters: SnaggingFiltersType
  showUnitFilter?: boolean
  unitId?: string // Pre-selected unit for embedded view
}

export function SnaggingFilters({
  onFilterChange,
  currentFilters,
  showUnitFilter = false,
  unitId
}: SnaggingFiltersProps) {
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

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value as SnaggingStatus | 'ALL' })
  }

  const handlePriorityChange = (value: string) => {
    onFilterChange({ priority: value as SnaggingPriority | 'ALL' })
  }

  const handleSortByChange = (value: string) => {
    onFilterChange({ sortBy: value as any })
  }

  const handleSortOrderToggle = () => {
    onFilterChange({
      sortOrder: currentFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    onFilterChange({
      search: '',
      status: undefined,
      priority: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  // Count active filters
  const activeFilterCount = [
    currentFilters.search,
    currentFilters.status && currentFilters.status !== 'ALL',
    currentFilters.priority && currentFilters.priority !== 'ALL'
  ].filter(Boolean).length

  // Status options with colors
  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: SnaggingStatus.OPEN, label: 'Open', color: 'bg-red-100 text-red-800' },
    { value: SnaggingStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: SnaggingStatus.RESOLVED, label: 'Resolved', color: 'bg-green-100 text-green-800' },
    { value: SnaggingStatus.CLOSED, label: 'Closed', color: 'bg-gray-100 text-gray-800' }
  ]

  // Priority options with colors
  const priorityOptions = [
    { value: 'ALL', label: 'All Priority' },
    { value: SnaggingPriority.LOW, label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: SnaggingPriority.MEDIUM, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: SnaggingPriority.HIGH, label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: SnaggingPriority.URGENT, label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} size="default">
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={currentFilters.status || 'ALL'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.color ? (
                        <div className="flex items-center gap-2">
                          <Badge className={option.color} variant="secondary">
                            {option.label}
                          </Badge>
                        </div>
                      ) : (
                        option.label
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={currentFilters.priority || 'ALL'}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.color ? (
                        <div className="flex items-center gap-2">
                          <Badge className={option.color} variant="secondary">
                            {option.label}
                          </Badge>
                        </div>
                      ) : (
                        option.label
                      )}
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
                onValueChange={handleSortByChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                  <SelectItem value="lastActivityAt">Last Activity</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort Order</label>
              <Button
                variant="outline"
                onClick={handleSortOrderToggle}
                className="w-full justify-between"
              >
                {currentFilters.sortOrder === 'asc' ? (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    Descending
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {currentFilters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {currentFilters.search}
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      onFilterChange({ search: '' })
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentFilters.status && currentFilters.status !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {currentFilters.status}
                  <button
                    onClick={() => onFilterChange({ status: undefined })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentFilters.priority && currentFilters.priority !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  Priority: {currentFilters.priority}
                  <button
                    onClick={() => onFilterChange({ priority: undefined })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}