'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HandoverListTable } from '@/components/handover/HandoverListTable'
import { HandoverCreateDialog } from '@/components/handovers/HandoverCreateDialog'
import { useAdminHandovers, useMyHandovers, useHandoverMutations } from '@/lib/hooks/use-handovers'
import { HandoverFilters, HandoverStatus, Handover } from '@/lib/types/handover.types'
import { Plus, Search, RefreshCw, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function HandoversPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState<HandoverFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Use different hooks based on role
  const adminData = useAdminHandovers(filters)
  const ownerData = useMyHandovers(filters)

  const { handovers, pagination, isLoading, mutate } = isAdmin ? adminData : ownerData

  const {
    sendToOwner,
    adminConfirm,
    ownerConfirm,
    requestChanges,
    completeHandover,
    cancelHandover,
    isLoading: isMutating
  } = useHandoverMutations()

  // Dialog states
  const [sendDialog, setSendDialog] = useState<{ open: boolean; handover?: Handover }>({ open: false })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; handover?: Handover }>({ open: false })
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; handover?: Handover }>({ open: false })
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; handover?: Handover }>({ open: false })
  const [requestChangesDialog, setRequestChangesDialog] = useState<{ open: boolean; handover?: Handover }>({ open: false })

  const [sendMessage, setSendMessage] = useState('')
  const [finalNotes, setFinalNotes] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [acknowledgement, setAcknowledgement] = useState('')
  const [changesMessage, setChangesMessage] = useState('')

  const handleFilterChange = (newFilters: Partial<HandoverFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Admin actions
  const handleSend = async () => {
    if (!sendDialog.handover) return
    await sendToOwner(sendDialog.handover.id, { message: sendMessage })
    setSendDialog({ open: false })
    setSendMessage('')
    mutate()
  }

  const handleAdminConfirm = async () => {
    if (!confirmDialog.handover) return
    await adminConfirm(confirmDialog.handover.id, { finalNotes })
    setConfirmDialog({ open: false })
    setFinalNotes('')
    mutate()
  }

  const handleComplete = async () => {
    if (!completeDialog.handover) return
    await completeHandover(completeDialog.handover.id)
    setCompleteDialog({ open: false })
    mutate()
  }

  const handleCancel = async () => {
    if (!cancelDialog.handover || !cancelReason) return
    await cancelHandover(cancelDialog.handover.id, { reason: cancelReason })
    setCancelDialog({ open: false })
    setCancelReason('')
    mutate()
  }

  // Owner actions
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

  const handleHandoverCreated = (handoverId: string) => {
    setShowCreateDialog(false)
    mutate() // Refresh the list
    router.push(`/handovers/${handoverId}`)
  }

  // Calculate stats
  const pendingAction = handovers.filter(h =>
    isAdmin
      ? h.status === HandoverStatus.OWNER_CONFIRMED || h.status === HandoverStatus.CHANGES_REQUESTED
      : h.status === HandoverStatus.SENT_TO_OWNER
  ).length
  const confirmed = handovers.filter(h =>
    isAdmin
      ? h.status === HandoverStatus.ADMIN_CONFIRMED
      : h.status === HandoverStatus.OWNER_CONFIRMED
  ).length
  const completed = handovers.filter(h => h.status === HandoverStatus.COMPLETED).length

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            {isAdmin ? 'Handovers Management' : 'My Handovers'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'Manage all unit handover agreements and workflows'
              : 'View and manage your unit handover agreements'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Handover
            </Button>
          )}
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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
              {isAdmin ? 'Pending Action' : 'Pending Your Action'}
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
              {isAdmin ? 'Ready to Complete' : 'Confirmed'}
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
                  placeholder={isAdmin ? "Search by unit or owner..." : "Search by unit..."}
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
      {!isAdmin && pendingAction > 0 && (
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
            onSend={isAdmin ? (handover) => setSendDialog({ open: true, handover }) : undefined}
            onConfirm={(handover) => setConfirmDialog({ open: true, handover })}
            onRequestChanges={!isAdmin ? (handover) => setRequestChangesDialog({ open: true, handover }) : undefined}
            onComplete={isAdmin ? (handover) => setCompleteDialog({ open: true, handover }) : undefined}
            onCancel={isAdmin ? (handover) => setCancelDialog({ open: true, handover }) : undefined}
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

      {/* Admin Dialogs */}
      {isAdmin && (
        <>
          {/* Send to Owner Dialog */}
          <Dialog open={sendDialog.open} onOpenChange={(open) => setSendDialog({ open })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Handover to Owner</DialogTitle>
                <DialogDescription>
                  Send this handover to {sendDialog.handover?.owner?.name} for review and confirmation.
                </DialogDescription>
              </DialogHeader>
              <div>
                <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
                <Textarea
                  placeholder="Add a message for the owner..."
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSendDialog({ open: false })}>
                  Cancel
                </Button>
                <Button onClick={handleSend} disabled={isMutating}>
                  Send to Owner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Admin Confirm Dialog */}
          <Dialog open={confirmDialog.open && isAdmin} onOpenChange={(open) => setConfirmDialog({ open })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Admin Confirmation</DialogTitle>
                <DialogDescription>
                  Confirm that the handover process is ready to be completed.
                </DialogDescription>
              </DialogHeader>
              <div>
                <label className="text-sm font-medium mb-2 block">Final Notes (Optional)</label>
                <Textarea
                  placeholder="Add any final notes..."
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDialog({ open: false })}>
                  Cancel
                </Button>
                <Button onClick={handleAdminConfirm} disabled={isMutating}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Complete Handover Dialog */}
          <AlertDialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog({ open })}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Handover</AlertDialogTitle>
                <AlertDialogDescription>
                  This will complete the handover process and generate the final PDF agreement.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleComplete} disabled={isMutating}>
                  Complete & Generate PDF
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Cancel Handover Dialog */}
          <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Handover</DialogTitle>
                <DialogDescription>
                  This will cancel the handover process. Please provide a reason.
                </DialogDescription>
              </DialogHeader>
              <div>
                <label className="text-sm font-medium mb-2 block">Cancellation Reason</label>
                <Textarea
                  placeholder="Provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialog({ open: false })}>
                  Keep Handover
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={!cancelReason || isMutating}
                >
                  Cancel Handover
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Owner Dialogs */}
      {!isAdmin && (
        <>
          {/* Owner Confirm Dialog */}
          <Dialog open={confirmDialog.open && !isAdmin} onOpenChange={(open) => setConfirmDialog({ open })}>
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
        </>
      )}

      {/* Create Handover Dialog */}
      <HandoverCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleHandoverCreated}
      />
    </div>
  )
}