'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { handoverService } from '@/lib/api/handover.service'
import { HandoverAttachment } from '@/lib/types/handover.types'
import { toast } from 'sonner'
import {
  Upload,
  File,
  Image,
  FileText,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AttachmentUploaderProps {
  handoverId?: string
  attachments: HandoverAttachment[]
  onUpload?: (attachment: HandoverAttachment) => void
  onRemove?: (attachmentId: string) => void
  disabled?: boolean
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedFileTypes?: string[]
}

export function AttachmentUploader({
  handoverId,
  attachments = [],
  onUpload,
  onRemove,
  disabled = false,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx']
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; attachment?: HandoverAttachment }>({ open: false })
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || !e.dataTransfer.files || !e.dataTransfer.files[0]) {
      return
    }

    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return
    }

    handleFiles(e.target.files)
  }

  const handleFiles = async (files: FileList) => {
    // Check max files limit
    if (attachments.length + files.length > maxFiles) {
      toast.error("Too many files", {
        description: `You can only upload up to ${maxFiles} files`
      })
      return
    }

    const filesToUpload = Array.from(files)

    // Validate file sizes
    const oversizedFiles = filesToUpload.filter(file => file.size > maxFileSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error("Files too large", {
        description: `Files must be smaller than ${maxFileSize}MB`
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]
        setUploadProgress((i / filesToUpload.length) * 100)

        // Get presigned URL from backend
        const { url, fields } = await handoverService.getUploadUrl(handoverId!, {
          filename: file.name,
          contentType: file.type,
          size: file.size
        })

        // Upload to R2
        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        formData.append('file', file)

        const uploadResponse = await fetch(url, {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Upload failed')
        }

        // Create attachment record
        const attachment = await handoverService.createAttachment(handoverId!, {
          filename: file.name,
          url: `${url}/${fields.key}`,
          mimeType: file.type,
          size: file.size,
          caption: file.name
        })

        if (onUpload) {
          onUpload(attachment)
        }
      }

      toast.success("Upload successful", {
        description: `${filesToUpload.length} file(s) uploaded successfully`
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Upload failed", {
        description: "Failed to upload files. Please try again."
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.attachment) return

    try {
      await handoverService.deleteAttachment(handoverId!, deleteDialog.attachment.id)
      if (onRemove) {
        onRemove(deleteDialog.attachment.id)
      }
      toast.success("File deleted", {
        description: "The file has been removed successfully"
      })
    } catch (error) {
      toast.error("Delete failed", {
        description: "Failed to delete the file. Please try again."
      })
    } finally {
      setDeleteDialog({ open: false })
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType === 'application/pdf') return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading files...</p>
              <Progress value={uploadProgress} className="max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Maximum {maxFiles} files, up to {maxFileSize}MB each
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                Choose Files
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Attached Files ({attachments.length}/{maxFiles})
            </p>
          </div>

          <div className="grid gap-2">
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.mimeType || 'application/octet-stream')

              return (
                <Card key={attachment.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.caption || attachment.key || 'Attachment'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.sizeBytes || 0)}
                        </span>
                        {attachment.createdAt && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(attachment.createdAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={attachment.caption || attachment.key || 'attachment'}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      {!disabled && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog({ open: true, attachment })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.attachment?.caption || deleteDialog.attachment?.key || 'this attachment'}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}