'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useVerificationStatus, useOwnerDocumentMutations } from '@/lib/hooks/use-owner-verification'
import { uploadToCloudinary } from '@/lib/utils/cloudinary'
import { OwnerDocumentType } from '@/lib/types/owner-verification.types'
import { toast } from 'sonner'

export function VerifyDocumentsContent() {
  const { status, isLoading, mutate } = useVerificationStatus()
  const { upload, deleteDocument, submit, isUploading, isDeleting, isSubmitting } = useOwnerDocumentMutations()

  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  // Redirect if status doesn't match this page (but don't show if already approved)
  useEffect(() => {
    if (!isLoading && status) {
      if (status.verificationStatus === 'APPROVED' || status.verificationStatus === 'NOT_REQUIRED') {
        // Already approved - shouldn't be on this page, redirect to dashboard
        window.location.href = '/dashboard'
      } else if (status.verificationStatus === 'PENDING_APPROVAL') {
        // Already submitted, redirect to pending page
        window.location.href = '/pending-approval'
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

  const passportDoc = status?.documents?.find((d) => d.type === OwnerDocumentType.PASSPORT)
  const nationalIdDoc = status?.documents?.find((d) => d.type === OwnerDocumentType.NATIONAL_ID)

  const handleFileSelect = (type: OwnerDocumentType, file: File) => {
    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed')
      return
    }

    if (type === OwnerDocumentType.PASSPORT) {
      setPassportFile(file)
    } else {
      setNationalIdFile(file)
    }
  }

  const handleUpload = async (type: OwnerDocumentType, file: File) => {
    try {
      setUploadProgress((prev) => ({ ...prev, [type]: 0 }))

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [type]: progress }))
      })

      // Save document record
      await upload({
        type,
        fileKey: cloudinaryUrl,
        mimeType: file.type,
        sizeBytes: file.size,
      })

      toast.success(`Your ${type === OwnerDocumentType.PASSPORT ? 'passport' : 'national ID'} has been uploaded successfully`)

      // Clear file selection
      if (type === OwnerDocumentType.PASSPORT) {
        setPassportFile(null)
      } else {
        setNationalIdFile(null)
      }

      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[type]
        return newProgress
      })

      await mutate()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to upload document. Please try again.')
      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[type]
        return newProgress
      })
    }
  }

  const handleDelete = async (documentId: string, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type === 'PASSPORT' ? 'passport' : 'national ID'}?`)) {
      return
    }

    try {
      await deleteDocument(documentId)
      toast.success('Document has been deleted successfully')
      await mutate()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete document')
    }
  }

  const handleSubmit = async () => {
    try {
      await submit()
      toast.success('Your documents have been submitted for admin review')
      window.location.href = '/pending-approval'
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to submit documents')
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Document Verification</h1>
          <p className="text-muted-foreground mt-2">
            Upload your passport and national ID to verify your account
          </p>
        </div>

        {/* Rejection Notice */}
        {status?.verificationStatus === 'REJECTED' && status.verificationNote && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Verification Rejected:</strong> {status.verificationNote}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please upload clear, readable copies of your passport and national ID. Accepted formats: PDF, JPG, PNG
            (max 10MB each)
          </AlertDescription>
        </Alert>

        {/* Passport Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Passport
            </CardTitle>
            <CardDescription>Upload a copy of your passport</CardDescription>
          </CardHeader>
          <CardContent>
            {passportDoc ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Passport uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      {passportDoc.status === 'PENDING' && 'Pending review'}
                      {passportDoc.status === 'APPROVED' && 'Approved'}
                      {passportDoc.status === 'REJECTED' && `Rejected: ${passportDoc.rejectionReason}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={passportDoc.fileKey} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                  {status?.verificationStatus !== 'PENDING_APPROVAL' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(passportDoc.id, 'PASSPORT')}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="passport-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(OwnerDocumentType.PASSPORT, e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="passport-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload passport</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 10MB)</p>
                  </label>
                </div>

                {passportFile && (
                  <div className="space-y-2">
                    <p className="text-sm">Selected: {passportFile.name}</p>
                    {uploadProgress[OwnerDocumentType.PASSPORT] !== undefined ? (
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${uploadProgress[OwnerDocumentType.PASSPORT]}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploading... {uploadProgress[OwnerDocumentType.PASSPORT]}%
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleUpload(OwnerDocumentType.PASSPORT, passportFile)}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Upload Passport
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* National ID Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              National ID
            </CardTitle>
            <CardDescription>Upload a copy of your national ID</CardDescription>
          </CardHeader>
          <CardContent>
            {nationalIdDoc ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">National ID uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      {nationalIdDoc.status === 'PENDING' && 'Pending review'}
                      {nationalIdDoc.status === 'APPROVED' && 'Approved'}
                      {nationalIdDoc.status === 'REJECTED' && `Rejected: ${nationalIdDoc.rejectionReason}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={nationalIdDoc.fileKey} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                  {status?.verificationStatus !== 'PENDING_APPROVAL' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(nationalIdDoc.id, 'NATIONAL_ID')}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="national-id-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(OwnerDocumentType.NATIONAL_ID, e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="national-id-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload national ID</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 10MB)</p>
                  </label>
                </div>

                {nationalIdFile && (
                  <div className="space-y-2">
                    <p className="text-sm">Selected: {nationalIdFile.name}</p>
                    {uploadProgress[OwnerDocumentType.NATIONAL_ID] !== undefined ? (
                      <div className="space-y-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${uploadProgress[OwnerDocumentType.NATIONAL_ID]}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploading... {uploadProgress[OwnerDocumentType.NATIONAL_ID]}%
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleUpload(OwnerDocumentType.NATIONAL_ID, nationalIdFile)}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Upload National ID
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!status?.canSubmit || isSubmitting}
            size="lg"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  )
}
