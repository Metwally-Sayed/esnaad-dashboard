'use client'

import { useAuth } from '@/contexts/AuthContext'
import { DashboardContent } from './DashboardContent'
import { OwnerDashboardContent } from './OwnerDashboardContent'
import { Loader2 } from 'lucide-react'

export function DashboardWrapper() {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return isAdmin ? <DashboardContent /> : <OwnerDashboardContent />
}
