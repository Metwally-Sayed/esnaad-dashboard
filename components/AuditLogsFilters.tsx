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
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react'
import { type AuditLogFilters, AuditAction } from '@/lib/types/audit.types'

interface AuditLogsFiltersProps {
  onFilterChange: (filters: Partial<AuditLogFilters>) => void
  currentFilters: AuditLogFilters
}

export function AuditLogsFilters({
  onFilterChange,
  currentFilters
}: AuditLogsFiltersProps) {
  // Note: search is not available in AuditLogFilters type, commenting out for now
  // const [searchTerm, setSearchTerm] = useState(currentFilters.search || '')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = () => {
    // onFilterChange({ search: searchTerm })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleActionChange = (value: string) => {
    onFilterChange({ action: value === 'all' ? undefined : value as AuditAction })
  }

  const handleEntityTypeChange = (value: string) => {
    onFilterChange({ entityType: value === 'all' ? undefined : value })
  }

  const handleStartDateChange = (value: string) => {
    onFilterChange({ startDate: value || undefined })
  }

  const handleEndDateChange = (value: string) => {
    onFilterChange({ endDate: value || undefined })
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
    // setSearchTerm('')
    onFilterChange({
      // search: '',
      action: undefined,
      entityType: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  // Count active filters
  const activeFilterCount = [
    // currentFilters.search,
    currentFilters.action,
    currentFilters.entityType,
    currentFilters.startDate,
    currentFilters.endDate
  ].filter(Boolean).length

  // Action options with colors
  const actionOptions = [
    { value: 'USER_CREATED', label: 'User Created', color: 'bg-green-100 text-green-800' },
    { value: 'USER_UPDATED', label: 'User Updated', color: 'bg-blue-100 text-blue-800' },
    { value: 'USER_DELETED', label: 'User Deleted', color: 'bg-red-100 text-red-800' },
    { value: 'UNIT_CREATED', label: 'Unit Created', color: 'bg-green-100 text-green-800' },
    { value: 'UNIT_UPDATED', label: 'Unit Updated', color: 'bg-blue-100 text-blue-800' },
    { value: 'UNIT_DELETED', label: 'Unit Deleted', color: 'bg-red-100 text-red-800' },
    { value: 'UNIT_ASSIGNED', label: 'Unit Assigned', color: 'bg-purple-100 text-purple-800' },
    { value: 'UNIT_UNASSIGNED', label: 'Unit Unassigned', color: 'bg-gray-100 text-gray-800' },
    { value: 'PROJECT_CREATED', label: 'Project Created', color: 'bg-green-100 text-green-800' },
    { value: 'PROJECT_UPDATED', label: 'Project Updated', color: 'bg-blue-100 text-blue-800' },
    { value: 'PROJECT_DELETED', label: 'Project Deleted', color: 'bg-red-100 text-red-800' },
  ]

  // Entity type options
  const entityTypeOptions = [
    { value: 'user', label: 'Users' },
    { value: 'unit', label: 'Units' },
    { value: 'project', label: 'Projects' },
    { value: 'snagging', label: 'Snaggings' },
  ]

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search functionality commented out - not supported in AuditLogFilters type */}
        {/* <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by actor, entity ID, or changes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} size="default">
            Search
          </Button>
        </div> */}
        <div className="flex-1"></div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Action Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select
                value={currentFilters.action || 'all'}
                onValueChange={handleActionChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={option.color} variant="secondary">
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Entity Type</label>
              <Select
                value={currentFilters.entityType || 'all'}
                onValueChange={handleEntityTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={currentFilters.startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={currentFilters.endDate || ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                    Oldest First
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    Newest First
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {/* Search badge commented out - not supported in AuditLogFilters type */}
              {/* {currentFilters.search && (
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
              )} */}
              {currentFilters.action && (
                <Badge variant="secondary" className="gap-1">
                  Action: {actionOptions.find(a => a.value === currentFilters.action)?.label}
                  <button
                    onClick={() => onFilterChange({ action: undefined })}
                    className="ml-1 hover:text-destructive"
                    aria-label="Remove action filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentFilters.entityType && (
                <Badge variant="secondary" className="gap-1">
                  Entity: {entityTypeOptions.find(e => e.value === currentFilters.entityType)?.label}
                  <button
                    onClick={() => onFilterChange({ entityType: undefined })}
                    className="ml-1 hover:text-destructive"
                    aria-label="Remove entity type filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentFilters.startDate && (
                <Badge variant="secondary" className="gap-1">
                  From: {new Date(currentFilters.startDate).toLocaleDateString()}
                  <button
                    onClick={() => onFilterChange({ startDate: undefined })}
                    className="ml-1 hover:text-destructive"
                    aria-label="Remove start date filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentFilters.endDate && (
                <Badge variant="secondary" className="gap-1">
                  To: {new Date(currentFilters.endDate).toLocaleDateString()}
                  <button
                    onClick={() => onFilterChange({ endDate: undefined })}
                    className="ml-1 hover:text-destructive"
                    aria-label="Remove end date filter"
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