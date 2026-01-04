'use client'

import { use } from 'react'
import { SnaggingThread } from '@/components/snagging/SnaggingThread'

export default function SnaggingThreadPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return <SnaggingThread snaggingId={id} />
}