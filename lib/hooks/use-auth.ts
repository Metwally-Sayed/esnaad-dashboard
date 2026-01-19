/**
 * Authentication Hook
 * Manages user authentication state and operations
 */

'use client'

import { useState, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/navigation'
import authService from '@/lib/api/auth.service'
import { getTokens } from '@/lib/api/axios-config'
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  VerifyOtpCredentials,
  ResendOtpCredentials,
  Role,
  OwnerVerificationStatus,
} from '@/lib/types/auth.types'
import { fetcher } from './use-swr-config'

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we have tokens
  const { accessToken } = getTokens()

  // Fetch current user if we have a token
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
    mutate: mutateUser,
  } = useSWR<{ user: User }>(
    accessToken ? '/auth/me' : null,
    fetcher,
    {
      revalidateOnMount: true,
      shouldRetryOnError: false,
      onError: (err) => {
        // If we get a 401, the token is invalid
        if (err.statusCode === 401) {
          mutateUser(undefined, false)
        }
      },
    }
  )

  const user = userData?.user || null
  const isAuthenticated = !!user
  const isAdmin = user?.role === Role.ADMIN
  const isOwner = user?.role === Role.OWNER

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLoading(true)
        setError(null)

        const response = await authService.login(credentials)

        if (response.success) {
          // Update the user state
          await mutateUser({ user: response.data!.user }, false)

          // Determine redirect path based on role and verification status
          const user = response.data!.user
          let redirectPath = '/dashboard'

          if (user.role === Role.ADMIN) {
            redirectPath = '/dashboard'
          } else {
            // OWNER - check verification status
            switch (user.verificationStatus) {
              case OwnerVerificationStatus.PENDING_DOCUMENTS:
              case OwnerVerificationStatus.REJECTED:
                redirectPath = '/verify-documents'
                break
              case OwnerVerificationStatus.PENDING_APPROVAL:
                redirectPath = '/pending-approval'
                break
              case OwnerVerificationStatus.APPROVED:
              case OwnerVerificationStatus.NOT_REQUIRED:
                redirectPath = '/dashboard'
                break
              default:
                redirectPath = '/dashboard'
            }
          }

          // Use window.location for hard redirect to ensure cookies are synced
          window.location.href = redirectPath
        } else {
          throw new Error(response.error?.message || 'Login failed')
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Login failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [mutateUser]
  )

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authService.register(credentials)

      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error?.message || 'Registration failed')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Verify OTP function
  const verifyOtp = useCallback(
    async (credentials: VerifyOtpCredentials) => {
      try {
        setLoading(true)
        setError(null)

        const response = await authService.verifyOtp(credentials)

        if (response.success) {
          // Update the user state
          await mutateUser({ user: response.data!.user }, false)

          // Determine redirect path based on role and verification status
          const user = response.data!.user
          let redirectPath = '/dashboard'

          if (user.role === Role.ADMIN) {
            redirectPath = '/dashboard'
          } else {
            // OWNER - check verification status
            switch (user.verificationStatus) {
              case OwnerVerificationStatus.PENDING_DOCUMENTS:
              case OwnerVerificationStatus.REJECTED:
                redirectPath = '/verify-documents'
                break
              case OwnerVerificationStatus.PENDING_APPROVAL:
                redirectPath = '/pending-approval'
                break
              case OwnerVerificationStatus.APPROVED:
              case OwnerVerificationStatus.NOT_REQUIRED:
                redirectPath = '/dashboard'
                break
              default:
                redirectPath = '/dashboard'
            }
          }

          // Use window.location for hard redirect to ensure cookies are synced
          window.location.href = redirectPath

          return response.data
        } else {
          throw new Error(response.error?.message || 'OTP verification failed')
        }
      } catch (err: any) {
        const errorMessage = err.message || 'OTP verification failed'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [mutateUser]
  )

  // Resend OTP function
  const resendOtp = useCallback(async (credentials: ResendOtpCredentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authService.resendOtp(credentials)

      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error?.message || 'Failed to resend OTP')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resend OTP'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      await authService.logout()

      // Clear user state
      await mutateUser(undefined, false)

      // Clear all SWR cache
      await mutate(() => true, undefined, { revalidate: false })

      // Hard redirect to login to clear all state
      window.location.href = '/login'
    } catch (err: any) {
      // Even if logout fails, clear local state and redirect
      await mutateUser(undefined, false)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }, [mutateUser])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      setError(null)
      await mutateUser()
    } catch (err: any) {
      setError(err.message || 'Failed to refresh user data')
    }
  }, [mutateUser])

  return {
    user,
    loading: loading || userLoading,
    error: error || userError?.message || null,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    refreshUser,
    isAuthenticated,
    isAdmin,
    isOwner,
  }
}

export default useAuth