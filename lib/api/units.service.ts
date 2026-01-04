/**
 * Units Service
 * API calls for unit management endpoints
 */

import api from './axios-config'
import {
  Unit,
  CreateUnitDto,
  UpdateUnitDto,
  AssignOwnerDto,
  UnitFilters
} from '@/lib/types/api.types'

interface UnitsResponse {
  data: Unit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface SingleUnitResponse {
  unit: Unit
  message?: string
}

class UnitsService {
  /**
   * Get all units with pagination and filtering
   * Accessible by both ADMIN and OWNER roles
   */
  async getUnits(filters?: UnitFilters): Promise<UnitsResponse> {
    const response = await api.get('/units', { params: filters })
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Get a single unit by ID
   * Accessible by both ADMIN and OWNER roles
   */
  async getUnit(id: string): Promise<SingleUnitResponse> {
    const response = await api.get(`/units/${id}`)
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Create a new unit
   * ADMIN only
   */
  async createUnit(data: CreateUnitDto): Promise<SingleUnitResponse> {
    const response = await api.post('/units', data)
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Update an existing unit
   * ADMIN only
   */
  async updateUnit(id: string, data: UpdateUnitDto): Promise<SingleUnitResponse> {
    const response = await api.put(`/units/${id}`, data)
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Delete a unit
   * ADMIN only
   */
  async deleteUnit(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/units/${id}`)
    return response.data
  }

  /**
   * Assign owner to a unit
   * ADMIN only
   */
  async assignOwner(id: string, data: AssignOwnerDto): Promise<SingleUnitResponse> {
    const response = await api.post(`/units/${id}/assign`, data)
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Remove owner from a unit
   * ADMIN only
   */
  async removeOwner(id: string): Promise<SingleUnitResponse> {
    const response = await api.post(`/units/${id}/unassign`)
    // Handle nested response structure
    return response.data.data || response.data
  }
}

export const unitsService = new UnitsService()
export default unitsService