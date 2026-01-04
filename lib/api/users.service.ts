/**
 * Users Service
 * API calls for user management
 */

import api from './axios-config'
import { ApiResponse, PaginatedResponse } from '@/lib/types/auth.types'
import { UserDetails } from '@/lib/types/api.types'

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: 'ADMIN' | 'OWNER'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UpdateUserDto {
  name?: string
  phone?: string
  address?: string
  nationalId?: string
  role?: 'ADMIN' | 'OWNER'
  isActive?: boolean
}

/**
 * Fetch paginated list of users
 */
export const fetchUsers = async (filters: UserFilters = {}): Promise<PaginatedResponse<UserDetails>> => {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.role) params.append('role', filters.role)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get<ApiResponse<PaginatedResponse<UserDetails>>>(`/users?${params.toString()}`)
  return response.data.data!!
}

/**
 * Fetch a single user by ID
 */
export const fetchUserById = async (userId: string): Promise<UserDetails> => {
  const response = await api.get<ApiResponse<{ user: UserDetails }>>(`/users/${userId}`)
  return response.data.data?.user!!
}

/**
 * Update user details
 */
export const updateUser = async (userId: string, data: UpdateUserDto): Promise<UserDetails> => {
  const response = await api.put<ApiResponse<{ user: UserDetails }>>(`/users/${userId}`, data)
  return response.data.data?.user!
}

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`)
}

/**
 * Get current user profile
 */
export const fetchCurrentUser = async (): Promise<UserDetails> => {
  const response = await api.get<ApiResponse<UserDetails>>('/auth/me')
  return response.data.data!
}