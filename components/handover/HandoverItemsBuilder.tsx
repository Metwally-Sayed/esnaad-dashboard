'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Plus, Trash2, GripVertical, Copy, AlertCircle, ChevronDown } from 'lucide-react'
import { HandoverItemStatus } from '@/lib/types/handover.types'
import { toast } from 'sonner'

export interface HandoverItemData {
  category: string
  label: string
  expectedValue?: string
  actualValue?: string
  status: HandoverItemStatus
  notes?: string
  sortOrder: number
}

interface ValidationError {
  index: number
  field: string
  message: string
}

interface HandoverItemsBuilderProps {
  items: HandoverItemData[]
  onChange: (items: HandoverItemData[]) => void
  disabled?: boolean
  onValidationChange?: (isValid: boolean, errors: ValidationError[]) => void
}

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Doors & Windows',
  'Flooring',
  'Walls & Ceiling',
  'Kitchen',
  'Bathroom',
  'General',
  'Safety',
  'Outdoor',
  'Other'
]

const COMMON_ITEMS = {
  'Electrical': [
    'All lights working',
    'Power outlets functional',
    'Circuit breaker accessible',
    'Light switches operational'
  ],
  'Plumbing': [
    'No leaks detected',
    'Hot water working',
    'Water pressure adequate',
    'Drainage functioning'
  ],
  'HVAC': [
    'Air conditioning working',
    'Heating system operational',
    'Thermostat functional',
    'Ventilation adequate'
  ],
  'Doors & Windows': [
    'All doors close properly',
    'Windows open and close smoothly',
    'Locks functional',
    'No broken glass'
  ],
  'Kitchen': [
    'Appliances working',
    'Cabinets in good condition',
    'Sink and faucet functional',
    'Countertops undamaged'
  ],
  'Bathroom': [
    'Toilet working properly',
    'Shower/bathtub functional',
    'Tiles in good condition',
    'Exhaust fan working'
  ],
  'General': [
    'Keys handed over',
    'Documentation provided',
    'Unit clean and ready',
    'Access cards provided'
  ]
}

