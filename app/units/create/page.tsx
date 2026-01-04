'use client'

import { UnitCreatePage } from "@/components/UnitCreatePage"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CreateUnit() {
  const router = useRouter()
  const { isAdmin } = useAuth()

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

  return <UnitCreatePage />
}