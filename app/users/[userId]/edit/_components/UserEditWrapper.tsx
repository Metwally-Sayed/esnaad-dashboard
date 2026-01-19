'use client'

import { UserEditContent, OwnerFormData, OwnedUnit } from "./UserEditContent"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { fetchUserById, updateUser } from "@/lib/api/users.service"
import { UserDetails } from "@/lib/types/api.types"
import { toast } from "sonner"
import { useUnits } from "@/lib/hooks/use-units"

interface UserEditWrapperProps {
  userId: string
}

export function UserEditWrapper({ userId }: UserEditWrapperProps) {
  const router = useRouter()
  const { userRole } = useAuth()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch units owned by this user
  const { units: userUnits = [] } = useUnits({ ownerId: userId })

  // Redirect non-admin users to users page
  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/users')
    }
  }, [userRole, router])

  // Fetch user data
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

  // Convert UserDetails to OwnerFormData format
  const getInitialData = (): OwnerFormData | undefined => {
    if (!user) return undefined

    const nameParts = (user.name || '').split(' ')
    const firstName = nameParts[0] || ''
    const familyName = nameParts.slice(1).join(' ') || ''

    return {
      id: user.id,
      firstName,
      familyName,
      email: user.email,
      nationalityId: user.externalClient?.nationalityId || '',
      phoneNumber: user.externalClient?.phoneNumber || '',
      status: user.isActive ? 'Active' : 'Suspended',
      createdAt: user.createdAt || undefined,
      lastUpdated: user.updatedAt || undefined,
    }
  }

  // Convert units to OwnedUnit format
  const getOwnedUnits = (): OwnedUnit[] => {
    return userUnits.map(unit => ({
      id: unit.id,
      unitCode: unit.unitNumber, // Map unitNumber to unitCode
      type: unit.unitType || 'Unknown',
      building: unit.buildingName || unit.project?.name || '',
      status: unit.ownerId ? 'Occupied' : 'Vacant' as 'Occupied' | 'Vacant' | 'Maintenance',
    }))
  }

  const handleBack = () => {
    router.push('/users')
  }

  const handleSave = async (data: OwnerFormData) => {
    try {
      setIsSaving(true)

      // Prepare update data
      const updateData = {
        name: `${data.firstName} ${data.familyName}`.trim(),
        isActive: data.status === 'Active',
      }

      // Update user via API
      const updatedUser = await updateUser(userId, updateData)

      // Note: External client data (nationality ID, phone) would need separate API endpoint
      // For now, we're only updating what the current API supports

      toast.success('User updated successfully!')
      router.push(`/users/${userId}`)
    } catch (error: any) {
      console.error('Failed to update user:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push(`/users/${userId}`)
    }
  }

  const handleDeactivate = async () => {
    if (!user) return

    try {
      setIsSaving(true)

      // Update user status to inactive
      await updateUser(userId, { isActive: false })

      toast.success('User account has been deactivated')
      router.push('/users')
    } catch (error: any) {
      console.error('Failed to deactivate user:', error)
      toast.error(error.message || 'Failed to deactivate user')
    } finally {
      setIsSaving(false)
    }
  }

  // Only render for admin users
  if (userRole !== 'admin') {
    return null
  }

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="max-w-[1440px] mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-12 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserEditContent
      initialData={getInitialData()}
      ownedUnits={getOwnedUnits()}
      onBack={handleBack}
      onSave={handleSave}
      onCancel={handleCancel}
      onDeactivate={handleDeactivate}
      isSaving={isSaving}
    />
  )
}
