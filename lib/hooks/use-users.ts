/**
 * Users Hooks
 * Hooks for fetching and managing users data
 */

'use client'

import useSWR from 'swr'
import { UserDetails } from '@/lib/types/api.types'
import { fetchUsers, fetchUserById, updateUser, deleteUser } from '@/lib/api/users.service'
import { useState } from 'react'
import { mutate } from 'swr'

interface UserFilters {
  role?: 'ADMIN' | 'OWNER'
  limit?: number
  page?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  enabled?: boolean // Add enabled flag to conditionally fetch
}

/**
 * Hook to fetch users list with real API data
 */
export function useUsers(filters?: UserFilters) {
  // Check if fetching should be enabled (default to true for backward compatibility)
  const shouldFetch = filters?.enabled !== false

  const queryParams = new URLSearchParams()
  if (filters?.role) queryParams.append('role', filters.role)
  if (filters?.limit) queryParams.append('limit', filters.limit.toString())
  if (filters?.page) queryParams.append('page', filters.page.toString())
  if (filters?.search) queryParams.append('search', filters.search)
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder)

  const queryString = queryParams.toString()
  const cacheKey = `/api/users${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading } = useSWR(
    shouldFetch ? cacheKey : null, // Only fetch if enabled
    () => fetchUsers(filters || {}),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  )

  return {
    users: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate: () => mutate(cacheKey),
  }
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(userId: string | null) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/users/${userId}` : null,
    () => userId ? fetchUserById(userId) : null,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    user: data,
    isLoading,
    error,
    mutate: () => userId && mutate(`/api/users/${userId}`),
  }
}

/**
 * Hook for user mutations (update, delete)
 */
export function useUserMutations() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const updateUserData = async (userId: string, data: any) => {
    setIsUpdating(true)
    try {
      const updatedUser = await updateUser(userId, data)
      // Invalidate the cache for both the user list and the specific user
      await mutate('/api/users')
      await mutate(`/api/users/${userId}`)
      return updatedUser
    } catch (error) {
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteUserData = async (userId: string) => {
    setIsDeleting(true)
    try {
      await deleteUser(userId)
      // Invalidate the cache for the user list
      await mutate('/api/users')
    } catch (error) {
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    updateUser: updateUserData,
    deleteUser: deleteUserData,
    isUpdating,
    isDeleting,
  }
}