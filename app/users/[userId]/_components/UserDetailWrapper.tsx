'use client'

import { UserDetail } from "./UserDetail"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchUserById, updateUser } from "@/lib/api/users.service"
import { UserDetails, UnitDetails } from "@/lib/types/api.types"
import { toast } from "sonner"
import { useUnits } from "@/lib/hooks/use-units"
import { useUserAuditLogs } from "@/lib/hooks/use-audit-logs"

interface UserDetailWrapperProps {
  userId: string
}

export function UserDetailWrapper({ userId }: UserDetailWrapperProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch units owned by this user
  const { units: userUnits = [] } = useUnits({ ownerId: userId })

  // Fetch audit logs for this user
  const { auditLogs, isLoading: auditLoading } = useUserAuditLogs(userId, {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Convert Unit[] to UnitDetails[]
  const unitDetails: UnitDetails[] = userUnits.map(unit => ({
    ...unit,
    unitCode: unit.unitNumber,
    building: unit.buildingName,
    type: unit.unitType || 'Unknown'
  }))

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)
        const userData = await fetchUserById(userId)
        setUser(userData)
      } catch (error: any) {
        console.error('Failed to fetch user:', error)
        toast.error('Failed to load user details')
        router.push('/users')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [userId, router])

  const handleBack = () => {
    router.push('/users')
  }

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`)
  }

  const handleToggleStatus = async () => {
    if (!user) return

    const newStatus = !user.isActive
    const action = newStatus ? 'activate' : 'deactivate'

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return
    }

    try {
      setIsUpdating(true)
      const updatedUser = await updateUser(userId, { isActive: newStatus })
      setUser(updatedUser)
      toast.success(`User has been ${newStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (error: any) {
      console.error('Failed to update user status:', error)
      toast.error(`Failed to ${action} user`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewUnit = (unitId: string) => {
    router.push(`/units/${unitId}`)
  }

  return (
    <UserDetail
      user={user}
      units={unitDetails}
      auditLogs={auditLogs}
      isLoading={isLoading}
      isUpdating={isUpdating}
      auditLoading={auditLoading}
      onBack={handleBack}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onViewUnit={handleViewUnit}
    />
  )
}
