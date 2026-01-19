'use client'

import { UnitEditPage, UnitFormData } from "./UnitEditContent"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useUnit, useUnitMutations } from "@/lib/hooks/use-units"
import { UpdateUnitDto } from "@/lib/types/api.types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface UnitEditWrapperProps {
  unitId: string
}

export function UnitEditWrapper({ unitId }: UnitEditWrapperProps) {
  const router = useRouter()
  const { userRole } = useAuth()
  const { unit, isLoading, error } = useUnit(unitId)
  const { updateUnit, isUpdating } = useUnitMutations()

  // Redirect owners to view page (no edit access)
  useEffect(() => {
    if (userRole === 'owner') {
      router.push(`/units/${unitId}`)
    }
  }, [userRole, unitId, router])

  const handleBack = () => {
    router.push('/units')
  }

  const handleSave = async (data: UnitFormData) => {
    try {
      // Convert form data to API format
      const apiData: UpdateUnitDto = {
        unitNumber: data.unitCode,
        unitType: data.unitType,
        buildingName: data.buildingName || undefined,
        address: data.address || undefined,
        floor: data.floor ? parseInt(data.floor) : undefined,
        area: data.size ? parseFloat(data.size) : undefined,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : undefined,
        price: data.price ? parseFloat(data.price) : undefined,
        amenities: data.amenities || undefined,
        projectId: data.projectId && data.projectId !== 'none' ? data.projectId : undefined,
      }

      await updateUnit(unitId, apiData)
      toast.success('Unit updated successfully!')
      router.push(`/units/${unitId}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update unit')
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push(`/units/${unitId}`)
    }
  }

  // Only render edit page for admins
  if (userRole !== 'admin') {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  // Error state
  if (error || !unit) {
    return (
      <div className="max-w-[1440px] mx-auto p-8">
        <div className="text-center text-destructive">
          {error?.message || 'Unit not found'}
        </div>
      </div>
    )
  }

  // Convert unit data to form format
  const initialData: UnitFormData = {
    id: unit.id,
    unitCode: unit.unitNumber,
    unitType: unit.unitType || 'Apartment',
    buildingName: unit.buildingName || '',
    address: unit.address || '',
    floor: unit.floor?.toString() || '',
    size: unit.area?.toString() || '',
    bedrooms: unit.bedrooms?.toString() || '',
    bathrooms: unit.bathrooms?.toString() || '',
    price: unit.price?.toString() || '',
    amenities: unit.amenities || '',
    projectId: unit.projectId || undefined,
    projectName: unit.project?.name,
    ownerId: unit.ownerId || undefined,
    ownerName: unit.owner?.name || undefined,
    createdAt: new Date(unit.createdAt).toLocaleDateString(),
    lastUpdated: new Date(unit.updatedAt).toLocaleDateString(),
  }

  return (
    <UnitEditPage
      initialData={initialData}
      onBack={handleBack}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
