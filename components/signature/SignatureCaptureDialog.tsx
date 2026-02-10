'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SignatureCanvas, SignatureCanvasMethods } from '@/components/ui/signature-canvas'
import { Loader2, Upload, Pen, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import snaggingService from '@/lib/api/snagging.service'

interface SignatureCaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  currentSignatureUrl?: string | null
  onSignatureCapture: (signatureUrl: string) => Promise<void>
}

export function SignatureCaptureDialog({
  open,
  onOpenChange,
  title = 'Add Signature',
  description = 'Draw your signature or upload an image',
  currentSignatureUrl,
  onSignatureCapture
}: SignatureCaptureDialogProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false)
  const canvasRef = useRef<SignatureCanvasMethods>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploadedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      let signatureUrl: string

      if (activeTab === 'draw') {
        // Get signature from canvas
        if (!canvasRef.current || !canvasRef.current.hasSignature()) {
          toast.error('Please draw your signature first')
          setIsSubmitting(false)
          return
        }

        const blob = await canvasRef.current.getSignatureBlob()
        if (!blob) {
          toast.error('Failed to capture signature')
          setIsSubmitting(false)
          return
        }

        // Create file from blob
        const file = new File([blob], 'signature.png', { type: 'image/png' })

        // Upload to Cloudinary using existing service
        const result = await snaggingService.uploadFileDirect(file, (progress) => {
          // Could add progress indicator here
        })

        signatureUrl = result.publicUrl
      } else {
        // Upload the selected file
        if (!uploadedFile) {
          toast.error('Please select an image to upload')
          setIsSubmitting(false)
          return
        }

        const result = await snaggingService.uploadFileDirect(uploadedFile, (progress) => {
          // Could add progress indicator here
        })

        signatureUrl = result.publicUrl
      }

      // Call the callback with the signature URL
      await onSignatureCapture(signatureUrl)

      toast.success('Signature saved successfully')
      handleClose()
    } catch (error: any) {
      console.error('Failed to save signature:', error)
      // Extract API error message properly (axios errors have response.data.error or response.data.message)
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to save signature'
      // Only show toast if the service layer hasn't already shown one
      // The service layer shows toasts, so we don't need to show another one
      // But if the error came from upload (not from the API call), we need to show it
      if (!error.response) {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset state
    setUploadedFile(null)
    setUploadPreview(null)
    setHasDrawnSignature(false)
    setActiveTab('draw')
    onOpenChange(false)
  }

  const canSubmit = activeTab === 'draw' ? hasDrawnSignature : !!uploadedFile

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Current Signature Preview */}
        {currentSignatureUrl && (
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground">Current Signature</Label>
            <div className="mt-2 p-4 bg-muted/50 rounded-lg border">
              <img
                src={currentSignatureUrl}
                alt="Current signature"
                className="max-h-20 mx-auto"
              />
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'draw' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Pen className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-4">
            <SignatureCanvas
              ref={canvasRef}
              width={450}
              height={200}
              onSignatureChange={setHasDrawnSignature}
              disabled={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="signature-upload">Upload Signature Image</Label>
                <Input
                  id="signature-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PNG, JPG, GIF. Max size: 2MB
                </p>
              </div>

              {uploadPreview && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Preview
                  </Label>
                  <img
                    src={uploadPreview}
                    alt="Signature preview"
                    className="max-h-24 mx-auto"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your signature will be included in the generated PDF document.
          </AlertDescription>
        </Alert>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Signature
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
