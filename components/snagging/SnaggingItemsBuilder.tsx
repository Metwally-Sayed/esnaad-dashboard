'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUploader, ImageWithComment } from './ImageUploader'

/**
 * Severity levels for snagging items
 */
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/**
 * A single snagging item with images
 */
export interface SnaggingItem {
  id: string
  category: string
  label: string
  location: string
  severity: SeverityLevel
  notes?: string
  images: ImageWithComment[]
}

/**
 * Props for the SnaggingItemsBuilder component
 */
interface SnaggingItemsBuilderProps {
  value: SnaggingItem[]
  onChange: (items: SnaggingItem[]) => void
  disabled?: boolean
  errors?: Record<string, string>
}

/**
 * Color mapping for severity levels
 */
const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300'
}

const SEVERITY_LEVELS: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

/**
 * SnaggingItemsBuilder Component
 *
 * Manages a collection of snagging items with support for:
 * - Multiple items per snagging (0-50)
 * - Categorization of items
 * - Multiple images per item (0-5)
 * - Severity levels
 * - Reordering items
 * - Editing and deletion
 */
export function SnaggingItemsBuilder({
  value = [],
  onChange,
  disabled = false,
  errors = {}
}: SnaggingItemsBuilderProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<SnaggingItem>>({
    category: '',
    label: '',
    location: '',
    severity: 'MEDIUM',
    notes: '',
    images: []
  })

  /**
   * Check if form is valid for submission
   */
  const isFormValid = useCallback(() => {
    return (
      formData.category?.trim() &&
      formData.label?.trim() &&
      formData.location?.trim() &&
      formData.severity
    )
  }, [formData])

  /**
   * Add a new item
   */
  const handleAddItem = useCallback(() => {
    if (!isFormValid()) return

    const newItem: SnaggingItem = {
      id: `item_${Date.now()}`,
      category: formData.category || '',
      label: formData.label || '',
      location: formData.location || '',
      severity: formData.severity as SeverityLevel || 'MEDIUM',
      notes: formData.notes,
      images: formData.images || []
    }

    onChange([...value, newItem])

    // Reset form
    setFormData({
      category: '',
      label: '',
      location: '',
      severity: 'MEDIUM',
      notes: '',
      images: []
    })
  }, [value, onChange, isFormValid, formData])

  /**
   * Remove an item
   */
  const handleRemoveItem = useCallback((itemId: string) => {
    onChange(value.filter(item => item.id !== itemId))
    setExpandedItemId(null)
  }, [value, onChange])

  /**
   * Update an item
   */
  const handleUpdateItem = useCallback((itemId: string, updates: Partial<SnaggingItem>) => {
    onChange(
      value.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    )
  }, [value, onChange])

  /**
   * Move item up in the list
   */
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return
    const newItems = [...value]
    ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
    onChange(newItems)
  }, [value, onChange])

  /**
   * Move item down in the list
   */
  const handleMoveDown = useCallback((index: number) => {
    if (index >= value.length - 1) return
    const newItems = [...value]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    onChange(newItems)
  }, [value, onChange])

  /**
   * Get unique categories from items
   */
  const categories = Array.from(new Set(value.map(item => item.category)))

  /**
   * Group items by category
   */
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = value.filter(item => item.category === cat)
    return acc
  }, {} as Record<string, SnaggingItem[]>)

  return (
    <div className="space-y-6">
      {/* Add New Item Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Snagging Item</CardTitle>
          <CardDescription>Add issues found during inspection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Input */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              placeholder="e.g., Electrical, Plumbing, Painting"
              value={formData.category || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              disabled={disabled}
            />
            {errors.category && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Issue Description */}
          <div className="space-y-2">
            <Label htmlFor="label">Issue Description *</Label>
            <Input
              id="label"
              placeholder="e.g., Master bedroom ceiling light not working"
              value={formData.label || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              disabled={disabled}
            />
            {errors.label && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.label}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Master Bedroom, Kitchen, Living Room"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              disabled={disabled}
            />
            {errors.location && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Severity Level */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level *</Label>
            <Select
              value={formData.severity || 'MEDIUM'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as SeverityLevel }))}
              disabled={disabled}
            >
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.severity && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.severity}
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes for this issue..."
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              disabled={disabled}
              rows={3}
            />
          </div>

          {/* Image Upload for New Item */}
          <div className="space-y-2">
            <Label>Images (optional, max 5 per item)</Label>
            <ImageUploader
              value={formData.images || []}
              onChange={(images) => setFormData(prev => ({ ...prev, images }))}
              maxFiles={5}
              maxSize={5}
              disabled={disabled}
            />
          </div>

          {/* Add Item Button */}
          <Button
            type="button"
            onClick={handleAddItem}
            disabled={disabled || !isFormValid() || value.length >= 50}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item ({value.length}/50)
          </Button>

          {value.length >= 50 && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Maximum 50 items per snagging report
            </p>
          )}
        </CardContent>
      </Card>

      {/* Items List by Category */}
      {value.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items Overview</CardTitle>
            <CardDescription>
              {value.length} item{value.length !== 1 ? 's' : ''} across {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {categories.map(category => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">{category}</h3>
                <div className="space-y-2">
                  {itemsByCategory[category].map((item, index) => {
                    const globalIndex = value.findIndex(i => i.id === item.id)
                    const isExpanded = expandedItemId === item.id

                    return (
                      <Card key={item.id} className="overflow-hidden">
                        <div
                          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.label}</p>
                                <Badge className={cn('px-2 py-0.5 text-xs', SEVERITY_COLORS[item.severity])}>
                                  {item.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.location}</p>
                            </div>
                            <ChevronDown
                              className={cn(
                                'h-5 w-5 text-muted-foreground transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t px-4 py-4 space-y-4 bg-muted/30">
                            {/* Edit Form */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`label-${item.id}`}>Issue Description</Label>
                                <Input
                                  id={`label-${item.id}`}
                                  value={item.label}
                                  onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                                  disabled={disabled}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`location-${item.id}`}>Location</Label>
                                <Input
                                  id={`location-${item.id}`}
                                  value={item.location}
                                  onChange={(e) => handleUpdateItem(item.id, { location: e.target.value })}
                                  disabled={disabled}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`severity-${item.id}`}>Severity Level</Label>
                                <Select
                                  value={item.severity}
                                  onValueChange={(value) => handleUpdateItem(item.id, { severity: value as SeverityLevel })}
                                  disabled={disabled}
                                >
                                  <SelectTrigger id={`severity-${item.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SEVERITY_LEVELS.map(level => (
                                      <SelectItem key={level} value={level}>
                                        {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                                <Textarea
                                  id={`notes-${item.id}`}
                                  value={item.notes || ''}
                                  onChange={(e) => handleUpdateItem(item.id, { notes: e.target.value })}
                                  disabled={disabled}
                                  rows={2}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Images ({item.images.length}/5)</Label>
                                <ImageUploader
                                  value={item.images}
                                  onChange={(images) => handleUpdateItem(item.id, { images })}
                                  maxFiles={5}
                                  maxSize={5}
                                  disabled={disabled}
                                />
                              </div>
                            </div>

                            {/* Item Actions */}
                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveUp(globalIndex)}
                                disabled={disabled || globalIndex === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveDown(globalIndex)}
                                disabled={disabled || globalIndex === value.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={disabled}
                                className="ml-auto"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">
                No items added yet. Add items above to build your snagging report.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
