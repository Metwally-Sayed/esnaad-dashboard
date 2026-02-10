'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Search, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { useProjectServiceChargeMutations, useAllUnitsForServiceCharge } from '@/lib/hooks/use-service-charges'
import { CreateSimpleServiceChargeDto, ServiceChargePeriodType } from '@/lib/types/service-charge.types'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FormData {
  year: number
  quarter?: number
  periodType: ServiceChargePeriodType
  dueDate?: string
  unitId: string
  amount: string
  paidAmount: string
}

export function CreateServiceChargeContent() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const { createSimpleServiceCharge, isCreating } = useProjectServiceChargeMutations()
  const { units, isLoading: loadingUnits } = useAllUnitsForServiceCharge()

  const [formData, setFormData] = useState<FormData>({
    year: currentYear,
    periodType: 'YEARLY',
    unitId: '',
    amount: '',
    paidAmount: '0',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [unitSearchOpen, setUnitSearchOpen] = useState(false)

  // Calculate balance
  const amount = parseFloat(formData.amount) || 0
  const paidAmount = parseFloat(formData.paidAmount) || 0
  const balance = Math.max(0, amount - paidAmount)

  // Get selected unit details
  const selectedUnit = useMemo(() => {
    return units.find((u) => u.id === formData.unitId)
  }, [units, formData.unitId])

  // Group units by project for the dropdown
  const unitsByProject = useMemo(() => {
    const grouped: Record<string, typeof units> = {}
    units.forEach((unit) => {
      const projectName = unit.project?.name || 'No Project'
      if (!grouped[projectName]) {
        grouped[projectName] = []
      }
      grouped[projectName].push(unit)
    })
    return grouped
  }, [units])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePeriodTypeChange = (value: ServiceChargePeriodType) => {
    setFormData((prev) => ({
      ...prev,
      periodType: value,
      quarter: value === 'YEARLY' ? undefined : prev.quarter,
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.year) {
      newErrors.year = 'Year is required'
    }

    if (formData.periodType === 'QUARTERLY' && !formData.quarter) {
      newErrors.quarter = 'Quarter is required for quarterly charges'
    }

    if (!formData.unitId) {
      newErrors.unitId = 'Please select a unit'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (parseFloat(formData.paidAmount) < 0) {
      newErrors.paidAmount = 'Paid amount cannot be negative'
    }

    if (parseFloat(formData.paidAmount) > parseFloat(formData.amount)) {
      newErrors.paidAmount = 'Paid amount cannot exceed total amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    try {
      const data: CreateSimpleServiceChargeDto = {
        unitId: formData.unitId,
        year: formData.year,
        periodType: formData.periodType,
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.paidAmount) || 0,
      }

      if (formData.periodType === 'QUARTERLY' && formData.quarter) {
        data.quarter = formData.quarter
      }

      if (formData.dueDate) {
        data.dueDate = formData.dueDate
      }

      await createSimpleServiceCharge(data)
      toast.success('Service charge created successfully')
      router.push('/service-charge')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to create service charge')
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/service-charge')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Service Charges
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Create Service Charge</h1>
        <p className="text-muted-foreground mt-1">Create a new service charge for a unit</p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Service Charge Details</CardTitle>
          <CardDescription>Fill in the details for the service charge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">
                Year <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.year.toString()}
                onValueChange={(value) => handleInputChange('year', parseInt(value))}
              >
                <SelectTrigger id="year" className={errors.year ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodType">
                Period Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.periodType}
                onValueChange={(value) => handlePeriodTypeChange(value as ServiceChargePeriodType)}
              >
                <SelectTrigger id="periodType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.periodType === 'QUARTERLY' && (
              <div className="space-y-2">
                <Label htmlFor="quarter">
                  Quarter <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.quarter?.toString() || ''}
                  onValueChange={(value) => handleInputChange('quarter', parseInt(value))}
                >
                  <SelectTrigger id="quarter" className={errors.quarter ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan - Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr - Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul - Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct - Dec)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.quarter && <p className="text-sm text-destructive">{errors.quarter}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Unit Selection */}
          <div className="space-y-2">
            <Label>
              Unit <span className="text-destructive">*</span>
            </Label>
            <Popover open={unitSearchOpen} onOpenChange={setUnitSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={unitSearchOpen}
                  className={cn(
                    'w-full justify-between',
                    errors.unitId && 'border-destructive'
                  )}
                  disabled={loadingUnits}
                >
                  {loadingUnits ? (
                    'Loading units...'
                  ) : selectedUnit ? (
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedUnit.unitNumber} - {selectedUnit.project?.name || 'No Project'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select a unit...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search units..." />
                  <CommandList>
                    <CommandEmpty>No units found.</CommandEmpty>
                    {Object.entries(unitsByProject).map(([projectName, projectUnits]) => (
                      <CommandGroup key={projectName} heading={projectName}>
                        {projectUnits.map((unit) => (
                          <CommandItem
                            key={unit.id}
                            value={`${unit.unitNumber} ${unit.buildingName || ''} ${unit.project?.name || ''}`}
                            onSelect={() => {
                              handleInputChange('unitId', unit.id)
                              setUnitSearchOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.unitId === unit.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{unit.unitNumber}</div>
                              <div className="text-xs text-muted-foreground">
                                {unit.buildingName && `${unit.buildingName} • `}
                                {unit.owner?.name || unit.owner?.email || 'No Owner'}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.unitId && <p className="text-sm text-destructive">{errors.unitId}</p>}

            {/* Selected Unit Details */}
            {selectedUnit && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{selectedUnit.project?.name || 'No Project'}</Badge>
                  {selectedUnit.buildingName && (
                    <Badge variant="secondary">{selectedUnit.buildingName}</Badge>
                  )}
                  {selectedUnit.floor !== null && (
                    <span className="text-muted-foreground">Floor {selectedUnit.floor}</span>
                  )}
                </div>
                {selectedUnit.owner && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Owner: {selectedUnit.owner.name || selectedUnit.owner.email}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (AED) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid (AED)</Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.paidAmount}
                onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                className={errors.paidAmount ? 'border-destructive' : ''}
              />
              {errors.paidAmount && <p className="text-sm text-destructive">{errors.paidAmount}</p>}
            </div>

            <div className="space-y-2">
              <Label>Balance (AED)</Label>
              <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center">
                <span className={cn('font-medium', balance > 0 ? 'text-amber-600' : 'text-green-600')}>
                  {balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {balance === 0 ? 'Fully paid' : 'Remaining balance'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => router.push('/service-charge')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating}>
              {isCreating ? (
                'Creating...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service Charge
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
