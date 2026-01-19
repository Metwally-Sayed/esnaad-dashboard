/**
 * Authentication Types
 * Aligned with backend API contract
 */

export enum Role {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export enum OtpPurpose {
  REGISTRATION = 'REGISTRATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION'
}

export enum OwnerVerificationStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING_DOCUMENTS = 'PENDING_DOCUMENTS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string
  email: string
  name: string | null
  role: Role
  emailVerified: boolean
  isActive?: boolean
  verificationStatus?: OwnerVerificationStatus
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

export interface VerifyOtpCredentials {
  email: string
  otp: string
}

export interface ResendOtpCredentials {
  email: string
  purpose?: OtpPurpose
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    message: string
    statusCode: number
    errors?: Array<{
      path: string
      message: string
    }>
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  verifyOtp: (credentials: VerifyOtpCredentials) => Promise<void>
  resendOtp: (credentials: ResendOtpCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isOwner: boolean
}