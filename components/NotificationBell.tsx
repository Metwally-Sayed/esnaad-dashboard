'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnreadCount, useNotifications, useNotificationMutations } from '@/lib/hooks/use-notifications'
import { Notification } from '@/lib/types/notification.types'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const { unreadCount, mutate: mutateCount } = useUnreadCount()
  const { notifications, mutate: mutateNotifications } = useNotifications({
    limit: 10,
    unreadOnly: true,
  })
  const { markAsRead, markAllAsRead } = useNotificationMutations()

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await markAsRead(notification.id)

    // Refresh counts and list
    mutateCount()
    mutateNotifications()

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }

    setIsOpen(false)
  }

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return

    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
    await markAllAsRead(unreadIds)

    mutateCount()
    mutateNotifications()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      notification.isRead ? 'bg-muted' : 'bg-primary'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
