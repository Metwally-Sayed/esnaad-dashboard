'use client'

import { UnitCreatePage } from "./UnitCreateContent"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function CreateUnitWrapper() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAdmin } = useAuth()

  // Get projectId from URL query params
  const projectId = searchParams.get('projectId')

  // Redirect non-admin users to units page
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/units')
    }
  }, [isAdmin, router])

  // Only render for admin users
  if (!isAdmin) {
    return null
  }

  return (
    <UnitCreatePage
      defaultProjectId={projectId || undefined}
      lockProject={!!projectId} // Lock project selection if coming from project page
    />
  )
}
