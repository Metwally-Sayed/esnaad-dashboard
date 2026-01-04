/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthHook } from '@/lib/hooks/use-auth'
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  VerifyOtpCredentials,
  ResendOtpCredentials,
} from '@/lib/types/auth.types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<any>
  verifyOtp: (credentials: VerifyOtpCredentials) => Promise<any>
  resendOtp: (credentials: ResendOtpCredentials) => Promise<any>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isOwner: boolean
  // Legacy support for existing components
  userRole: 'admin' | 'owner' | null
  setUserRole: (role: 'admin' | 'owner') => void
  // Convenience accessors
  userId?: string | null
  userName?: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()

  // Map new auth to legacy format for backward compatibility
  const userRole = auth.user ? (auth.isAdmin ? 'admin' : 'owner') : null

  // Legacy setUserRole - in production this would switch accounts or be removed
  const setUserRole = (role: 'admin' | 'owner') => {
    console.warn('setUserRole is deprecated. User role is determined by the backend.')
    // In a real app, this would either:
    // 1. Be removed entirely
    // 2. Trigger a logout and switch to a different account
    // 3. Be used only in development/demo mode
  }

  const value: AuthContextType = {
    ...auth,
    userRole,
    setUserRole,
    userId: auth.user?.id || null,
    userName: auth.user?.name || null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext