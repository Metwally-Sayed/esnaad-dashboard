'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, MinusCircle, AlertCircle } from 'lucide-react'
import { HandoverItem, HandoverItemStatus } from '@/lib/types/handover.types'

interface ItemUpdate {
  id: string
  status: HandoverItemStatus
  actualValue?: string
  notes?: string
}

interface OwnerChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: HandoverItem[]
  onConfirm: (data: { acknowledgement?: string; itemUpdates?: ItemUpdate[] }) => Promise<void>
  isLoading?: boolean
}

export function OwnerChecklistDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
  isLoading
}: OwnerChecklistDialogProps) {
  const [acknowledgement, setAcknowledgement] = useState('')
  const [itemUpdates, setItemUpdates] = useState<Map<string, ItemUpdate>>(new Map())
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Initialize item updates with current values
  useEffect(() => {
    if (items && items.length > 0) {
      const initialUpdates = new Map<string, ItemUpdate>()
      items.forEach(item => {
        initialUpdates.set(item.id, {
          id: item.id,
          status: item.status || HandoverItemStatus.NA,
          actualValue: item.actualValue || '',
          notes: item.notes || ''
        })
      })
      setItemUpdates(initialUpdates)
    }
  }, [items])

  const updateItem = (itemId: string, field: keyof ItemUpdate, value: any) => {
    setItemUpdates(prev => {
      const updated = new Map(prev)
      const current = updated.get(itemId) || { id: itemId, status: HandoverItemStatus.NA }
      updated.set(itemId, { ...current, [field]: value })
      return updated
    })
  }

  const handleConfirm = async () => {
    const updates = Array.from(itemUpdates.values()).filter(
      update => update.status !== HandoverItemStatus.NA || update.actualValue || update.notes
    )

    await onConfirm({
      acknowledgement: acknowledgement || undefined,
      itemUpdates: updates.length > 0 ? updates : undefined
    })
  }

  const getStatusIcon = (status: HandoverItemStatus) => {
    switch (status) {
      case HandoverItemStatus.OK:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case HandoverItemStatus.NOT_OK:
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <MinusCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusCount = (status: HandoverItemStatus) => {
    return Array.from(itemUpdates.values()).filter(item => item.status === status).length
  }

  const allItemsChecked = Array.from(itemUpdates.values()).every(
    item => item.status !== HandoverItemStatus.NA
  )

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, HandoverItem[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review & Confirm Handover</DialogTitle>
          <DialogDescription>
            Please review each checklist item and mark its status. This helps ensure a complete handover process.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">{getStatusCount(HandoverItemStatus.OK)}</div>
              <div className="text-xs text-muted-foreground">Accepted</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">{getStatusCount(HandoverItemStatus.NOT_OK)}</div>
              <div className="text-xs text-muted-foreground">Issues</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MinusCircle className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-2xl font-bold text-gray-600">{getStatusCount(HandoverItemStatus.NA)}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>

        {!allItemsChecked && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please review all items before confirming. Items marked as "Not OK" will require admin attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Checklist Items by Category */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  {category}
                </h3>
                <Separator className="flex-1" />
              </div>

              {categoryItems.map((item) => {
                const itemUpdate = itemUpdates.get(item.id)
                const isExpanded = expandedItem === item.id

                return (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.label}</span>
                          {item.expectedValue && (
                            <Badge variant="outline" className="text-xs">
                              Expected: {item.expectedValue}
                            </Badge>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                      {getStatusIcon(itemUpdate?.status || HandoverItemStatus.NA)}
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Status *</Label>
                      <RadioGroup
                        value={itemUpdate?.status || HandoverItemStatus.NA}
                        onValueChange={(value) => {
                          updateItem(item.id, 'status', value as HandoverItemStatus)
                          if (value === HandoverItemStatus.NOT_OK) {
                            setExpandedItem(item.id)
                          }
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={HandoverItemStatus.OK} id={`${item.id}-ok`} />
                          <Label htmlFor={`${item.id}-ok`} className="cursor-pointer flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            OK
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={HandoverItemStatus.NOT_OK} id={`${item.id}-not-ok`} />
                          <Label htmlFor={`${item.id}-not-ok`} className="cursor-pointer flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Not OK
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={HandoverItemStatus.NA} id={`${item.id}-na`} />
                          <Label htmlFor={`${item.id}-na`} className="cursor-pointer flex items-center gap-1">
                            <MinusCircle className="h-4 w-4 text-gray-400" />
                            N/A
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Expanded Details (shown when NOT_OK or user clicks) */}
                    {(isExpanded || itemUpdate?.status === HandoverItemStatus.NOT_OK) && (
                      <div className="space-y-3 pt-2 border-t">
                        <div className="space-y-2">
                          <Label htmlFor={`${item.id}-actual`} className="text-sm">
                            Actual Value/Observation
                          </Label>
                          <Input
                            id={`${item.id}-actual`}
                            value={itemUpdate?.actualValue || ''}
                            onChange={(e) => updateItem(item.id, 'actualValue', e.target.value)}
                            placeholder="What did you observe?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${item.id}-notes`} className="text-sm">
                            Notes/Comments {itemUpdate?.status === HandoverItemStatus.NOT_OK && <span className="text-red-600">*</span>}
                          </Label>
                          <Textarea
                            id={`${item.id}-notes`}
                            value={itemUpdate?.notes || ''}
                            onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                            placeholder={
                              itemUpdate?.status === HandoverItemStatus.NOT_OK
                                ? 'Please describe the issue in detail...'
                                : 'Add any additional notes...'
                            }
                            rows={3}
                            className={itemUpdate?.status === HandoverItemStatus.NOT_OK ? 'border-red-300' : ''}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedItem(null)}
                          className="text-xs"
                        >
                          Collapse
                        </Button>
                      </div>
                    )}

                    {!isExpanded && itemUpdate?.status !== HandoverItemStatus.NOT_OK && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedItem(item.id)}
                        className="text-xs"
                      >
                        Add Details
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Acknowledgement */}
        <div className="space-y-2">
          <Label htmlFor="acknowledgement">Final Acknowledgement (Optional)</Label>
          <Textarea
            id="acknowledgement"
            value={acknowledgement}
            onChange={(e) => setAcknowledgement(e.target.value)}
            placeholder="Add any final comments or acknowledgement..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Confirming...' : 'Confirm Handover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
