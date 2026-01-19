'use client'

import { UserCreateContent } from "./UserCreateContent"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function UserCreateWrapper() {
  const router = useRouter()
  const { userRole } = useAuth()

  // Redirect non-admin users to users page
  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/users')
    }
  }, [userRole, router])

  // Only render for admin users
  if (userRole !== 'admin') {
    return null
  }

  // The UserCreateContent component now handles all the logic internally
  // including API calls and navigation
  return <UserCreateContent />
}
