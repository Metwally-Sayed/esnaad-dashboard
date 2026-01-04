'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { MessageItem } from './MessageItem'
import { MessageComposer } from './MessageComposer'
import { AttachmentGallery } from './AttachmentUploader'
import {
  useSnagging,
  useSnaggingMessages,
  useUpdateSnagging,
  useDeleteSnagging,
} from '@/lib/hooks/use-snagging'
import { SnaggingStatus, SnaggingPriority } from '@/lib/types/snagging.types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Home,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  X,
  Trash2,
  Shield,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface SnaggingThreadProps {
  snaggingId: string
}

export function SnaggingThread({ snaggingId }: SnaggingThreadProps) {
  const router = useRouter()
  const { userId, userRole } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch snagging details
  const { data: snagging, isLoading: isLoadingSnagging } = useSnagging(snaggingId)

  // Fetch messages
  const { data: messagesData, isLoading: isLoadingMessages } = useSnaggingMessages(snaggingId, 1, 50)

  // Mutations
  const updateSnagging = useUpdateSnagging()
  const deleteSnagging = useDeleteSnagging()

  const isOwner = snagging?.createdById === userId
  const isAdmin = userRole === 'admin'
  const canUpdateStatus = isAdmin
  const canUpdatePriority = isAdmin || isOwner
  const canDelete = isAdmin || isOwner

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messagesData?.data) {
      scrollToBottom()
    }
  }, [messagesData])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleStatusChange = async (newStatus: SnaggingStatus) => {
    if (!snagging || !canUpdateStatus) return

    try {
      await updateSnagging.mutateAsync({
        id: snagging.id,
        data: { status: newStatus },
      })
      toast.success('Status updated successfully')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handlePriorityChange = async (newPriority: SnaggingPriority) => {
    if (!snagging || !canUpdatePriority) return

    try {
      await updateSnagging.mutateAsync({
        id: snagging.id,
        data: { priority: newPriority },
      })
      toast.success('Priority updated successfully')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    if (!snagging) return

    try {
      await deleteSnagging.mutateAsync(snagging.id)
      toast.success('Snagging deleted successfully')
      router.push('/snaggings')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getStatusIcon = (status: SnaggingStatus) => {
    switch (status) {
      case SnaggingStatus.OPEN:
        return <Circle className="h-4 w-4" />
      case SnaggingStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4" />
      case SnaggingStatus.RESOLVED:
        return <CheckCircle2 className="h-4 w-4" />
      case SnaggingStatus.CLOSED:
        return <X className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: SnaggingStatus) => {
    switch (status) {
      case SnaggingStatus.OPEN:
        return 'destructive'
      case SnaggingStatus.IN_PROGRESS:
        return 'default'
      case SnaggingStatus.RESOLVED:
        return 'outline'
      case SnaggingStatus.CLOSED:
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getPriorityVariant = (priority: SnaggingPriority) => {
    switch (priority) {
      case SnaggingPriority.LOW:
        return 'secondary'
      case SnaggingPriority.MEDIUM:
        return 'default'
      case SnaggingPriority.HIGH:
        return 'outline'
      case SnaggingPriority.URGENT:
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (isLoadingSnagging) {
    return (
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!snagging) {
    return (
      <div className="max-w-[1200px] mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-4">Snagging not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Thread Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              {/* Title and Status */}
              <div className="flex items-start gap-3">
                <CardTitle className="text-2xl flex-1">{snagging.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {canUpdateStatus ? (
                    <Select
                      value={snagging.status}
                      onValueChange={(value) => handleStatusChange(value as SnaggingStatus)}
                      disabled={updateSnagging.isPending}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SnaggingStatus.OPEN}>
                          <div className="flex items-center gap-2">
                            <Circle className="h-4 w-4" />
                            Open
                          </div>
                        </SelectItem>
                        <SelectItem value={SnaggingStatus.IN_PROGRESS}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value={SnaggingStatus.RESOLVED}>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Resolved
                          </div>
                        </SelectItem>
                        <SelectItem value={SnaggingStatus.CLOSED}>
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Closed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusVariant(snagging.status)} className="gap-1">
                      {getStatusIcon(snagging.status)}
                      {snagging.status.replace('_', ' ')}
                    </Badge>
                  )}

                  {canUpdatePriority ? (
                    <Select
                      value={snagging.priority}
                      onValueChange={(value) => handlePriorityChange(value as SnaggingPriority)}
                      disabled={updateSnagging.isPending}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SnaggingPriority.LOW}>Low</SelectItem>
                        <SelectItem value={SnaggingPriority.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={SnaggingPriority.HIGH}>High</SelectItem>
                        <SelectItem value={SnaggingPriority.URGENT}>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getPriorityVariant(snagging.priority)}>
                      {snagging.priority}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {snagging.unit && (
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span>
                      Unit {snagging.unit.unitNumber}
                      {snagging.unit.buildingName && ` - ${snagging.unit.buildingName}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>
                    Created by {snagging.createdBy?.name || 'Unknown'}
                    {snagging.createdBy?.role === 'ADMIN' && (
                      <Badge variant="destructive" className="ml-2 h-5">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(snagging.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
                {snagging._count?.messages && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{snagging._count.messages} messages</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {snagging.description && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{snagging.description}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          {isLoadingMessages ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : messagesData?.data && messagesData.data.length > 0 ? (
            <div className="space-y-4">
              {messagesData.data.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  snaggingId={snaggingId}
                  isOwner={isOwner}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet. Start the conversation below.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Composer */}
      <MessageComposer
        snaggingId={snaggingId}
        placeholder="Type your message..."
        onMessageSent={scrollToBottom}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Snagging</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this snagging item? This will permanently delete
              all messages and attachments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSnagging.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSnagging.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Snagging'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}