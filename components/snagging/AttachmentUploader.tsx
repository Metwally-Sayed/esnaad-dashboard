'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AttachmentUploaderProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
}

export function AttachmentUploader({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10,
  disabled = false,
  className,
}: AttachmentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const MAX_SIZE_BYTES = maxSize * 1024 * 1024

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name} is not a supported image type`
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `${file.name} exceeds ${maxSize}MB limit`
    }
    return null
  }

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return

      const newFiles = Array.from(files)
      const currentCount = value.length
      const availableSlots = maxFiles - currentCount

      if (availableSlots <= 0) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      const filesToAdd = newFiles.slice(0, availableSlots)
      const errors: string[] = []

      const validFiles = filesToAdd.filter((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
          return false
        }
        return true
      })

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error))
      }

      if (validFiles.length > 0) {
        onChange([...value, ...validFiles])
      }
    },
    [value, onChange, maxFiles, disabled]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeFile = (index: number) => {
    const newFiles = [...value]
    const fileName = newFiles[index].name
    newFiles.splice(index, 1)
    onChange(newFiles)

    // Clear progress for removed file
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const handleFilesBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Detect mobile devices where camera capture works properly
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile Camera Quick Access - Show on mobile when no files */}
      {isMobile && value.length === 0 && !disabled && (
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <Button
            type="button"
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={handleCameraCapture}
            disabled={disabled || value.length >= maxFiles}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">Take Photo</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={handleFilesBrowse}
            disabled={disabled || value.length >= maxFiles}
          >
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">Choose from Gallery</span>
          </Button>
        </div>
      )}

      {/* Drop Zone - Hide on mobile when quick access is shown */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-primary/50',
          isMobile && value.length === 0 && 'hidden md:block'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Hidden file input for regular file selection */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        {/* Hidden camera input - single file with capture attribute */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">
            {isMobile ? 'Tap to upload or take a photo' : 'Drag and drop images here, or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} files, up to {maxSize}MB each
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFilesBrowse}
              disabled={disabled || value.length >= maxFiles}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Browse Files
            </Button>

            {/* Only show camera button on mobile devices where it works properly */}
            {isMobile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCameraCapture}
                disabled={disabled || value.length >= maxFiles}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* File Preview */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected Files ({value.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {value.map((file, index) => {
              const objectUrl = URL.createObjectURL(file)
              const progress = uploadProgress[file.name]

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="relative group rounded-lg border bg-card overflow-hidden"
                >
                  <div className="aspect-square relative">
                    <img
                      src={objectUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(objectUrl)}
                    />

                    {/* Upload Progress Overlay */}
                    {progress !== undefined && progress < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-xs">{Math.round(progress)}%</p>
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="p-2">
                    <p className="text-xs truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {progress !== undefined && progress < 100 && (
                    <Progress value={progress} className="h-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Utility component for displaying uploaded attachments (read-only)
interface AttachmentGalleryProps {
  attachments: Array<{
    id: string
    url: string
    fileName: string
    thumbnailUrl?: string | null
  }>
  className?: string
}

export function AttachmentGallery({ attachments, className }: AttachmentGalleryProps) {
  if (attachments.length === 0) return null

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2', className)}>
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group rounded-lg border bg-card overflow-hidden hover:border-primary transition-colors"
        >
          <div className="aspect-square relative">
            <img
              src={attachment.thumbnailUrl || attachment.url}
              alt={attachment.fileName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div className="p-2">
            <p className="text-xs truncate" title={attachment.fileName}>
              {attachment.fileName}
            </p>
          </div>
        </a>
      ))}
    </div>
  )
}