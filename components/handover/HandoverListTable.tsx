'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HandoverStatusBadge } from './HandoverStatusBadge'
import { Handover, getAllowedActions } from '@/lib/types/handover.types'
import { Eye, Edit, Send, CheckCircle, XCircle, MessageSquare, MoreHorizontal, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { EmptyState } from '@/components/ui/empty-state'

interface HandoverListTableProps {
  handovers: Handover[]
  isLoading?: boolean
  onSend?: (handover: Handover) => void
  onConfirm?: (handover: Handover) => void
  onRequestChanges?: (handover: Handover) => void
  onCancel?: (handover: Handover) => void
  onComplete?: (handover: Handover) => void
}

export function HandoverListTable({
  handovers,
  isLoading,
  onSend,
  onConfirm,
  onRequestChanges,
  onCancel,
  onComplete
}: HandoverListTableProps) {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const userRole = isAdmin ? 'ADMIN' : 'OWNER'

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!handovers.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No handovers found"
        description="Create a new handover agreement to get started"
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unit</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Scheduled Date</TableHead>
          <TableHead>Handover Date</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {handovers.map((handover) => {
          const allowedActions = getAllowedActions(handover, userRole)

          return (
            <TableRow
              key={handover.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/handovers/${handover.id}`)}
            >
              <TableCell className="font-medium">
                {handover.unit?.unitNumber}
                {handover.unit?.buildingName && (
                  <span className="text-sm text-muted-foreground ml-1">
                    ({handover.unit.buildingName})
                  </span>
                )}
              </TableCell>
              <TableCell>
                {handover.owner?.name || handover.owner?.email}
              </TableCell>
              <TableCell>
                <HandoverStatusBadge status={handover.status} />
              </TableCell>
              <TableCell>
                {handover.scheduledAt ? format(new Date(handover.scheduledAt), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell>
                {handover.handoverAt ? format(new Date(handover.handoverAt), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell>
                {format(new Date(handover.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/handovers/${handover.id}`)
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>

                    {allowedActions.includes('edit') && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/handovers/${handover.id}/edit`)
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}

                    {allowedActions.includes('send') && onSend && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onSend(handover)
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Send to Owner
                      </DropdownMenuItem>
                    )}

                    {allowedActions.includes('owner-confirm') && onConfirm && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onConfirm(handover)
                      }}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm
                      </DropdownMenuItem>
                    )}

                    {allowedActions.includes('request-changes') && onRequestChanges && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onRequestChanges(handover)
                      }}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Changes
                      </DropdownMenuItem>
                    )}

                    {allowedActions.includes('complete') && onComplete && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onComplete(handover)
                      }}>
                        <FileText className="h-4 w-4 mr-2" />
                        Complete & Generate PDF
                      </DropdownMenuItem>
                    )}

                    {allowedActions.includes('cancel') && onCancel && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onCancel(handover)
                        }}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}