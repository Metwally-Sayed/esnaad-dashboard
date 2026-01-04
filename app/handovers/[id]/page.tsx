'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
  Download,
  Edit,
  AlertCircle
} from 'lucide-react'
import { useHandover, useHandoverMutations } from '@/lib/hooks/use-handovers'
import { useAuth } from '@/contexts/AuthContext'
import { HandoverStatusBadge } from '@/components/handover/HandoverStatusBadge'
import { MessageThread } from '@/components/handover/MessageThread'
import { format } from 'date-fns'
import {
  getAllowedActions,
  isHandoverEditable,
  HandoverStatus,
  HandoverItemStatus,
  getItemStatusColor
} from '@/lib/types/handover.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
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

// Helper function to get progress percentage based on status
function getProgressPercentage(status: HandoverStatus): number {
  const statusProgress: Record<HandoverStatus, number> = {
    [HandoverStatus.DRAFT]: 20,
    [HandoverStatus.SENT_TO_OWNER]: 40,
    [HandoverStatus.OWNER_CONFIRMED]: 60,
    [HandoverStatus.CHANGES_REQUESTED]: 50,
    [HandoverStatus.ADMIN_CONFIRMED]: 80,
    [HandoverStatus.COMPLETED]: 100,
    [HandoverStatus.CANCELLED]: 0
  }
  return statusProgress[status] || 0
}