export function HandoverItemsBuilder({ items, onChange, disabled, onValidationChange }: HandoverItemsBuilderProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Validation function
  const validateItems = (itemsToValidate: HandoverItemData[]): ValidationError[] => {
    const errors: ValidationError[] = []

    itemsToValidate.forEach((item, index) => {
      // Validate category
      if (!item.category || item.category.trim() === '') {
        errors.push({
          index,
          field: 'category',
          message: 'Category is required'
        })
      }

      // Validate label
      if (!item.label || item.label.trim() === '') {
        errors.push({
          index,
          field: 'label',
          message: 'Label is required'
        })
      } else if (item.label.length > 200) {
        errors.push({
          index,
          field: 'label',
          message: 'Label must be 200 characters or less'
        })
      }

      // Validate expected value length if provided
      if (item.expectedValue && item.expectedValue.length > 500) {
        errors.push({
          index,
          field: 'expectedValue',
          message: 'Expected value must be 500 characters or less'
        })
      }

      // Validate notes length if provided
      if (item.notes && item.notes.length > 1000) {
        errors.push({
          index,
          field: 'notes',
          message: 'Notes must be 1000 characters or less'
        })
      }

      // Check for duplicate labels in same category
      const duplicates = itemsToValidate.filter(
        (otherItem, otherIndex) =>
          otherIndex !== index &&
          otherItem.category === item.category &&
          otherItem.label.trim().toLowerCase() === item.label.trim().toLowerCase()
      )
      if (duplicates.length > 0) {
        errors.push({
          index,
          field: 'label',
          message: 'Duplicate item in same category'
        })
      }
    })

    return errors
  }

  // Update validation whenever items change
  const updateValidation = (newItems: HandoverItemData[]) => {
    const errors = validateItems(newItems)
    setValidationErrors(errors)
    if (onValidationChange) {
      onValidationChange(errors.length === 0, errors)
    }
  }

  const markFieldAsTouched = (index: number, field: string) => {
    setTouchedFields(prev => new Set(prev).add(`${index}-${field}`))
  }

  const isFieldTouched = (index: number, field: string) => {
    return touchedFields.has(`${index}-${field}`)
  }

  const getFieldError = (index: number, field: string) => {
    return validationErrors.find(err => err.index === index && err.field === field)
  }

  const addItem = () => {
    const newItem: HandoverItemData = {
      category: 'General',
      label: '',
      status: HandoverItemStatus.NA,
      sortOrder: items.length
    }
    const newItems = [...items, newItem]
    onChange(newItems)
    updateValidation(newItems)
  }

  const addQuickItem = (category: string, label: string) => {
    // Check if item already exists
    const exists = items.some(
      item => item.category === category && item.label.toLowerCase() === label.toLowerCase()
    )

    if (exists) {
      toast.error('This item has already been added')
      return
    }

    const newItem: HandoverItemData = {
      category,
      label,
      status: HandoverItemStatus.NA,
      sortOrder: items.length
    }
    const newItems = [...items, newItem]
    onChange(newItems)
    updateValidation(newItems)
    toast.success('Item added to checklist')
  }

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    // Reorder sortOrder
    updated.forEach((item, i) => {
      item.sortOrder = i
    })
    onChange(updated)
    updateValidation(updated)

    // Remove touched fields for this item
    const newTouched = new Set(touchedFields)
    Array.from(touchedFields).forEach(key => {
      if (key.startsWith(`${index}-`)) {
        newTouched.delete(key)
      }
    })
    setTouchedFields(newTouched)
  }

  const updateItem = (index: number, field: keyof HandoverItemData, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
    updateValidation(updated)
    markFieldAsTouched(index, field)
  }

  const duplicateItem = (index: number) => {
    const itemToCopy = items[index]
    const newItem: HandoverItemData = {
      ...itemToCopy,
      label: `${itemToCopy.label} (Copy)`,
      sortOrder: items.length
    }
    const newItems = [...items, newItem]
    onChange(newItems)
    updateValidation(newItems)
    toast.success('Item duplicated')
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return
    }

    const updated = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    // Swap items
    ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]

    // Update sortOrder
    updated.forEach((item, i) => {
      item.sortOrder = i
    })

    onChange(updated)
    // No need to revalidate on reorder
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item, index) => {
    const category = item.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push({ item, index })
    return acc
  }, {} as Record<string, Array<{ item: HandoverItemData; index: number }>>)

  // Count unique errors (not per field)
  const uniqueErrorItems = new Set(validationErrors.map(err => err.index)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Checklist Items</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} added
            {validationErrors.length > 0 && (
              <span className="text-destructive ml-2">
                • {uniqueErrorItems} item{uniqueErrorItems !== 1 ? 's' : ''} with errors
              </span>
            )}
          </p>
        </div>
        <Button type="button" onClick={addItem} size="sm" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Validation Summary */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Please fix the following errors:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {Array.from(new Set(validationErrors.map(err => `Item ${err.index + 1}: ${err.message}`))).map((msg, i) => (
                <li key={i} className="text-sm">{msg}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Add from Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Add from Templates</CardTitle>
          <CardDescription className="text-xs">
            Click to add common checklist items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(COMMON_ITEMS).map(([category, labels]) => (
            <Collapsible
              key={category}
              open={expandedCategory === category}
              onOpenChange={(open) => setExpandedCategory(open ? category : null)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted transition-colors h-auto"
                >
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {labels.length} items
                    </Badge>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedCategory === category ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2 ml-4 space-y-1">
                {labels.map((label) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    onClick={() => addQuickItem(category, label)}
                    disabled={disabled || items.some(i => i.label === label)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full justify-start p-2 rounded hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                  >
                    <Plus className="h-3 w-3" />
                    {label}
                    {items.some(i => i.label === label) && (
                      <Badge variant="secondary" className="ml-auto text-xs">Added</Badge>
                    )}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Items List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No checklist items yet. Add items using the button above or quick add from templates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </h4>
                <div className="h-px flex-1 bg-border" />
              </div>

              {categoryItems.map(({ item, index }) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    {/* Item Header with Controls */}
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1 mt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(index, 'up')}
                          disabled={disabled || index === 0}
                          className="h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(index, 'down')}
                          disabled={disabled || index === items.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                      </div>

                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />

                      <div className="flex-1 space-y-3">
                        {/* Category & Label */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Category *
                              {getFieldError(index, 'category') && isFieldTouched(index, 'category') && (
                                <span className="text-destructive ml-1">- {getFieldError(index, 'category')?.message}</span>
                              )}
                            </Label>
                            <Select
                              value={item.category}
                              onValueChange={(value) => updateItem(index, 'category', value)}
                              disabled={disabled}
                            >
                              <SelectTrigger className={`h-9 ${getFieldError(index, 'category') && isFieldTouched(index, 'category') ? 'border-destructive' : ''}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">
                              Label *
                              {getFieldError(index, 'label') && isFieldTouched(index, 'label') && (
                                <span className="text-destructive ml-1">- {getFieldError(index, 'label')?.message}</span>
                              )}
                            </Label>
                            <Input
                              value={item.label}
                              onChange={(e) => updateItem(index, 'label', e.target.value)}
                              onBlur={() => markFieldAsTouched(index, 'label')}
                              placeholder="e.g., All lights working"
                              disabled={disabled}
                              className={`h-9 ${getFieldError(index, 'label') && isFieldTouched(index, 'label') ? 'border-destructive' : ''}`}
                            />
                            {item.label && (
                              <p className="text-xs text-muted-foreground">
                                {item.label.length}/200 characters
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Expected Value */}
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Expected Value (Optional)
                            {getFieldError(index, 'expectedValue') && isFieldTouched(index, 'expectedValue') && (
                              <span className="text-destructive ml-1">- {getFieldError(index, 'expectedValue')?.message}</span>
                            )}
                          </Label>
                          <Input
                            value={item.expectedValue || ''}
                            onChange={(e) => updateItem(index, 'expectedValue', e.target.value)}
                            onBlur={() => markFieldAsTouched(index, 'expectedValue')}
                            placeholder="e.g., All functional, 220V, No leaks"
                            disabled={disabled}
                            className={`h-9 ${getFieldError(index, 'expectedValue') && isFieldTouched(index, 'expectedValue') ? 'border-destructive' : ''}`}
                          />
                          {item.expectedValue && (
                            <p className="text-xs text-muted-foreground">
                              {item.expectedValue.length}/500 characters
                            </p>
                          )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Admin Notes (Optional)
                            {getFieldError(index, 'notes') && isFieldTouched(index, 'notes') && (
                              <span className="text-destructive ml-1">- {getFieldError(index, 'notes')?.message}</span>
                            )}
                          </Label>
                          <Textarea
                            value={item.notes || ''}
                            onChange={(e) => updateItem(index, 'notes', e.target.value)}
                            onBlur={() => markFieldAsTouched(index, 'notes')}
                            placeholder="Add any special instructions or notes..."
                            disabled={disabled}
                            rows={2}
                            className={`text-sm ${getFieldError(index, 'notes') && isFieldTouched(index, 'notes') ? 'border-destructive' : ''}`}
                          />
                          {item.notes && (
                            <p className="text-xs text-muted-foreground">
                              {item.notes.length}/1000 characters
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateItem(index)}
                          disabled={disabled}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={disabled}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
