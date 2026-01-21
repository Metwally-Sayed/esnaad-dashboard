/**
 * Service Charge Types
 * Aligned with backend Prisma models
 */

export type ServiceChargePeriodType = 'YEARLY' | 'QUARTERLY'

// Project Service Charge
export interface ProjectServiceCharge {
  id: string
  projectId: string
  year: number
  quarter: number | null
  periodType: ServiceChargePeriodType
  percentage: number | null // Nullable for per-unit charges
  dueDate: string | null
  createdAt: string
  updatedAt: string
  createdById: string
  project?: {
    id: string
    name: string
    location?: string | null
  }
  createdBy?: {
    id: string
    email: string
    name: string | null
  }
  unitCharges?: Array<{
    id: string
    unitId: string
    amount: number
    isOverridden: boolean
    overriddenAmount: number | null
    unit: {
      id: string
      unitNumber: string
      buildingName: string | null
      owner: {
        id: string
        email: string
        name: string | null
      } | null
    }
  }>
  _count?: {
    unitCharges: number
  }
}

// Unit Service Charge
export interface UnitServiceCharge {
  id: string
  unitId: string
  projectServiceChargeId: string
  amount: number
  isOverridden: boolean
  overriddenAmount: number | null
  overriddenById: string | null
  overriddenAt: string | null
  pdfUrl: string | null
  pdfGeneratedAt: string | null
  isPaid: boolean
  paidAt: string | null
  createdAt: string
  updatedAt: string
  unit?: {
    id: string
    unitNumber: string
    buildingName: string | null
    price: number | null
    owner?: {
      id: string
      email: string
      name: string | null
    } | null
  }
  projectServiceCharge?: {
    id: string
    year: number
    quarter: number | null
    periodType: ServiceChargePeriodType
    percentage: number | null // Nullable for per-unit charges
    dueDate: string | null
    project?: {
      id: string
      name: string
      location?: string | null
    }
  }
  overriddenBy?: {
    id: string
    email: string
    name: string | null
  } | null
}

// DTOs for creating/updating
export interface UnitChargeInput {
  unitId: string
  amount: number
}

export interface CreateProjectServiceChargeDto {
  projectId: string
  year: number
  quarter?: number
  periodType: ServiceChargePeriodType
  // Either percentage (old method) or unitCharges (new method)
  percentage?: number
  unitCharges?: UnitChargeInput[]
  dueDate?: string
}

export interface UpdateProjectServiceChargeDto {
  percentage?: number
  dueDate?: string
}

export interface OverrideUnitServiceChargeDto {
  overriddenAmount: number
}

// Unit for service charge selection
export interface UnitForServiceCharge {
  id: string
  unitNumber: string
  buildingName: string | null
  floor: number | null
  area: number | null
  price: number | null
  projectId: string | null
  project: {
    id: string
    name: string
    location: string | null
  } | null
  owner: {
    id: string
    email: string
    name: string | null
  } | null
}

// Filters
export interface ProjectServiceChargeFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  projectId?: string
  year?: number
  periodType?: ServiceChargePeriodType
}

export interface UnitServiceChargeFilters {
  page?: number
  limit?: number
  year?: number
  periodType?: ServiceChargePeriodType
}

// API Responses
export interface ProjectServiceChargeListResponse {
  success: boolean
  data: ProjectServiceCharge[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ProjectServiceChargeResponse {
  success: boolean
  data: ProjectServiceCharge
  message?: string
}

export interface UnitServiceChargeListResponse {
  success: boolean
  data: UnitServiceCharge[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface UnitServiceChargeResponse {
  success: boolean
  data: UnitServiceCharge
  message?: string
}

export interface DownloadUrlResponse {
  success: boolean
  data: {
    url: string
  }
}

export interface UnitsForProjectResponse {
  success: boolean
  data: UnitForServiceCharge[]
}