export default function HandoverDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const userRole = isAdmin ? 'ADMIN' : 'OWNER'

  const { handover, isLoading, error, mutate } = useHandover(id)
  const {
    sendToOwner,
    ownerConfirm,
    requestChanges,
    adminConfirm,
    completeHandover,
    cancelHandover,
    isLoading: isMutating
  } = useHandoverMutations()

  // Dialog states
  const [sendDialog, setSendDialog] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [requestChangesDialog, setRequestChangesDialog] = useState(false)
  const [adminConfirmDialog, setAdminConfirmDialog] = useState(false)
  const [completeDialog, setCompleteDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)

  const [sendMessage, setSendMessage] = useState('')
  const [acknowledgement, setAcknowledgement] = useState('')
  const [changesMessage, setChangesMessage] = useState('')
  const [finalNotes, setFinalNotes] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !handover) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load handover details'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const allowedActions = getAllowedActions(handover, userRole)
  const isEditable = isHandoverEditable(handover.status)
  const isCompleted = handover.status === HandoverStatus.COMPLETED
  const isCancelled = handover.status === HandoverStatus.CANCELLED

  // Action handlers
  const handleSend = async () => {
    await sendToOwner(id, { message: sendMessage })
    setSendDialog(false)
    setSendMessage('')
    mutate()
  }

  const handleOwnerConfirm = async () => {
    await ownerConfirm(id, { acknowledgement })
    setConfirmDialog(false)
    setAcknowledgement('')
    mutate()
  }

  const handleRequestChanges = async () => {
    await requestChanges(id, { message: changesMessage })
    setRequestChangesDialog(false)
    setChangesMessage('')
    mutate()
  }

  const handleAdminConfirm = async () => {
    await adminConfirm(id, { finalNotes })
    setAdminConfirmDialog(false)
    setFinalNotes('')
    mutate()
  }

  const handleComplete = async () => {
    await completeHandover(id)
    setCompleteDialog(false)
    mutate()
  }

  const handleCancel = async () => {
    await cancelHandover(id, { reason: cancelReason })
    setCancelDialog(false)
    setCancelReason('')
    mutate()
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Handovers
        </Button>

        <div className="bg-gradient-to-r from-background to-muted/30 rounded-xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Handover Agreement
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {handover.id}
                  </p>
                </div>

                {/* Key Details */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Unit {handover.unit?.unitNumber}</span>
                    {handover.unit?.buildingName && (
                      <span className="text-muted-foreground">• {handover.unit.buildingName}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{handover.owner?.name || handover.owner?.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {handover.scheduledAt
                        ? format(new Date(handover.scheduledAt), 'PPP')
                        : 'Not scheduled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge - Larger and more prominent */}
            <div className="flex flex-col items-end gap-2">
              <HandoverStatusBadge status={handover.status} className="text-sm px-3 py-1.5" />
              {handover.handoverAt && (
                <p className="text-xs text-muted-foreground">
                  Completed {format(new Date(handover.handoverAt), 'PPp')}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{getProgressPercentage(handover.status)}% Complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage(handover.status)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Details</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Created {format(new Date(handover.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(handover.createdAt), 'p')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Timeline Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Scheduled Date
                      </p>
                      <p className="text-sm font-medium">
                        {handover.scheduledAt
                          ? format(new Date(handover.scheduledAt), 'EEEE, MMMM do, yyyy')
                          : 'Not scheduled'}
                      </p>
                      {handover.scheduledAt && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(handover.scheduledAt), 'p')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Completion Date
                      </p>
                      <p className="text-sm font-medium">
                        {handover.handoverAt
                          ? format(new Date(handover.handoverAt), 'EEEE, MMMM do, yyyy')
                          : 'Pending completion'}
                      </p>
                      {handover.handoverAt && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(handover.handoverAt), 'p')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              {(handover.notes || (isAdmin && handover.internalNotes)) && (
                <Separator />
              )}

              {/* Notes Section */}
              {handover.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Notes
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{handover.notes}</p>
                  </div>
                </div>
              )}

              {/* Internal Notes (Admin only) */}
              {isAdmin && handover.internalNotes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                      Internal Notes (Admin Only)
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">
                      {handover.internalNotes}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist Items */}
          {handover.items && handover.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Checklist Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {handover.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        )}
                        {(item.expectedValue || item.actualValue) && (
                          <div className="flex gap-4 text-sm">
                            {item.expectedValue && (
                              <span>Expected: {item.expectedValue}</span>
                            )}
                            {item.actualValue && (
                              <span>Actual: {item.actualValue}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge className={getItemStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <MessageThread
            handoverId={id}
            disabled={isCancelled || isCompleted}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {isEditable && allowedActions.includes('edit') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/handovers/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Handover
                </Button>
              )}

              {allowedActions.includes('send') && (
                <Button
                  className="w-full"
                  onClick={() => setSendDialog(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Owner
                </Button>
              )}

              {allowedActions.includes('owner-confirm') && (
                <Button
                  className="w-full"
                  onClick={() => setConfirmDialog(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Handover
                </Button>
              )}

              {allowedActions.includes('request-changes') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setRequestChangesDialog(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
              )}

              {allowedActions.includes('admin-confirm') && (
                <Button
                  className="w-full"
                  onClick={() => setAdminConfirmDialog(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Admin Confirm
                </Button>
              )}

              {allowedActions.includes('complete') && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setCompleteDialog(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Complete & Generate PDF
                </Button>
              )}

              {allowedActions.includes('cancel') && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Handover
                </Button>
              )}

              {isCompleted && handover.documentUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(handover.documentUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Agreement
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Status Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['DRAFT', 'SENT_TO_OWNER', 'OWNER_CONFIRMED', 'ADMIN_CONFIRMED', 'COMPLETED'].map((status, index) => {
                  const currentIndex = ['DRAFT', 'SENT_TO_OWNER', 'OWNER_CONFIRMED', 'ADMIN_CONFIRMED', 'COMPLETED'].indexOf(handover.status)
                  const isPast = index <= currentIndex
                  const isCurrent = status === handover.status

                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isPast ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {isPast ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                          {status.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialogs */}
      {/* Send to Owner Dialog */}
      <Dialog open={sendDialog} onOpenChange={setSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Handover to Owner</DialogTitle>
            <DialogDescription>
              Send this handover to {handover.owner?.name} for review and confirmation.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add a message for the owner (optional)..."
            value={sendMessage}
            onChange={(e) => setSendMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isMutating}>
              Send to Owner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Owner Confirm Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Handover</DialogTitle>
            <DialogDescription>
              Confirm that you have reviewed and accept the handover details.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add acknowledgement message (optional)..."
            value={acknowledgement}
            onChange={(e) => setAcknowledgement(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleOwnerConfirm} disabled={isMutating}>
              Confirm Handover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={requestChangesDialog} onOpenChange={setRequestChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what changes are needed for the handover.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the changes needed..."
            value={changesMessage}
            onChange={(e) => setChangesMessage(e.target.value)}
            rows={4}
            required
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestChangesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestChanges} disabled={!changesMessage || isMutating}>
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Confirm Dialog */}
      <Dialog open={adminConfirmDialog} onOpenChange={setAdminConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Confirmation</DialogTitle>
            <DialogDescription>
              Confirm that the handover is ready to be completed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add final notes (optional)..."
            value={finalNotes}
            onChange={(e) => setFinalNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdminConfirm} disabled={isMutating}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Handover Dialog */}
      <AlertDialog open={completeDialog} onOpenChange={setCompleteDialog}>
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
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Handover</DialogTitle>
            <DialogDescription>
              This will cancel the handover process. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Provide a reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
            required
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
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
    </div>
  )
}