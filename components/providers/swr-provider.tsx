/**
 * SWR Provider
 * Wraps the application with SWR configuration
 */

'use client'

import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/hooks/use-swr-config'

interface SWRProviderProps {
  children: React.ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}

export default SWRProvider