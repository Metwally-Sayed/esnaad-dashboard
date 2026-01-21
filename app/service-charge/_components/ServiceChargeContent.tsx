'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useProjectServiceCharges, useOwnerServiceCharges } from '@/lib/hooks/use-service-charges'
import { ProjectServiceChargeFilters, UnitServiceChargeFilters, ServiceChargePeriodType } from '@/lib/types/service-charge.types'
import { FileText, Plus, ChevronLeft, ChevronRight, RefreshCw, Eye, Download, DollarSign } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useUnitServiceChargeMutations } from '@/lib/hooks/use-service-charges'

export function ServiceChargeContent() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const currentYear = new Date().getFullYear()

  // Admin filters
  const [adminFilters, setAdminFilters] = useState<ProjectServiceChargeFilters>({
    page: 1,
    limit: 20,
  })

  // Owner filters
  const [ownerFilters, setOwnerFilters] = useState<UnitServiceChargeFilters>({
    page: 1,
    limit: 20,
  })

  // Hooks based on role
  const adminData = useProjectServiceCharges(isAdmin ? adminFilters : null)
  const ownerData = useOwnerServiceCharges(!isAdmin ? ownerFilters : null)
  const { downloadPdfStatement } = useUnitServiceChargeMutations()

  // Use data based on role
  const isLoading = isAdmin ? adminData.isLoading : ownerData.isLoading
  const error = isAdmin ? adminData.error : ownerData.error
  const pagination = isAdmin ? adminData.pagination : ownerData.pagination
  const mutate = isAdmin ? adminData.mutate : ownerData.mutate

  const handleAdminFilterChange = (newFilters: Partial<ProjectServiceChargeFilters>) => {
    setAdminFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleOwnerFilterChange = (newFilters: Partial<UnitServiceChargeFilters>) => {
    setOwnerFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleAdminPageChange = (page: number) => {
    setAdminFilters((prev) => ({ ...prev, page }))
  }

  const handleOwnerPageChange = (page: number) => {
    setOwnerFilters((prev) => ({ ...prev, page }))
  }

  const handleDownloadPdf = async (id: string, unitNumber: string) => {
    try {
      await downloadPdfStatement(id)
      toast.success(`Downloading statement for Unit ${unitNumber}`)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to download PDF')
    }
  }

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

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading service charges: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin View
  if (isAdmin) {
    const serviceCharges = adminData.serviceCharges || []

    // Empty state
    if (serviceCharges.length === 0) {
      return (
        <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <DollarSign className="h-7 w-7 text-primary" />
                Service Charges
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage project service charges
              </p>
            </div>
            <Button onClick={() => router.push('/service-charge/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Service Charge
            </Button>
          </div>
          <EmptyState
            icon={FileText}
            title="No service charges found"
            description="Create your first service charge to get started"
            action={{
              label: 'Create Service Charge',
              onClick: () => router.push('/service-charge/create'),
              icon: Plus,
            }}
          />
        </div>
      )
    }

    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-7 w-7 text-primary" />
              Service Charges
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage project service charges
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => router.push('/service-charge/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Service Charge
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Service Charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Yearly Charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {serviceCharges.filter((c) => c.periodType === 'YEARLY').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Quarterly Charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {serviceCharges.filter((c) => c.periodType === 'QUARTERLY').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card">
            <Select
              value={adminFilters.year?.toString() || 'all'}
              onValueChange={(value) =>
                handleAdminFilterChange({ year: value === 'all' ? undefined : parseInt(value) })
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={adminFilters.periodType || 'all'}
              onValueChange={(value) =>
                handleAdminFilterChange({
                  periodType: value === 'all' ? undefined : (value as ServiceChargePeriodType),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              </SelectContent>
            </Select>

            {(adminFilters.year || adminFilters.periodType) && (
              <Button
                variant="outline"
                onClick={() => setAdminFilters({ page: 1, limit: 20 })}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Service Charges Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Project</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">Period</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[150px]">Units</TableHead>
                  <TableHead className="min-w-[120px]">Total Amount</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">Due Date</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[120px]">Created</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceCharges.map((charge) => {
                  const totalAmount = charge.unitCharges?.reduce((sum, uc) => {
                    const amount = uc.isOverridden && uc.overriddenAmount
                      ? parseFloat(uc.overriddenAmount.toString())
                      : parseFloat(uc.amount.toString())
                    return sum + amount
                  }, 0) || 0

                  return (
                    <TableRow key={charge.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{charge.project?.name || 'N/A'}</div>
                          {charge.project?.location && (
                            <div className="text-xs text-muted-foreground">{charge.project.location}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {getPeriodLabel(charge.year, charge.quarter, charge.periodType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {charge.percentage !== null ? (
                          <div className="font-medium">
                            {parseFloat(charge.percentage.toString()).toFixed(2)}%
                          </div>
                        ) : (
                          <Badge variant="secondary">Per-Unit</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm">
                          {charge.unitCharges && charge.unitCharges.length > 0 ? (
                            <div className="space-y-1">
                              {charge.unitCharges.slice(0, 2).map((uc) => (
                                <div key={uc.id} className="flex items-center gap-2">
                                  <span className="font-medium">{uc.unit.unitNumber}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({parseFloat(uc.amount.toString()).toLocaleString()} SAR)
                                  </span>
                                </div>
                              ))}
                              {charge.unitCharges.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{charge.unitCharges.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No units</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {totalAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          SAR
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {charge._count?.unitCharges || 0} unit{(charge._count?.unitCharges || 0) !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {charge.dueDate ? (
                          <div>
                            <div className="font-medium">
                              {new Date(charge.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          {new Date(charge.createdAt).toLocaleDateString('en-US')}
                        </div>
                        {charge.createdBy && (
                          <div className="text-xs text-muted-foreground">
                            by {charge.createdBy.name || charge.createdBy.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/service-charge/${charge.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-muted-foreground text-sm">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} service charges
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handleAdminPageChange(pagination.page - 1)}
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
                      onClick={() => handleAdminPageChange(pageNum)}
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
                onClick={() => handleAdminPageChange(pagination.page + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Owner View
  const serviceCharges = ownerData.serviceCharges || []

  // Empty state for owner
  if (serviceCharges.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-7 w-7 text-primary" />
              Service Charges
            </h1>
            <p className="text-muted-foreground mt-1">
              View service charges for your units
            </p>
          </div>
        </div>
        <EmptyState
          icon={FileText}
          title="No service charges found"
          description="There are no service charges for your units yet"
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary" />
            Service Charges
          </h1>
          <p className="text-muted-foreground mt-1">
            View service charges for your units
          </p>
        </div>
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Charges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCharges.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>PDFs Available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {serviceCharges.filter((c) => c.pdfUrl).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card">
          <Select
            value={ownerFilters.year?.toString() || 'all'}
            onValueChange={(value) =>
              handleOwnerFilterChange({ year: value === 'all' ? undefined : parseInt(value) })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={ownerFilters.periodType || 'all'}
            onValueChange={(value) =>
              handleOwnerFilterChange({
                periodType: value === 'all' ? undefined : (value as ServiceChargePeriodType),
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            </SelectContent>
          </Select>

          {(ownerFilters.year || ownerFilters.periodType) && (
            <Button
              variant="outline"
              onClick={() => setOwnerFilters({ page: 1, limit: 20 })}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Service Charges Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Unit</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[100px]">Building</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Period</TableHead>
                <TableHead className="min-w-[100px]">Amount (SAR)</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[120px]">Due Date</TableHead>
                <TableHead className="text-right min-w-[100px]">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceCharges.map((charge) => {
                const finalAmount = getFinalAmount(charge)
                return (
                  <TableRow key={charge.id}>
                    <TableCell className="font-medium">
                      {charge.unit?.unitNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {charge.unit?.buildingName || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {charge.projectServiceCharge
                        ? getPeriodLabel(
                            charge.projectServiceCharge.year,
                            charge.projectServiceCharge.quarter,
                            charge.projectServiceCharge.periodType
                          )
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {parseFloat(finalAmount.toString()).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      {charge.isOverridden && (
                        <div className="text-xs text-muted-foreground">
                          Original: {parseFloat(charge.amount.toString()).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {charge.projectServiceCharge?.dueDate ? (
                        <div className="font-medium">
                          {new Date(charge.projectServiceCharge.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {charge.pdfUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPdf(charge.id, charge.unit?.unitNumber || 'N/A')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No PDF</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} charges
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handleOwnerPageChange(pagination.page - 1)}
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
                    onClick={() => handleOwnerPageChange(pageNum)}
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
              onClick={() => handleOwnerPageChange(pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
