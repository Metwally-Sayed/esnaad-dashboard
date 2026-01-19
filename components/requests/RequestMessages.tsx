'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { requestService } from '@/lib/api/request.service'
import { RequestMessage } from '@/lib/types/request.types'
import { useAuth } from '@/contexts/AuthContext'
import { format, formatDistanceToNow } from 'date-fns'
import { Send, Loader2, MessageSquare, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RequestMessagesProps {
  requestId: string
  disabled?: boolean
}

export function RequestMessages({ requestId, disabled = false }: RequestMessagesProps) {
  const { user, isAdmin } = useAuth()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages
  const { data, isLoading, mutate } = useSWR(
    ['request-messages', requestId],
    () => requestService.getMessages(requestId)
  )

  const messages = data?.data || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || disabled) return

    setSending(true)
    try {
      await requestService.createMessage(requestId, { body: message.trim() })
      setMessage('')
      mutate()
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (messageId: string) => {
    setDeletingId(messageId)
    try {
      await requestService.deleteMessage(requestId, messageId)
      mutate()
    } catch (error) {
      console.error('Failed to delete message:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email?.charAt(0).toUpperCase() || '?'
  }

  const getRoleColor = (role?: string) => {
    if (role === 'ADMIN') return 'bg-primary text-primary-foreground'
    if (role === 'OWNER') return 'bg-blue-500 text-white'
    return 'bg-gray-500 text-white'
  }

  const getRoleLabel = (role?: string) => {
    if (role === 'ADMIN') return 'Admin'
    if (role === 'OWNER') return 'Owner'
    return 'User'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[500px] overflow-hidden">
      <CardHeader className="border-b bg-muted/30 py-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Messages</h3>
              {messages.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Messages */}
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No messages yet</p>
                {!disabled && <p className="text-sm mt-2">Start a conversation about this request</p>}
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = user && msg.authorUserId === user.id
                const canDelete = isAdmin || isCurrentUser

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3 group',
                      isCurrentUser && 'flex-row-reverse'
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar className="h-9 w-9 ring-2 ring-background">
                        <AvatarFallback className={cn(
                          "text-xs font-semibold",
                          getRoleColor(msg.author?.role)
                        )}>
                          {getUserInitials(msg.author?.name, msg.author?.email)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Message Content */}
                    <div
                      className={cn(
                        'flex-1 max-w-[75%] space-y-1',
                        isCurrentUser && 'flex flex-col items-end'
                      )}
                    >
                      {/* Header with Name and Role */}
                      <div
                        className={cn(
                          'flex items-baseline gap-2 px-1',
                          isCurrentUser && 'flex-row-reverse'
                        )}
                      >
                        <span className="font-semibold text-sm text-foreground">
                          {msg.author?.name || 'Unknown User'}
                        </span>
                        <Badge
                          variant={msg.authorRole === 'ADMIN' ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {getRoleLabel(msg.authorRole)}
                        </Badge>
                      </div>

                      {/* Message Body */}
                      <div
                        className={cn(
                          'relative rounded-2xl px-4 py-2.5 shadow-sm',
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-card border rounded-tl-sm'
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.body}
                        </p>

                        {/* Timestamp inside message bubble */}
                        <div className={cn(
                          "text-[10px] mt-1 opacity-70",
                          isCurrentUser ? "text-primary-foreground" : "text-muted-foreground"
                        )}>
                          {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                        </div>

                        {/* Delete button
                        {canDelete && !disabled && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className={cn(
                                  "absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                  "h-6 w-6 rounded-full flex items-center justify-center",
                                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                  isCurrentUser ? "-left-2" : "-right-2"
                                )}
                              >
                                {deletingId === msg.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The message will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(msg.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )} */}
                      </div>

                      {/* Relative time outside (on hover) */}
                      <div className={cn(
                        "text-[11px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        isCurrentUser && "text-right"
                      )}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          {!disabled && (
            <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={sending || disabled}
                    rows={2}
                    className="resize-none bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <span className="inline-flex items-center gap-1">
                      Press <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded border">Enter</kbd> to send
                    </span>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="inline-flex items-center gap-1">
                      <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded border">Shift</kbd>+<kbd className="px-1 py-0.5 text-[10px] bg-muted rounded border">Enter</kbd> for new line
                    </span>
                  </p>
                </div>
                <div className="flex items-center">
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sending || disabled}
                    size="sm"
                    className="h-9 "
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
