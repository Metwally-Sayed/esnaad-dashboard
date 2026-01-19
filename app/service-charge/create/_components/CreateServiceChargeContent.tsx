'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useProjects } from '@/lib/hooks/use-projects'
import { useProjectServiceChargeMutations } from '@/lib/hooks/use-service-charges'
import { CreateProjectServiceChargeDto, ServiceChargePeriodType } from '@/lib/types/service-charge.types'

interface FormData {
  projectId: string
  year: number
  quarter?: number
  periodType: ServiceChargePeriodType
  percentage: string
  dueDate?: string
}

export function CreateServiceChargeContent() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const { projects, isLoading: loadingProjects } = useProjects({ limit: 1000 })
  const { createProjectServiceCharge, isCreating } = useProjectServiceChargeMutations()

  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    year: currentYear,
    periodType: 'YEARLY',
    percentage: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is modified
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

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required'
    }

    if (!formData.year) {
      newErrors.year = 'Year is required'
    }

    if (formData.periodType === 'QUARTERLY' && !formData.quarter) {
      newErrors.quarter = 'Quarter is required for quarterly charges'
    }

    if (!formData.percentage || parseFloat(formData.percentage) <= 0) {
      newErrors.percentage = 'Valid percentage is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    try {
      const data: CreateProjectServiceChargeDto = {
        projectId: formData.projectId,
        year: formData.year,
        periodType: formData.periodType,
        percentage: parseFloat(formData.percentage),
      }

      if (formData.periodType === 'QUARTERLY' && formData.quarter) {
        data.quarter = formData.quarter
      }

      if (formData.dueDate) {
        data.dueDate = formData.dueDate
      }

      await createProjectServiceCharge(data)
      toast.success('Service charge created successfully')
      router.push('/service-charge')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create service charge')
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/service-charge')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Service Charges
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Create Service Charge</h1>
        <p className="text-muted-foreground mt-1">
          Create a new service charge for a project
        </p>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Service Charge Details</CardTitle>
          <CardDescription>
            Configure the service charge settings for the selected project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project">
                Project <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleInputChange('projectId', value)}
                disabled={loadingProjects}
              >
                <SelectTrigger id="project" className={errors.projectId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                      {project.location && ` - ${project.location}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-sm text-destructive">{errors.projectId}</p>
              )}
            </div>

            {/* Year Selection */}
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
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year}</p>
              )}
            </div>

            {/* Period Type */}
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

            {/* Quarter Selection (conditional) */}
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
                {errors.quarter && (
                  <p className="text-sm text-destructive">{errors.quarter}</p>
                )}
              </div>
            )}

            {/* Percentage */}
            <div className="space-y-2">
              <Label htmlFor="percentage">
                Service Charge Percentage <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.percentage}
                  onChange={(e) => handleInputChange('percentage', e.target.value)}
                  placeholder="e.g., 2.5"
                  className={errors.percentage ? 'border-destructive pr-8' : 'pr-8'}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              {errors.percentage && (
                <p className="text-sm text-destructive">{errors.percentage}</p>
              )}
              <p className="text-sm text-muted-foreground">
                The percentage will be applied to each unit's price
              </p>
            </div>

            {/* Due Date (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                When should this service charge be paid by?
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/service-charge')}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
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
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="max-w-2xl mt-6">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • When you create a service charge, the system will automatically calculate and create
            individual charges for all units in the selected project.
          </p>
          <p>
            • The charge amount for each unit is calculated as:{' '}
            <code className="bg-muted px-1 py-0.5 rounded">Unit Price × Percentage ÷ 100</code>
          </p>
          <p>
            • Only units with a valid price will receive a service charge.
          </p>
          <p>
            • You can override individual unit charges after creation if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
