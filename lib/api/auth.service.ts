/**
 * Authentication Service
 * API calls for authentication endpoints
 */

import api, { setTokens, clearTokens } from './axios-config'
import {
  LoginCredentials,
  RegisterCredentials,
  VerifyOtpCredentials,
  ResendOtpCredentials,
  AuthResponse,
  ApiResponse,
  User,
  OtpPurpose,
} from '@/lib/types/auth.types'

class AuthService {
  /**
   * Register a new user
   * Email must exist in external_clients table
   */
  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; message: string }>> {
    const response = await api.post('/auth/register', credentials)
    return response.data
  }

  /**
   * Verify OTP for email verification
   * Returns tokens upon successful verification
   */
  async verifyOtp(credentials: VerifyOtpCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/verify-otp', credentials)

    if (response.data.success && response.data.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens
      setTokens(accessToken, refreshToken)
    }

    return response.data
  }

  /**
   * Resend OTP for email verification
   */
  async resendOtp(credentials: ResendOtpCredentials): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      email: credentials.email,
      purpose: credentials.purpose || OtpPurpose.REGISTRATION,
    }

    const response = await api.post('/auth/resend-otp', payload)
    return response.data
  }

  /**
   * Login with email and password
   * Returns tokens upon successful login
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/login', credentials)

    if (response.data.success && response.data.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens
      setTokens(accessToken, refreshToken)
    }

    return response.data
  }

  /**
   * Logout user
   * Clears tokens from cookies
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } finally {
      // Always clear tokens, even if the API call fails
      clearTokens()
    }
  }

  /**
   * Get current user information
   * Requires valid access token
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await api.get('/auth/me')
    return response.data
  }

  /**
   * Refresh access token using refresh token
   * This is handled automatically by axios interceptor
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/refresh', { refreshToken })

    if (response.data.success && response.data.data?.tokens) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens
      setTokens(accessToken, newRefreshToken)
    }

    return response.data
  }

  /**
   * Validate password strength
   * Client-side validation matching backend requirements
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate OTP format
   */
  validateOtp(otp: string): boolean {
    return /^\d{6}$/.test(otp)
  }
}

export const authService = new AuthService()
export default authService