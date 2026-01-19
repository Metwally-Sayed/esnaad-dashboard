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
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HandoverStatusBadge } from './HandoverStatusBadge'
import { Handover, getAllowedActions } from '@/lib/types/handover.types'
import { Eye, Edit, Send, CheckCircle, XCircle, MessageSquare, MoreHorizontal, FileText, Home, User, Building2, Download } from 'lucide-react'
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
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Unit</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[100px]">Project</TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">Owner</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[80px]">PDF</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[100px]">Created</TableHead>
              <TableHead className="text-right min-w-[60px]">Actions</TableHead>
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
                  {/* Unit */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{handover.unit?.unitNumber}</p>
                        {handover.unit?.buildingName && (
                          <p className="text-xs text-muted-foreground">
                            {handover.unit.buildingName}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Project */}
                  <TableCell className="hidden sm:table-cell">
                    {handover.unit?.project?.name ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">{handover.unit.project.name}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm truncate max-w-[120px]">{handover.owner?.name || handover.owner?.email}</p>
                        {handover.owner?.phone && (
                          <p className="text-xs text-muted-foreground">{handover.owner.phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <HandoverStatusBadge status={handover.status} />
                  </TableCell>

                  {/* PDF */}
                  <TableCell className="hidden md:table-cell">
                    {handover.pdfUrl ? (
                      <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
                        <FileText className="h-3 w-3" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        Pending
                      </Badge>
                    )}
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="hidden lg:table-cell">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(handover.createdAt), 'MMM d, yyyy')}
                    </p>
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
      </div>
    </div>
  )
}