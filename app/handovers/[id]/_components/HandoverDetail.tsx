'use client'

import { useState } from 'react'
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
  AlertCircle,
  Eye
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

// Helper function to get progress percentage based on status (simplified workflow)
function getProgressPercentage(status: HandoverStatus): number {
  const statusProgress: Record<HandoverStatus, number> = {
    [HandoverStatus.DRAFT]: 33,
    [HandoverStatus.SENT_TO_OWNER]: 66,
    [HandoverStatus.ACCEPTED]: 100,
    [HandoverStatus.CANCELLED]: 0
  }
  return statusProgress[status] || 0
}

interface HandoverDetailProps {
  handoverId: string
}

export function HandoverDetail({ handoverId }: HandoverDetailProps) {
  const id = handoverId
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const userRole = isAdmin ? 'ADMIN' : 'OWNER'

  const { handover, isLoading, error, mutate } = useHandover(id)
  const {
    sendToOwner,
    cancelHandover,
    isLoading: isMutating
  } = useHandoverMutations()

  // Dialog states (simplified workflow)
  const [sendDialog, setSendDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)

  const [sendMessage, setSendMessage] = useState('')
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
  const isAccepted = handover.status === HandoverStatus.ACCEPTED
  const isCancelled = handover.status === HandoverStatus.CANCELLED

  // Action handlers (simplified workflow)
  const handleSend = async () => {
    await sendToOwner(id, { message: sendMessage })
    setSendDialog(false)
    setSendMessage('')
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
          {handover.items && handover.items.length > 0 ? (
            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Handover Checklist</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {handover.items.length} items • {handover.items.filter(i => i.status === HandoverItemStatus.OK).length} OK • {handover.items.filter(i => i.status === HandoverItemStatus.NOT_OK).length} Issues
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Group by category */}
                  {Object.entries(
                    handover.items.reduce((acc, item) => {
                      const cat = item.category || 'General'
                      if (!acc[cat]) acc[cat] = []
                      acc[cat].push(item)
                      return acc
                    }, {} as Record<string, typeof handover.items>)
                  ).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {category}
                        </h4>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <span className="font-medium block">{item.label}</span>
                                {item.expectedValue && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Expected: {item.expectedValue}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={item.status === HandoverItemStatus.OK ? 'default' : item.status === HandoverItemStatus.NOT_OK ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {item.status === HandoverItemStatus.OK && <CheckCircle className="h-3 w-3 mr-1" />}
                                {item.status === HandoverItemStatus.NOT_OK && <XCircle className="h-3 w-3 mr-1" />}
                                {item.status}
                              </Badge>
                            </div>
                            {item.actualValue && (
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground">Actual:</span>
                                <span className="font-medium">{item.actualValue}</span>
                              </div>
                            )}
                            {item.notes && (
                              <div className="bg-muted/50 rounded-md p-2 mt-2">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
                              </div>
                            )}
                            {item.status === HandoverItemStatus.NOT_OK && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  Issue reported by owner - requires admin attention
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Handover Checklist</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      No checklist items
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No checklist items have been added to this handover yet.
                  </p>
                  {isAdmin && isEditable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push(`/handovers/${id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit & Add Items
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated PDF Document */}
          {handover.status === HandoverStatus.ACCEPTED && handover.pdfUrl && (
            <Card>
              <CardHeader className="bg-green-50 dark:bg-green-950/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Handover Agreement (PDF)</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Generated on {handover.ownerAcceptedAt ? format(new Date(handover.ownerAcceptedAt), 'PPP') : 'Acceptance'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Document Info */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium">Handover Agreement</p>
                        <p className="text-sm text-muted-foreground">
                          PDF Document • Unit {handover.unit?.unitNumber}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accepted
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => window.open(handover.pdfUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = handover.pdfUrl!
                        link.download = `handover-${handover.unit?.unitNumber || handover.id}.pdf`
                        link.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {handover.attachments && handover.attachments.length > 0 && (
            <Card>
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Attachments</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {handover.attachments.length} file{handover.attachments.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {handover.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        {attachment.mimeType.startsWith('image/') ? (
                          <img
                            src={attachment.url}
                            alt={attachment.caption || 'Attachment'}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.caption || attachment.key.split('/').pop()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.sizeBytes / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <MessageThread
            handoverId={id}
            disabled={isCancelled || isAccepted}
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
            <CardContent className="space-y-2 pt-6">
              {/* Show message when no actions available */}
              {allowedActions.length === 1 && allowedActions[0] === 'view' && (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">No Actions Available</p>
                  <p className="text-xs text-muted-foreground">
                    {handover.status === HandoverStatus.DRAFT &&
                      "This handover is still in draft. Admins can edit or send it to the owner."}
                    {handover.status === HandoverStatus.SENT_TO_OWNER &&
                      "Waiting for owner to accept the handover. Owner can accept via their unit page."}
                    {handover.status === HandoverStatus.ACCEPTED &&
                      "This handover has been accepted. PDF agreement has been generated."}
                    {handover.status === HandoverStatus.CANCELLED &&
                      "This handover has been cancelled."}
                  </p>
                </div>
              )}

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

              {isAccepted && handover.pdfUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(handover.pdfUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Agreement
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline - Simplified Workflow */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Status Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* DRAFT */}
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    handover.status !== HandoverStatus.CANCELLED ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-medium ${handover.status === HandoverStatus.DRAFT ? 'text-primary' : ''}`}>
                      Draft
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(handover.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>

                {/* Connector line */}
                {handover.status !== HandoverStatus.CANCELLED && (
                  <div className="ml-5 h-6 border-l-2 border-muted-foreground/30" />
                )}

                {/* SENT_TO_OWNER */}
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    [HandoverStatus.SENT_TO_OWNER, HandoverStatus.ACCEPTED].includes(handover.status)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {[HandoverStatus.SENT_TO_OWNER, HandoverStatus.ACCEPTED].includes(handover.status) ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">2</span>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-medium ${handover.status === HandoverStatus.SENT_TO_OWNER ? 'text-primary' : ''}`}>
                      Sent to Owner
                    </p>
                    {handover.sentAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(handover.sentAt), 'PPp')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {[HandoverStatus.SENT_TO_OWNER, HandoverStatus.ACCEPTED].includes(handover.status) && (
                  <div className="ml-5 h-6 border-l-2 border-muted-foreground/30" />
                )}

                {/* ACCEPTED */}
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    handover.status === HandoverStatus.ACCEPTED
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {handover.status === HandoverStatus.ACCEPTED ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">3</span>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-medium ${handover.status === HandoverStatus.ACCEPTED ? 'text-green-600' : ''}`}>
                      Accepted
                    </p>
                    {handover.ownerAcceptedAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(handover.ownerAcceptedAt), 'PPp')}
                      </p>
                    )}
                    {handover.status === HandoverStatus.ACCEPTED && handover.pdfUrl && (
                      <p className="text-xs text-green-600 mt-1">
                        PDF Generated
                      </p>
                    )}
                  </div>
                </div>

                {/* Show cancelled status if applicable */}
                {handover.status === HandoverStatus.CANCELLED && (
                  <>
                    <div className="ml-5 h-6 border-l-2 border-red-300" />
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                        <XCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-medium text-red-600">
                          Cancelled
                        </p>
                        {handover.cancelledAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(handover.cancelledAt), 'PPp')}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialogs - Simplified Workflow */}
      {/* Send to Owner Dialog */}
      <Dialog open={sendDialog} onOpenChange={setSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Handover to Owner</DialogTitle>
            <DialogDescription>
              Send this handover to {handover.owner?.name || handover.owner?.email} for acceptance.
              The owner will be able to accept via their unit page.
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