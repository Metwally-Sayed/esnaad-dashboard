'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, FileText, Image as ImageIcon, File, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadService } from '@/lib/api/handover.service'
import { toast } from 'sonner'

interface AttachmentFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  url?: string
  key?: string
  caption?: string
  error?: string
}

interface AttachmentUploadProps {
  onUploadComplete?: (attachments: Array<{
    url: string
    key: string
    mimeType: string
    sizeBytes: number
    caption?: string
  }>) => void
  maxFiles?: number
  maxSizeBytes?: number
  acceptedTypes?: string[]
  itemId?: string // If attaching to specific checklist item
}

export function AttachmentUpload({
  onUploadComplete,
  maxFiles = 10,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  itemId
}: AttachmentUploadProps) {
  const [files, setFiles] = useState<AttachmentFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType.includes('pdf')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate file sizes and types
    const validFiles: AttachmentFile[] = []
    for (const file of selectedFiles) {
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name} exceeds maximum size of ${formatFileSize(maxSizeBytes)}`)
        continue
      }

      const newFile: AttachmentFile = {
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'pending',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }

      validFiles.push(newFile)
    }

    setFiles(prev => [...prev, ...validFiles])

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const updateFileCaption = (fileId: string, caption: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, caption } : f))
  }

  const uploadFile = async (fileData: AttachmentFile) => {
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === fileData.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ))

      // Get presigned URL
      const presignedData = await uploadService.getPresignedUrl({
        fileName: fileData.file.name,
        contentType: fileData.file.type,
        sizeBytes: fileData.file.size
      })

      // Upload to R2
      await uploadService.uploadToR2(
        presignedData.url,
        fileData.file,
        (progress) => {
          setFiles(prev => prev.map(f =>
            f.id === fileData.id ? { ...f, progress } : f
          ))
        }
      )

      // Construct public URL from key
      const publicUrl = `https://your-r2-domain.com/${presignedData.key}`

      // Update status to completed
      setFiles(prev => prev.map(f =>
        f.id === fileData.id
          ? { ...f, status: 'completed' as const, progress: 100, url: publicUrl, key: presignedData.key }
          : f
      ))

      return {
        url: publicUrl,
        key: presignedData.key,
        mimeType: fileData.file.type,
        sizeBytes: fileData.file.size,
        caption: fileData.caption
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f =>
        f.id === fileData.id
          ? { ...f, status: 'error' as const, error: error.message || 'Upload failed' }
          : f
      ))
      throw error
    }
  }

  const uploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error')

    if (pendingFiles.length === 0) {
      toast.info('No files to upload')
      return
    }

    try {
      const uploadPromises = pendingFiles.map(file => uploadFile(file))
      const results = await Promise.all(uploadPromises)

      if (onUploadComplete) {
        const completedAttachments = results.filter(r => r !== null) as Array<{
          url: string
          key: string
          mimeType: string
          sizeBytes: number
          caption?: string
        }>
        onUploadComplete(completedAttachments)
      }

      toast.success(`${results.length} file(s) uploaded successfully`)
    } catch (error) {
      toast.error('Some files failed to upload')
    }
  }

  const completedCount = files.filter(f => f.status === 'completed').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground">
          Maximum {maxFiles} files, up to {formatFileSize(maxSizeBytes)} each
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supported: Images, PDF, Word documents
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Files ({files.length}/{maxFiles})
            </div>
            {files.some(f => f.status === 'pending' || f.status === 'error') && (
              <Button size="sm" onClick={uploadAll}>
                <Upload className="h-4 w-4 mr-2" />
                Upload All
              </Button>
            )}
          </div>

          {/* Summary */}
          {(completedCount > 0 || errorCount > 0) && (
            <div className="flex gap-4 text-sm">
              {completedCount > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {completedCount} completed
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errorCount} failed
                </div>
              )}
            </div>
          )}

          {files.map((fileData) => {
            const FileIcon = getFileIcon(fileData.file.type)

            return (
              <Card key={fileData.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Preview or Icon */}
                    <div className="flex-shrink-0">
                      {fileData.preview ? (
                        <img
                          src={fileData.preview}
                          alt={fileData.file.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileData.file.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              fileData.status === 'completed' ? 'default' :
                              fileData.status === 'error' ? 'destructive' :
                              fileData.status === 'uploading' ? 'secondary' :
                              'outline'
                            }
                          >
                            {fileData.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileData.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {fileData.status === 'uploading' && (
                        <Progress value={fileData.progress} className="h-2" />
                      )}

                      {/* Error Message */}
                      {fileData.status === 'error' && fileData.error && (
                        <Alert variant="destructive">
                          <AlertDescription className="text-xs">{fileData.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Caption Input */}
                      {(fileData.status === 'completed' || fileData.status === 'pending') && (
                        <div className="space-y-1">
                          <Label htmlFor={`caption-${fileData.id}`} className="text-xs">
                            Caption (optional)
                          </Label>
                          <Input
                            id={`caption-${fileData.id}`}
                            value={fileData.caption || ''}
                            onChange={(e) => updateFileCaption(fileData.id, e.target.value)}
                            placeholder="Add a description..."
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
