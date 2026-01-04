'use client'

import { Badge } from '@/components/ui/badge'
import { HandoverStatus, getStatusLabel, getStatusColor } from '@/lib/types/handover.types'

interface HandoverStatusBadgeProps {
  status: HandoverStatus
  className?: string
}

export function HandoverStatusBadge({ status, className }: HandoverStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`${getStatusColor(status)} ${className || ''}`}
    >
      {getStatusLabel(status)}
    </Badge>
  )
}