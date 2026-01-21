'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useProjectServiceChargeMutations, useAllUnitsForServiceCharge } from '@/lib/hooks/use-service-charges'
import { CreateProjectServiceChargeDto, ServiceChargePeriodType, UnitChargeInput } from '@/lib/types/service-charge.types'

interface PeriodFormData {
  year: number
  quarter?: number
  periodType: ServiceChargePeriodType
  dueDate?: string
}

interface UnitAmountData {
  unitId: string
  amount: string
  selected: boolean
  projectId: string
  projectName: string
}

export function CreateServiceChargeContent() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const { createProjectServiceCharge, isCreating } = useProjectServiceChargeMutations()
  const { units, isLoading: loadingUnits } = useAllUnitsForServiceCharge()

  const [periodData, setPeriodData] = useState<PeriodFormData>({
    year: currentYear,
    periodType: 'YEARLY',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PeriodFormData, string>>>({})

  // Track unit amounts and selections
  const [unitAmounts, setUnitAmounts] = useState<Record<string, UnitAmountData>>({})

  // Initialize unit amounts when units load
  useMemo(() => {
    if (units.length > 0 && Object.keys(unitAmounts).length === 0) {
      const initialAmounts: Record<string, UnitAmountData> = {}
      units.forEach((unit) => {
        initialAmounts[unit.id] = {
          unitId: unit.id,
          amount: '',
          selected: false,
          projectId: unit.projectId || '',
          projectName: unit.project?.name || 'Unknown',
        }
      })
      setUnitAmounts(initialAmounts)
    }
  }, [units, unitAmounts])

  // Group units by project
  const unitsByProject = useMemo(() => {
    const grouped: Record<string, typeof units> = {}
    units.forEach((unit) => {
      const projectId = unit.projectId || 'unknown'
      if (!grouped[projectId]) {
        grouped[projectId] = []
      }
      grouped[projectId].push(unit)
    })
    return grouped
  }, [units])

  const handleInputChange = (field: keyof PeriodFormData, value: any) => {
    setPeriodData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePeriodTypeChange = (value: ServiceChargePeriodType) => {
    setPeriodData((prev) => ({
      ...prev,
      periodType: value,
      quarter: value === 'YEARLY' ? undefined : prev.quarter,
    }))
  }

  const handleUnitToggle = (unitId: string) => {
    setUnitAmounts((prev) => {
      if (!prev[unitId]) return prev
      return {
        ...prev,
        [unitId]: {
          ...prev[unitId],
          selected: !prev[unitId].selected,
        },
      }
    })
  }

  const handleUnitAmountChange = (unitId: string, amount: string) => {
    setUnitAmounts((prev) => {
      if (!prev[unitId]) return prev
      return {
        ...prev,
        [unitId]: {
          ...prev[unitId],
          amount,
        },
      }
    })
  }

  const handleSelectAllInProject = (projectId: string, checked: boolean) => {
    setUnitAmounts((prev) => {
      const updated = { ...prev }
      const projectUnits = unitsByProject[projectId] || []
      projectUnits.forEach((unit) => {
        if (updated[unit.id]) {
          updated[unit.id] = { ...updated[unit.id], selected: checked }
        }
      })
      return updated
    })
  }

  const handleApplyToAllInProject = (projectId: string) => {
    const projectUnits = (unitsByProject[projectId] || []).map((u) => unitAmounts[u.id]).filter((u) => u?.selected)

    if (projectUnits.length === 0) {
      toast.error('Please select at least one unit in this project')
      return
    }

    const firstAmount = projectUnits.find((u) => u.amount && parseFloat(u.amount) > 0)?.amount || ''
    if (!firstAmount) {
      toast.error('Please enter an amount in at least one selected unit')
      return
    }

    setUnitAmounts((prev) => {
      const updated = { ...prev }
      projectUnits.forEach((u) => {
        updated[u.unitId] = { ...updated[u.unitId], amount: firstAmount }
      })
      return updated
    })

    toast.success(`Applied ${firstAmount} to ${projectUnits.length} selected units`)
  }

  const selectedCount = Object.values(unitAmounts).filter((u) => u.selected).length
  const totalAmount = Object.values(unitAmounts)
    .filter((u) => u.selected && u.amount)
    .reduce((sum, u) => sum + parseFloat(u.amount), 0)

  // Group selected units by project
  const selectedByProject = useMemo(() => {
    const grouped: Record<string, UnitAmountData[]> = {}
    Object.values(unitAmounts)
      .filter((u) => u.selected)
      .forEach((u) => {
        if (!grouped[u.projectId]) {
          grouped[u.projectId] = []
        }
        grouped[u.projectId].push(u)
      })
    return grouped
  }, [unitAmounts])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PeriodFormData, string>> = {}

    if (!periodData.year) {
      newErrors.year = 'Year is required'
    }

    if (periodData.periodType === 'QUARTERLY' && !periodData.quarter) {
      newErrors.quarter = 'Quarter is required for quarterly charges'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    const selectedUnits = Object.values(unitAmounts).filter((u) => u.selected)

    if (selectedUnits.length === 0) {
      toast.error('Please select at least one unit')
      return
    }

    // Validate all selected units have amounts
    const unitsWithoutAmount = selectedUnits.filter((u) => !u.amount || parseFloat(u.amount) <= 0)
    if (unitsWithoutAmount.length > 0) {
      toast.error('All selected units must have a valid amount')
      return
    }

    try {
      // Create one service charge per project
      const projectIds = Object.keys(selectedByProject)
      let createdCount = 0

      for (const projectId of projectIds) {
        const projectUnits = selectedByProject[projectId]
        const unitCharges: UnitChargeInput[] = projectUnits.map((u) => ({
          unitId: u.unitId,
          amount: parseFloat(u.amount),
        }))

        const data: CreateProjectServiceChargeDto = {
          projectId,
          year: periodData.year,
          periodType: periodData.periodType,
          unitCharges,
        }

        if (periodData.periodType === 'QUARTERLY' && periodData.quarter) {
          data.quarter = periodData.quarter
        }

        if (periodData.dueDate) {
          data.dueDate = periodData.dueDate
        }

        await createProjectServiceCharge(data)
        createdCount++
      }

      toast.success(
        `Created ${createdCount} service charge${createdCount > 1 ? 's' : ''} for ${selectedUnits.length} units`
      )
      router.push('/service-charge')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create service charge')
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
        <p className="text-muted-foreground mt-1">Select units and set individual amounts</p>
      </div>

      {/* Period Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Period Settings</CardTitle>
          <CardDescription>Set the year, period type, and due date for all service charges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">
                Year <span className="text-destructive">*</span>
              </Label>
              <Select
                value={periodData.year.toString()}
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
                value={periodData.periodType}
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

            {periodData.periodType === 'QUARTERLY' && (
              <div className="space-y-2">
                <Label htmlFor="quarter">
                  Quarter <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={periodData.quarter?.toString() || ''}
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
                value={periodData.dueDate || ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-medium">{selectedCount}</span> units selected
              </div>
              <div>
                Total:{' '}
                <span className="font-medium">
                  {totalAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  SAR
                </span>
              </div>
              {Object.keys(selectedByProject).length > 0 && (
                <div>
                  <span className="font-medium">{Object.keys(selectedByProject).length}</span> project
                  {Object.keys(selectedByProject).length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <Button onClick={handleSubmit} disabled={isCreating || selectedCount === 0}>
              {isCreating ? (
                <>Creating...</>
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

      {/* Units by Project */}
      {loadingUnits ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">Loading units...</div>
          </CardContent>
        </Card>
      ) : units.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">No units found</div>
          </CardContent>
        </Card>
      ) : (
        <>
          {Object.entries(unitsByProject).map(([projectId, projectUnits]) => {
            const project = projectUnits[0]?.project
            const selectedInProject = projectUnits.filter((u) => unitAmounts[u.id]?.selected).length
            const allSelected = selectedInProject === projectUnits.length

            return (
              <Card key={projectId} className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(checked) => handleSelectAllInProject(projectId, !!checked)}
                        />
                        {project?.name || 'Unknown Project'}
                        <Badge variant="outline">{projectUnits.length} units</Badge>
                      </CardTitle>
                      {project?.location && (
                        <CardDescription className="mt-1">{project.location}</CardDescription>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyToAllInProject(projectId)}
                      disabled={selectedInProject === 0}
                    >
                      Apply Amount to Selected ({selectedInProject})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="min-w-[150px]">Unit Number</TableHead>
                            <TableHead className="hidden sm:table-cell min-w-[120px]">Building</TableHead>
                            <TableHead className="hidden md:table-cell min-w-[100px]">Floor</TableHead>
                            <TableHead className="hidden lg:table-cell min-w-[120px]">Owner</TableHead>
                            <TableHead className="min-w-[200px]">Amount (SAR)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projectUnits.map((unit) => (
                            <TableRow key={unit.id}>
                              <TableCell>
                                <Checkbox
                                  checked={unitAmounts[unit.id]?.selected || false}
                                  onCheckedChange={() => handleUnitToggle(unit.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                              <TableCell className="hidden sm:table-cell">{unit.buildingName || '-'}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {unit.floor !== null ? `Floor ${unit.floor}` : '-'}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {unit.owner?.name || unit.owner?.email || 'Unassigned'}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={unitAmounts[unit.id]?.amount || ''}
                                  onChange={(e) => handleUnitAmountChange(unit.id, e.target.value)}
                                  disabled={!unitAmounts[unit.id]?.selected}
                                  className={!unitAmounts[unit.id]?.selected ? 'bg-muted cursor-not-allowed' : ''}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}
