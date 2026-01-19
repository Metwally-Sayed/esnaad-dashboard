import api from './axios-config'
import {
  ProjectServiceChargeListResponse,
  ProjectServiceChargeResponse,
  UnitServiceChargeListResponse,
  UnitServiceChargeResponse,
  DownloadUrlResponse,
  CreateProjectServiceChargeDto,
  UpdateProjectServiceChargeDto,
  OverrideUnitServiceChargeDto,
  ProjectServiceChargeFilters,
  UnitServiceChargeFilters,
} from '../types/service-charge.types'

class ServiceChargeService {
  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Get all project service charges (Admin only)
   */
  async getAllProjectServiceCharges(
    filters?: ProjectServiceChargeFilters
  ): Promise<ProjectServiceChargeListResponse> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.year) params.append('year', filters.year.toString())
    if (filters?.periodType) params.append('periodType', filters.periodType)

    const queryString = params.toString()
    const url = queryString
      ? `/admin/service-charges?${queryString}`
      : '/admin/service-charges'

    const response = await api.get(url)
    return response.data
  }

  /**
   * Get project service charge by ID (Admin only)
   */
  async getProjectServiceChargeById(id: string): Promise<ProjectServiceChargeResponse> {
    const response = await api.get(`/admin/service-charges/${id}`)
    return response.data
  }

  /**
   * Create project service charge (Admin only)
   */
  async createProjectServiceCharge(
    data: CreateProjectServiceChargeDto
  ): Promise<ProjectServiceChargeResponse> {
    const response = await api.post('/admin/service-charges', data)
    return response.data
  }

  /**
   * Update project service charge (Admin only)
   */
  async updateProjectServiceCharge(
    id: string,
    data: UpdateProjectServiceChargeDto
  ): Promise<ProjectServiceChargeResponse> {
    const response = await api.patch(`/admin/service-charges/${id}`, data)
    return response.data
  }

  /**
   * Delete project service charge (Admin only)
   */
  async deleteProjectServiceCharge(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/admin/service-charges/${id}`)
    return response.data
  }

  /**
   * Get unit service charges for a project service charge (Admin only)
   */
  async getUnitServiceCharges(
    projectServiceChargeId: string,
    filters?: { page?: number; limit?: number }
  ): Promise<UnitServiceChargeListResponse> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = queryString
      ? `/admin/service-charges/${projectServiceChargeId}/units?${queryString}`
      : `/admin/service-charges/${projectServiceChargeId}/units`

    const response = await api.get(url)
    return response.data
  }

  /**
   * Override unit service charge amount (Admin only)
   */
  async overrideUnitServiceCharge(
    id: string,
    data: OverrideUnitServiceChargeDto
  ): Promise<UnitServiceChargeResponse> {
    const response = await api.patch(`/admin/unit-service-charges/${id}`, data)
    return response.data
  }

  /**
   * Generate PDF statement for unit service charge (Admin only)
   */
  async generatePdfStatement(id: string): Promise<DownloadUrlResponse> {
    const response = await api.post(`/admin/unit-service-charges/${id}/generate-pdf`, {})
    return response.data
  }

  // ============================================
  // OWNER ENDPOINTS
  // ============================================

  /**
   * Get service charges for owned units (Owner only)
   */
  async getOwnerServiceCharges(
    filters?: UnitServiceChargeFilters
  ): Promise<UnitServiceChargeListResponse> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.year) params.append('year', filters.year.toString())
    if (filters?.periodType) params.append('periodType', filters.periodType)

    const queryString = params.toString()
    const url = queryString ? `/service-charges?${queryString}` : '/service-charges'

    const response = await api.get(url)
    return response.data
  }

  /**
   * Download PDF statement (Owner can download their own)
   */
  async downloadPdfStatement(id: string): Promise<DownloadUrlResponse> {
    const response = await api.get(`/service-charges/${id}/download`)
    return response.data
  }
}

const serviceChargeService = new ServiceChargeService()
export default serviceChargeService
