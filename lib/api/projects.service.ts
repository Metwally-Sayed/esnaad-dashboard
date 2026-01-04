/**
 * Projects Service
 * API calls for project management endpoints
 */

import api from './axios-config'
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilters,
  ProjectsResponse,
  SingleProjectResponse,
} from '@/lib/types/api.types'

class ProjectsService {
  /**
   * Get all projects with pagination and filtering
   * Accessible by both ADMIN and OWNER roles
   */
  async getProjects(filters?: ProjectFilters): Promise<ProjectsResponse> {
    const response = await api.get('/projects', { params: filters })
    // The API returns { success: true, data: { data: [...], pagination: {...} } }
    return response.data.data || response.data
  }

  /**
   * Get a single project by ID
   * Accessible by both ADMIN and OWNER roles
   */
  async getProject(id: string): Promise<SingleProjectResponse> {
    const response = await api.get(`/projects/${id}`)
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Create a new project
   * ADMIN only
   */
  async createProject(data: CreateProjectDto): Promise<SingleProjectResponse> {
    const response = await api.post('/projects', data)
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Update an existing project
   * ADMIN only
   */
  async updateProject(id: string, data: UpdateProjectDto): Promise<SingleProjectResponse> {
    const response = await api.patch(`/projects/${id}`, data)
    // Handle nested response structure
    return response.data.data || response.data
  }

  /**
   * Delete a project
   * ADMIN only
   */
  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  }
}

export const projectsService = new ProjectsService()
export default projectsService