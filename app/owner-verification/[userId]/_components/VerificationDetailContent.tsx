'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, FileText, Loader2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormDialog } from '@/components/ui/form-dialog'
import { useUserVerification, useVerificationMutations } from '@/lib/hooks/use-owner-verification'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { OwnerVerificationStatus } from '@/lib/types/owner-verification.types'

interface Props {
  userId: string
}

export function VerificationDetailContent({ userId }: Props) {
  const router = useRouter()
  const { verification, isLoading, mutate } = useUserVerification(userId)
  const { approve, reject, isApproving, isRejecting } = useVerificationMutations()

  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approvalNote, setApprovalNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!verification) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>Verification not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const passportDoc = verification.ownerDocuments?.find((d) => d.type === 'PASSPORT')
  const nationalIdDoc = verification.ownerDocuments?.find((d) => d.type === 'NATIONAL_ID')

  const getStatusBadge = (status: OwnerVerificationStatus) => {
    const variants: Record<OwnerVerificationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      NOT_REQUIRED: 'secondary',
      PENDING_DOCUMENTS: 'outline',
      PENDING_APPROVAL: 'default',
      APPROVED: 'secondary',
      REJECTED: 'destructive',
    }

    const labels: Record<OwnerVerificationStatus, string> = {
      NOT_REQUIRED: 'Not Required',
      PENDING_DOCUMENTS: 'Pending Documents',
      PENDING_APPROVAL: 'Pending Approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const handleApprove = async () => {
    try {
      await approve(userId, approvalNote ? { note: approvalNote } : undefined)
      toast.success('The owner has been approved and can now access the dashboard')
      setShowApproveDialog(false)
      await mutate()
      router.push('/owner-verification')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to approve verification')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    try {
      await reject(userId, { reason: rejectionReason })
      toast.success('The owner has been notified and can re-upload documents')
      setShowRejectDialog(false)
      await mutate()
      router.push('/owner-verification')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to reject verification')
    }
  }

  const canApprove = verification.verificationStatus === 'PENDING_APPROVAL' && passportDoc && nationalIdDoc

  return (
    <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold">Verification Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Review and approve owner documents</p>
        </div>
      </div>

      {/* Owner Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{verification.name || 'N/A'}</CardTitle>
              <CardDescription>{verification.email}</CardDescription>
            </div>
            {getStatusBadge(verification.verificationStatus)}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <span className="ml-2">{verification.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2">
                {formatDistanceToNow(new Date(verification.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span>
              <span className="ml-2">{verification.role}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Documents:</span>
              <span className="ml-2">{verification.ownerDocuments?.length || 0} uploaded</span>
            </div>
          </div>
          {verification.verificationNote && (
            <Alert variant={verification.verificationStatus === 'REJECTED' ? 'destructive' : 'default'}>
              <AlertDescription>
                <strong>Note:</strong> {verification.verificationNote}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Passport */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Passport
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passportDoc ? (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {passportDoc.mimeType.startsWith('image/') ? (
                    <img
                      src={passportDoc.fileKey}
                      alt="Passport"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="w-full">
                    <a href={passportDoc.fileKey} target="_blank" rel="noopener noreferrer">
                      View Full Document
                    </a>
                  </Button>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Status: {passportDoc.status}</div>
                    <div>Size: {(passportDoc.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                    <div>
                      Uploaded: {formatDistanceToNow(new Date(passportDoc.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No passport uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* National ID */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              National ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nationalIdDoc ? (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {nationalIdDoc.mimeType.startsWith('image/') ? (
                    <img
                      src={nationalIdDoc.fileKey}
                      alt="National ID"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="w-full">
                    <a href={nationalIdDoc.fileKey} target="_blank" rel="noopener noreferrer">
                      View Full Document
                    </a>
                  </Button>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Status: {nationalIdDoc.status}</div>
                    <div>Size: {(nationalIdDoc.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                    <div>
                      Uploaded: {formatDistanceToNow(new Date(nationalIdDoc.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No national ID uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {canApprove && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>Approve or reject this owner's verification</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              onClick={() => setShowApproveDialog(true)}
              className="flex-1"
              disabled={isApproving || isRejecting}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Verification
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              className="flex-1"
              disabled={isApproving || isRejecting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Verification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <FormDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        title="Approve Verification"
        description="Confirm that you want to approve this owner's verification"
        submitText="Approve"
        onSubmit={handleApprove}
        isLoading={isApproving}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approval-note">Note (Optional)</Label>
            <Textarea
              id="approval-note"
              placeholder="Add any notes about this approval..."
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </FormDialog>

      {/* Reject Dialog */}
      <FormDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title="Reject Verification"
        description="Provide a reason for rejecting this verification"
        submitText="Reject"
        submitVariant="destructive"
        onSubmit={handleReject}
        isLoading={isRejecting}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Explain why you're rejecting this verification..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              This reason will be shown to the owner so they can correct their documents
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  )
}
