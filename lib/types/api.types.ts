/**
 * API Types for all modules
 * Aligned with backend Prisma models
 */

import { Role } from './auth.types'

// Re-export Role for convenience
export { Role }

// Unit Types
export interface Unit {
  id: string
  unitNumber: string
  unitType?: 'Apartment' | 'Villa' | 'Office' | 'Other' | null
  buildingName?: string | null
  address?: string | null
  floor?: number | null
  area?: number | null // square meters
  bedrooms?: number | null
  bathrooms?: number | null
  amenities?: string | null
  description?: string | null
  imageUrls: string[]
  documentUrls: string[]
  price?: number | null // Unit price for service charge calculation
  ownerId?: string | null
  owner?: UnitOwner | null
  projectId?: string | null
  project?: Project | null
  createdAt: string
  updatedAt: string
}

export interface UnitOwner {
  id: string
  email: string
  name: string | null
  role: Role
}

export interface CreateUnitDto {
  unitNumber: string
  unitType?: 'Apartment' | 'Villa' | 'Office' | 'Other'
  buildingName?: string
  address?: string
  floor?: number
  area?: number
  bedrooms?: number
  bathrooms?: number
  amenities?: string
  description?: string
  price?: number // Unit price for service charge calculation
  projectId?: string
  ownerId?: string
}

export interface UpdateUnitDto extends Partial<CreateUnitDto> {}

// Alias for Unit that includes commonly used derived properties
export interface UnitDetails extends Unit {
  unitCode: string // Alias for unitNumber for backwards compatibility
  building?: string | null // Alias for buildingName for backwards compatibility
  type: string // Alias for unitType, with default 'Unknown'
  price?: number | null // Price of the unit (if available)
}

export interface AssignOwnerDto {
  ownerId: string
}

export interface UnitFilters {
  page?: number
  limit?: number
  search?: string
  ownerId?: string
  projectId?: string
  sortBy?: 'unitNumber' | 'buildingName' | 'floor' | 'area' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// Project Types
export type ProjectStatus = 'active' | 'completed' | 'on-hold'

export interface Project {
  id: string
  name: string
  description?: string | null
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  status: ProjectStatus
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
  units?: Array<{
    id: string
    unitNumber: string
    buildingName?: string | null
    ownerId?: string | null
  }>
  _count?: {
    units: number
  }
}

export interface CreateProjectDto {
  name: string
  description?: string
  location?: string
  startDate?: string
  endDate?: string
  status?: ProjectStatus
  imageUrl?: string
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export interface ProjectFilters {
  page?: number
  limit?: number
  search?: string
  status?: ProjectStatus
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt' | 'status' | 'location'
  sortOrder?: 'asc' | 'desc'
}

export interface ProjectsResponse {
  data: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SingleProjectResponse {
  project: Project
  message?: string
}

// User Types
export interface UserDetails {
  id: string
  email: string
  name: string | null
  phone?: string | null
  address?: string | null
  nationalId?: string | null
  role: Role
  emailVerified: boolean
  isEmailVerified?: boolean // Alias for emailVerified
  isActive: boolean
  createdAt: string
  updatedAt: string
  unitsCount?: number
  externalClient?: {
    nationalityId?: string
    phoneNumber?: string
    address?: string
    city?: string
    country?: string
    nationality?: string
    dateOfBirth?: string
  }
  _count?: {
    ownedUnits: number
  }
}

export interface UpdateUserDto {
  name?: string
  phone?: string
  address?: string
  nationalId?: string
  role?: Role
  isActive?: boolean
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: Role
  isActive?: boolean
  emailVerified?: boolean
  sortBy?: 'email' | 'name' | 'role' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Audit Log Types
export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  UNIT_CREATED = 'UNIT_CREATED',
  UNIT_UPDATED = 'UNIT_UPDATED',
  UNIT_DELETED = 'UNIT_DELETED',
  UNIT_ASSIGNED = 'UNIT_ASSIGNED',
  UNIT_UNASSIGNED = 'UNIT_UNASSIGNED',
  OWNER_CHANGED = 'OWNER_CHANGED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED'
}

export interface AuditLog {
  id: string
  action: AuditAction
  entityType: string
  entityId: string
  actorId: string
  actor: {
    id: string
    email: string
    name: string | null
  }
  changes?: any // JSON object with before/after values
  metadata?: any // Additional context
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  entityType?: string
  entityId?: string
  actorId?: string
  action?: AuditAction
  startDate?: string
  endDate?: string
  sortBy?: 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalUnits: number
  availableUnits: number
  occupiedUnits: number
  maintenanceUnits: number
  totalUsers: number
  totalOwners: number
  totalAdmins: number
  totalProjects: number
  activeProjects: number
  recentActivities: AuditLog[]
}