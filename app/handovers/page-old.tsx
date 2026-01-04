'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HandoverListTable } from '@/components/handover/HandoverListTable'
import { useMyHandovers, useHandoverMutations } from '@/lib/hooks/use-handovers'
import { HandoverFilters, HandoverStatus, Handover } from '@/lib/types/handover.types'
import { Search, RefreshCw, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function OwnerHandoversPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState<HandoverFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { handovers, pagination, isLoading, mutate } = useMyHandovers(filters)
  const { ownerConfirm, requestChanges, isLoading: isMutating } = useHandoverMutations()

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; handover?: Handover }>({ open: false })
  const [requestChangesDialog, setRequestChangesDialog] = useState<{ open: boolean; handover?: Handover }>({ open: false })

  const [acknowledgement, setAcknowledgement] = useState('')
  const [changesMessage, setChangesMessage] = useState('')

  // Redirect admins to their view
  if (isAdmin) {
    router.push('/admin/handovers')
    return null
  }

  const handleFilterChange = (newFilters: Partial<HandoverFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleOwnerConfirm = async () => {
    if (!confirmDialog.handover) return
    await ownerConfirm(confirmDialog.handover.id, { acknowledgement })
    setConfirmDialog({ open: false })
    setAcknowledgement('')
    mutate()
  }

  const handleRequestChanges = async () => {
    if (!requestChangesDialog.handover || !changesMessage) return
    await requestChanges(requestChangesDialog.handover.id, { message: changesMessage })
    setRequestChangesDialog({ open: false })
    setChangesMessage('')
    mutate()
  }

  // Calculate stats
  const pendingAction = handovers.filter(h => h.status === HandoverStatus.SENT_TO_OWNER).length
  const confirmed = handovers.filter(h => h.status === HandoverStatus.OWNER_CONFIRMED).length
  const completed = handovers.filter(h => h.status === HandoverStatus.COMPLETED).length

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            My Handovers
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your unit handover agreements
          </p>
        </div>
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Handovers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Your Action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingAction}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Confirmed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by unit..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange({ status: value === 'all' ? undefined : value as HandoverStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.values(HandoverStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) => handleFilterChange({ sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                  <SelectItem value="handoverAt">Handover Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification for pending actions */}
      {pendingAction > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <p className="text-orange-900">
                You have <span className="font-semibold">{pendingAction} handover{pendingAction > 1 ? 's' : ''}</span> pending your action.
                Please review and confirm or request changes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Handovers Table */}
      <Card>
        <CardContent className="p-0">
          <HandoverListTable
            handovers={handovers}
            isLoading={isLoading}
            onConfirm={(handover) => setConfirmDialog({ open: true, handover })}
            onRequestChanges={(handover) => setRequestChangesDialog({ open: true, handover })}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} handovers
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Owner Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Handover</DialogTitle>
            <DialogDescription>
              Confirm that you have reviewed and accept the handover details for unit{' '}
              {confirmDialog.handover?.unit?.unitNumber}.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Acknowledgement (Optional)</label>
            <Textarea
              placeholder="Add acknowledgement message..."
              value={acknowledgement}
              onChange={(e) => setAcknowledgement(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleOwnerConfirm} disabled={isMutating}>
              Confirm Handover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={requestChangesDialog.open} onOpenChange={(open) => setRequestChangesDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what changes are needed for the handover of unit{' '}
              {requestChangesDialog.handover?.unit?.unitNumber}.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">Changes Needed</label>
            <Textarea
              placeholder="Describe the changes needed..."
              value={changesMessage}
              onChange={(e) => setChangesMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestChangesDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!changesMessage || isMutating}
            >
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}