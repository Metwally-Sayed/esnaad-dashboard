'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  ArrowLeft,
  Edit,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useProjectServiceCharge,
  useUnitServiceCharges,
  useUnitServiceChargeMutations,
  useProjectServiceChargeMutations,
} from '@/lib/hooks/use-service-charges'
import { ServiceChargePeriodType } from '@/lib/types/service-charge.types'

interface ServiceChargeDetailContentProps {
  serviceChargeId: string
}

export function ServiceChargeDetailContent({ serviceChargeId }: ServiceChargeDetailContentProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUnitChargeId, setSelectedUnitChargeId] = useState<string | null>(null)
  const [overrideAmount, setOverrideAmount] = useState('')

  const { serviceCharge, isLoading: loadingServiceCharge, error: serviceChargeError, mutate: mutateServiceCharge } = useProjectServiceCharge(serviceChargeId)
  const { unitCharges, pagination, isLoading: loadingUnitCharges, error: unitChargesError, mutate: mutateUnitCharges } = useUnitServiceCharges(serviceChargeId, { page, limit: 20 })
  const { overrideUnitServiceCharge, generatePdfStatement, isOverriding, isGeneratingPdf } = useUnitServiceChargeMutations()
  const { deleteProjectServiceCharge, isDeleting } = useProjectServiceChargeMutations()

  const getPeriodLabel = (year: number, quarter: number | null, periodType: ServiceChargePeriodType) => {
    if (periodType === 'YEARLY') {
      return `Year ${year}`
    }
    return `Q${quarter} ${year}`
  }

  const getFinalAmount = (charge: any) => {
    if (charge.isOverridden && charge.overriddenAmount) {
      return charge.overriddenAmount
    }
    return charge.amount
  }

  const handleOpenOverrideDialog = (unitChargeId: string, currentAmount: number) => {
    setSelectedUnitChargeId(unitChargeId)
    setOverrideAmount(currentAmount.toString())
    setOverrideDialogOpen(true)
  }

  const handleOverrideSubmit = async () => {
    if (!selectedUnitChargeId) return

    try {
      await overrideUnitServiceCharge(selectedUnitChargeId, {
        overriddenAmount: parseFloat(overrideAmount),
      })
      toast.success('Unit service charge overridden successfully')
      setOverrideDialogOpen(false)
      setSelectedUnitChargeId(null)
      setOverrideAmount('')
      mutateUnitCharges()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to override unit service charge')
    }
  }

  const handleGeneratePdf = async (unitChargeId: string, unitNumber: string) => {
    try {
      await generatePdfStatement(unitChargeId)
      toast.success(`PDF generated for Unit ${unitNumber}`)
      mutateUnitCharges()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate PDF')
    }
  }

  const handleDeleteServiceCharge = async () => {
    try {
      await deleteProjectServiceCharge(serviceChargeId)
      toast.success('Service charge deleted successfully')
      router.push('/service-charge')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete service charge')
    }
  }

  // Loading state
  if (loadingServiceCharge || loadingUnitCharges) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  // Error state
  if (serviceChargeError || unitChargesError) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading service charge: {serviceChargeError?.message || unitChargesError?.message}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!serviceCharge) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Service charge not found</p>
          </CardContent>
        </Card>
      </div>
    )
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Service Charge Details</h1>
            <p className="text-muted-foreground mt-1">
              Manage unit charges and generate statements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
              mutateServiceCharge()
              mutateUnitCharges()
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Service Charge Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Charge Information</CardTitle>
          <CardDescription>
            {getPeriodLabel(serviceCharge.year, serviceCharge.quarter, serviceCharge.periodType)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">Project</Label>
              <p className="font-semibold mt-1">{serviceCharge.project?.name || 'N/A'}</p>
              {serviceCharge.project?.location && (
                <p className="text-sm text-muted-foreground">{serviceCharge.project.location}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Period</Label>
              <p className="font-semibold mt-1">
                <Badge variant="outline">
                  {getPeriodLabel(serviceCharge.year, serviceCharge.quarter, serviceCharge.periodType)}
                </Badge>
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Percentage</Label>
              <p className="font-semibold mt-1">
                {parseFloat(serviceCharge.percentage.toString()).toFixed(2)}%
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Units</Label>
              <p className="font-semibold mt-1">{serviceCharge._count?.unitCharges || 0}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Due Date</Label>
              <p className="font-semibold mt-1">
                {serviceCharge.dueDate
                  ? new Date(serviceCharge.dueDate).toLocaleDateString('en-US')
                  : 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="font-semibold mt-1">
                {new Date(serviceCharge.createdAt).toLocaleDateString('en-US')}
              </p>
              {serviceCharge.createdBy && (
                <p className="text-sm text-muted-foreground">
                  by {serviceCharge.createdBy.name || serviceCharge.createdBy.email}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unitCharges?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>PDFs Generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {unitCharges?.filter((c) => c.pdfUrl).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Charges</CardTitle>
          <CardDescription>
            Manage individual unit service charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Unit</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[150px]">Owner</TableHead>
                    <TableHead className="min-w-[120px]">Amount (AED)</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[80px]">PDF</TableHead>
                    <TableHead className="text-right min-w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitCharges && unitCharges.length > 0 ? (
                    unitCharges.map((charge) => {
                      const finalAmount = getFinalAmount(charge)
                      return (
                        <TableRow key={charge.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{charge.unit?.unitNumber || 'N/A'}</div>
                              {charge.unit?.buildingName && (
                                <div className="text-xs text-muted-foreground">
                                  {charge.unit.buildingName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {charge.unit?.owner ? (
                              <div>
                                <div className="font-medium">
                                  {charge.unit.owner.name || 'N/A'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {charge.unit.owner.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No owner</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {parseFloat(finalAmount.toString()).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            {charge.isOverridden && (
                              <>
                                <div className="text-xs text-muted-foreground line-through">
                                  {parseFloat(charge.amount.toString()).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Overridden
                                </Badge>
                              </>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {charge.pdfUrl ? (
                              <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
                                Generated
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not generated</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenOverrideDialog(charge.id, getFinalAmount(charge))}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Override
                              </Button>
                              {charge.pdfUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(charge.pdfUrl || undefined, '_blank')}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download PDF
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGeneratePdf(charge.id, charge.unit?.unitNumber || 'N/A')}
                                disabled={isGeneratingPdf}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {charge.pdfUrl ? 'Regenerate' : 'Generate'} PDF
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No unit charges found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4 mt-4">
              <div className="text-muted-foreground text-sm">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} unit charges
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        className="w-9"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <FormDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        title="Override Unit Service Charge"
        description="Enter the new amount for this unit's service charge"
        submitText="Override Amount"
        onSubmit={handleOverrideSubmit}
        isLoading={isOverriding}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="overrideAmount">
              New Amount (AED) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="overrideAmount"
              type="number"
              min="0"
              step="0.01"
              value={overrideAmount}
              onChange={(e) => setOverrideAmount(e.target.value)}
              placeholder="e.g., 12500.00"
            />
            <p className="text-sm text-muted-foreground">
              This will replace the calculated amount for this specific unit
            </p>
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service Charge?"
        description="This will permanently delete this service charge and all associated unit charges. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteServiceCharge}
        isLoading={isDeleting}
      />
    </div>
  )
}
