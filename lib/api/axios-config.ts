/**
 * Axios Configuration
 * Handles API requests with interceptors for auth and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { ApiResponse } from '@/lib/types/auth.types'

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

// Create axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(ACCESS_TOKEN_KEY)

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Successful response
    return response
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY)

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens

          // Save new tokens
          setTokens(accessToken, newRefreshToken)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }

          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokens()

          // Only redirect if we're in the browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }

          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, clear everything and redirect to login
        clearTokens()

        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    // Format error message
    let errorMessage = 'An unexpected error occurred'

    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message
    } else if (error.message) {
      errorMessage = error.message
    }

    // Create a more user-friendly error
    const formattedError = {
      message: errorMessage,
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.error?.errors || null,
      originalError: error,
    }

    return Promise.reject(formattedError)
  }
)

// Token management functions
export const setTokens = (accessToken: string, refreshToken: string) => {
  // Set cookies with appropriate options
  const isProduction = process.env.NODE_ENV === 'production'

  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: 7, // 7 days
    secure: isProduction, // Use secure cookies in production
    sameSite: 'lax',
    path: '/',
  })

  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: 30, // 30 days
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  })
}

export const getTokens = () => {
  return {
    accessToken: Cookies.get(ACCESS_TOKEN_KEY),
    refreshToken: Cookies.get(REFRESH_TOKEN_KEY),
  }
}

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' })
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' })
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch {
    return true // If we can't parse the token, consider it expired
  }
}

export default api