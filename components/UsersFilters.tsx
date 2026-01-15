'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react'
import { UserFilters, Role } from '@/lib/types/api.types'

interface UsersFiltersProps {
  onFilterChange: (filters: Partial<UserFilters>) => void
  currentFilters: UserFilters
}

export function UsersFilters({ onFilterChange, currentFilters }: UsersFiltersProps) {
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

  const handleRoleChange = (role: string) => {
    onFilterChange({
      role: role === 'all' ? undefined : role as Role
    })
  }

  const handleActiveChange = (isActive: string) => {
    onFilterChange({
      isActive: isActive === 'all' ? undefined : isActive === 'true'
    })
  }

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy: sortBy as any })
  }

  const handleSortOrderToggle = () => {
    onFilterChange({
      sortOrder: currentFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    onFilterChange({
      search: undefined,
      role: undefined,
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = currentFilters.search || currentFilters.role || currentFilters.isActive !== undefined

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
                aria-label="Clear search"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={currentFilters.role || 'all'}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={currentFilters.isActive === undefined ? 'all' : currentFilters.isActive.toString()}
                onValueChange={handleActiveChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={currentFilters.sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
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

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button
                variant="ghost"
                className="w-full"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}