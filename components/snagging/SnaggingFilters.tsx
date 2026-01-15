'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, X } from 'lucide-react'
import { SnaggingFilters as SnaggingFiltersType } from '@/lib/types/snagging.types'

interface SnaggingFiltersProps {
  onFilterChange: (filters: Partial<SnaggingFiltersType>) => void
  currentFilters: SnaggingFiltersType
}

export function SnaggingFilters({ onFilterChange, currentFilters }: SnaggingFiltersProps) {
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

  const clearFilters = () => {
    setSearchTerm('')
    onFilterChange({
      search: undefined
    })
  }

  const hasActiveFilters = currentFilters.search

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, unit, or description..."
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
          <div className="flex justify-center">
            {/* Clear Filters */}
            <Button
              variant="ghost"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
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
