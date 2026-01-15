'use client'

import { useCallback, memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  Activity,
  User,
  Clock,
  FileText,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlusCircle,
  EditIcon,
  Trash2,
  UserPlus,
  UserMinus,
  Package,
} from 'lucide-react'
import {
  AuditLog,
  formatAuditAction,
  getAuditActionColor,
  formatEntityType,
} from '@/lib/types/audit.types'
import { useAuditFormatters } from '@/lib/hooks/use-audit-logs'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { EmptyState } from './ui/empty-state'

interface AuditLogsTableProps {
  auditLogs: AuditLog[]
  isLoading: boolean
  showActor?: boolean
  showEntity?: boolean
  compact?: boolean
}

export const AuditLogsTable = memo(function AuditLogsTable({
  auditLogs,
  isLoading,
  showActor = true,
  showEntity = true,
  compact = false,
}: AuditLogsTableProps) {
  const { formatDate, formatRelativeTime } = useAuditFormatters()

  // Memoize icon lookup to avoid recreating JSX on every render
  const getActionIcon = useCallback((action: string) => {
    if (action.includes('CREATED')) return <PlusCircle className="h-4 w-4" />
    if (action.includes('UPDATED')) return <EditIcon className="h-4 w-4" />
    if (action.includes('DELETED')) return <Trash2 className="h-4 w-4" />
    if (action.includes('ASSIGNED')) return <UserPlus className="h-4 w-4" />
    if (action.includes('UNASSIGNED')) return <UserMinus className="h-4 w-4" />
    if (action.includes('STATUS_CHANGED')) return <Activity className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }, [])

  // Memoize badge variant calculation
  const getBadgeVariant = useCallback((action: string): any => {
    const color = getAuditActionColor(action as any)
    if (color === 'success') return 'default'
    if (color === 'warning') return 'secondary'
    if (color === 'destructive') return 'destructive'
    if (color === 'info') return 'outline'
    return 'outline'
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Recent changes and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Recent changes and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Activity logs will appear here when changes are made"
          />
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    // Compact view for profile pages
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity History
          </CardTitle>
          <CardDescription>Recent changes and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {getActionIcon(log.action)}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm">
                        {showActor && (
                          <span className="font-medium">
                            {log.actor.name || log.actor.email}
                          </span>
                        )}{' '}
                        <Badge variant={getBadgeVariant(log.action)} className="ml-1">
                          {formatAuditAction(log.action)}
                        </Badge>
                      </p>
                      {showEntity && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatEntityType(log.entityType)} • {log.entityId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(log.createdAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDate(log.createdAt)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {log.metadata && (
                    <div className="text-xs text-muted-foreground">
                      {log.metadata.description || JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full table view for main audit page
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              {showActor && <TableHead>Performed By</TableHead>}
              {showEntity && <TableHead>Entity</TableHead>}
              <TableHead className="hidden md:table-cell">IP Address</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="hidden lg:table-cell">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                    <Badge variant={getBadgeVariant(log.action)}>
                      {formatAuditAction(log.action)}
                    </Badge>
                  </div>
                </TableCell>
                {showActor && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {log.actor.name?.[0]?.toUpperCase() || log.actor.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{log.actor.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                      </div>
                    </div>
                  </TableCell>
                )}
                {showEntity && (
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{formatEntityType(log.entityType)}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {log.entityId.slice(0, 8)}...
                      </p>
                      {log.unit && (
                        <p className="text-xs text-muted-foreground">
                          Unit: {log.unit.unitNumber}
                        </p>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground font-mono">
                    {log.ipAddress || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">{formatRelativeTime(log.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {log.changes ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <pre className="text-xs">{JSON.stringify(log.changes, null, 2)}</pre>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})