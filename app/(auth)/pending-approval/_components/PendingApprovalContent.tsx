'use client'

import { useEffect } from 'react'
import { Clock, FileCheck, Loader2, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useVerificationStatus } from '@/lib/hooks/use-owner-verification'
import { useAuth } from '@/contexts/AuthContext'

export function PendingApprovalContent() {
  const { logout } = useAuth()
  const { status, isLoading } = useVerificationStatus()

  // Redirect if status changes (but don't show this page if already approved)
  useEffect(() => {
    if (!isLoading && status) {
      if (status.verificationStatus === 'APPROVED' || status.verificationStatus === 'NOT_REQUIRED') {
        // Already approved - shouldn't be on this page, redirect to dashboard
        // This will only happen if status changed while user was on this page
        window.location.href = '/dashboard'
      } else if (status.verificationStatus === 'REJECTED') {
        window.location.href = '/verify-documents'
      } else if (status.verificationStatus === 'PENDING_DOCUMENTS') {
        window.location.href = '/verify-documents'
      }
    }
  }, [status, isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const passportDoc = status?.documents?.find((d) => d.type === 'PASSPORT')
  const nationalIdDoc = status?.documents?.find((d) => d.type === 'NATIONAL_ID')

  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <div className="space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-10 w-10 text-primary" />
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold mb-2">Documents Under Review</h1>
          <p className="text-lg text-muted-foreground">
            Your documents have been submitted and are being reviewed by our administrators
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <FileCheck className="h-5 w-5" />
              Submitted Documents
            </CardTitle>
            <CardDescription>We'll notify you once the review is complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document List */}
            <div className="space-y-3">
              {passportDoc && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Passport</span>
                  <span className="text-sm text-muted-foreground">
                    {passportDoc.status === 'PENDING' && 'Pending review'}
                    {passportDoc.status === 'APPROVED' && 'Approved'}
                  </span>
                </div>
              )}
              {nationalIdDoc && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">National ID</span>
                  <span className="text-sm text-muted-foreground">
                    {nationalIdDoc.status === 'PENDING' && 'Pending review'}
                    {nationalIdDoc.status === 'APPROVED' && 'Approved'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <AlertDescription>
            The verification process typically takes 1-2 business days. You'll receive a notification once your
            documents have been reviewed.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.href = '/verify-documents'}>
            View Documents
          </Button>
          <Button variant="outline" onClick={() => logout()}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
