'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { AttachmentGallery } from './AttachmentUploader'
import { SnaggingMessage } from '@/lib/types/snagging.types'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateSnaggingMessage, useDeleteSnaggingMessage } from '@/lib/hooks/use-snagging'
import {
  Edit2,
  Trash2,
  MoreVertical,
  User,
  Shield,
  Save,
  X,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageItemProps {
  message: SnaggingMessage
  snaggingId: string
  isOwner?: boolean // Is the current user the owner of the snagging
}

export function MessageItem({ message, snaggingId, isOwner = false }: MessageItemProps) {
  const { userId, userRole } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.bodyText || message.content || '')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const updateMessage = useUpdateSnaggingMessage(snaggingId)
  const deleteMessage = useDeleteSnaggingMessage(snaggingId)

  // Get the correct field names first
  const messageContent = message.bodyText || message.content || ''
  const authorId = message.authorUserId || message.authorId

  const isAuthor = authorId === userId
  const isAdmin = userRole === 'admin'
  const canEdit = isAuthor && !isAdmin // Only authors can edit their own messages
  const canDelete = isAdmin || (isAuthor && isOwner) // Admin can delete any, owner can delete own

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(messageContent)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(messageContent)
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() === messageContent) {
      setIsEditing(false)
      return
    }

    try {
      await updateMessage.mutateAsync({
        messageId: message.id,
        data: { bodyText: editContent.trim() },
      })
      setIsEditing(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMessage.mutateAsync(message.id)
      setShowDeleteDialog(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const formatMessageDate = (date: string) => {
    try {
      const messageDate = new Date(date)
      const now = new Date()
      const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return format(messageDate, 'h:mm a')
      } else if (diffInHours < 48) {
        return `Yesterday at ${format(messageDate, 'h:mm a')}`
      } else {
        return format(messageDate, 'MMM d, yyyy h:mm a')
      }
    } catch {
      return 'Invalid date'
    }
  }

  const getRoleBadge = () => {
    if (message.author.role === 'ADMIN') {
      return (
        <Badge variant="destructive" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      )
    }
    if (isOwner && isAuthor) {
      return (
        <Badge variant="default" className="gap-1">
          <User className="h-3 w-3" />
          Owner
        </Badge>
      )
    }
    return null
  }

  return (
    <>
      <Card
        className={cn(
          'p-4 transition-colors',
          isAuthor && 'bg-primary/5 border-primary/20',
          message.author.role === 'ADMIN' && 'bg-destructive/5 border-destructive/20'
        )}
      >
        {/* Message Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{message.author.name || 'Unknown User'}</p>
                {getRoleBadge()}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatMessageDate(message.createdAt)}</span>
                {message.isEdited && (
                  <>
                    <span>•</span>
                    <span className="italic">edited</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {(canEdit || canDelete) && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Message
                  </DropdownMenuItem>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Message
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Message Content */}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={updateMessage.isPending || !editContent.trim()}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateMessage.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {message.bodyTitle && (
              <h4 className="font-medium text-sm mb-1">{message.bodyTitle}</h4>
            )}
            <p className="text-sm whitespace-pre-wrap">{messageContent}</p>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <AttachmentGallery attachments={message.attachments} />
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMessage.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMessage.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}