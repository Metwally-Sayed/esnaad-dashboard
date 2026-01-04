'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AttachmentUploader } from './AttachmentUploader'
import { useCreateSnaggingMessage, useUploadFiles } from '@/lib/hooks/use-snagging'
import { Send, Paperclip, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
  snaggingId: string
  placeholder?: string
  disabled?: boolean
  className?: string
  onMessageSent?: () => void
}

export function MessageComposer({
  snaggingId,
  placeholder = 'Type your message...',
  disabled = false,
  className,
  onMessageSent,
}: MessageComposerProps) {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [showAttachments, setShowAttachments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMessage = useCreateSnaggingMessage(snaggingId)
  const uploadFiles = useUploadFiles()

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!content.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach files')
      return
    }

    try {
      setIsSubmitting(true)

      // For now, skip file uploads since backend upload is not configured
      // TODO: Enable when backend upload is ready
      let attachmentData: any[] = []
      if (attachments.length > 0) {
        console.log('Skipping file upload - backend not configured')
        // Create dummy attachment data for testing
        attachmentData = attachments.map(file => ({
          url: `https://placeholder.com/${file.name}`,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size
        }))
      }

      // Create message with correct field names
      await createMessage.mutateAsync({
        bodyText: content.trim(),
        attachments: attachmentData.length > 0 ? attachmentData : undefined
      })

      // Reset form
      setContent('')
      setAttachments([])
      setShowAttachments(false)

      // Callback
      onMessageSent?.()
    } catch (error: any) {
      console.error('Failed to send message:', error)
      // Error already handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = (content.trim() || attachments.length > 0) && !isSubmitting && !disabled

  return (
    <Card className={cn('p-4', className)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Message Input */}
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            className="min-h-[80px] pr-12 resize-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={() => setShowAttachments(!showAttachments)}
            disabled={disabled || isSubmitting}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        {/* Attachment Uploader */}
        {showAttachments && (
          <div className="border-t pt-3">
            <AttachmentUploader
              value={attachments}
              onChange={setAttachments}
              maxFiles={3}
              maxSize={10}
              disabled={disabled || isSubmitting}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {attachments.length > 0 && (
              <span>{attachments.length} file(s) attached</span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!canSend}
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}