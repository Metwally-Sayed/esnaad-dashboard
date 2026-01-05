'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Upload, X, AlertCircle, Loader2 } from 'lucide-react'
import { DocumentCategory } from '@/lib/types/unit-documents.types'
import { unitDocumentsService } from '@/lib/api/unit-documents.service'
import { useUnits } from '@/lib/hooks/use-units'
import { toast } from 'sonner'

const addDocumentSchema = z.object({
  unitId: z.string().min(1, 'Please select a unit'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  category: z.nativeEnum(DocumentCategory),
})

type AddDocumentFormData = z.infer<typeof addDocumentSchema>

interface AddDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (unitId: string, documentData: {
    title: string
    category: DocumentCategory
    fileKey: string
    mimeType: string
    sizeBytes: number
  }) => void
}

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.CONTRACT]: 'Contract',
  [DocumentCategory.BILL]: 'Bill',
  [DocumentCategory.OTHER]: 'Other',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function AddDocumentDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddDocumentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all units for admin to select from
  const { units, isLoading: unitsLoading } = useUnits({ limit: 1000 })

  const form = useForm<AddDocumentFormData>({
    resolver: zodResolver(addDocumentSchema),
    defaultValues: {
      unitId: '',
      title: '',
      category: DocumentCategory.OTHER,
    },
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round(bytes / Math.pow(k, i) * 10) / 10} ${sizes[i]}`
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`)
      return
    }

    setSelectedFile(file)
    setUploadError(null)

    // Auto-populate title from filename (without extension)
    if (!form.getValues('title')) {
      const titleFromFile = file.name.replace('.pdf', '').replace(/[_-]/g, ' ')
      form.setValue('title', titleFromFile)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadProgress(0)
  }

  const handleClose = () => {
    if (!isUploading) {
      form.reset()
      setSelectedFile(null)
      setUploadError(null)
      setUploadProgress(0)
      onOpenChange(false)
    }
  }

  const onSubmit = async (data: AddDocumentFormData) => {
    if (!selectedFile) {
      toast.error('Please select a PDF file')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      // Direct upload to R2 via backend (bypasses presigned URL signature issues)
      const uploadResult = await unitDocumentsService.uploadFileDirect(
        selectedFile,
        (progress) => {
          setUploadProgress(progress)
        }
      )

      // Call onSuccess with document data
      // Using publicUrl instead of key to store the full Cloudinary URL
      if (onSuccess) {
        onSuccess(data.unitId, {
          title: data.title,
          category: data.category,
          fileKey: uploadResult.publicUrl, // Store full Cloudinary URL
          mimeType: uploadResult.mimeType,
          sizeBytes: uploadResult.sizeBytes,
        })
      }

      toast.success('Document uploaded successfully')
      handleClose()
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Upload failed')
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Upload a PDF document for a unit
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Unit Selection */}
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isUploading || unitsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={unitsLoading ? "Loading units..." : "Select a unit"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unitNumber}
                          {unit.buildingName && ` - ${unit.buildingName}`}
                          {unit.owner && ` (${unit.owner.name || unit.owner.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the unit this document belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Area */}
            <div className="space-y-3">
              <label className="text-sm font-medium">PDF File *</label>
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">Click to upload PDF</p>
                  <p className="text-xs text-muted-foreground">
                    Maximum {formatFileSize(MAX_FILE_SIZE)}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <Progress value={uploadProgress} className="h-2 mt-2" />
                      )}
                    </div>
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Rental Contract - Unit A101"
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isUploading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedFile || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
