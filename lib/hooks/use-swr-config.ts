/**
 * SWR Configuration
 * Global configuration for SWR data fetching
 */

import { SWRConfiguration } from 'swr'
import api from '@/lib/api/axios-config'

export const fetcher = async (url: string) => {
  const response = await api.get(url)
  return response.data.data
}

export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: 2000,
  onError: (error, key) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`SWR Error for ${key}:`, error)
    }
  },
}

export default swrConfig