'use client'

import { useParams } from 'next/navigation'
import { ProjectDetailsPage } from '@/components/ProjectDetailsPage'

export default function Page() {
  const params = useParams()
  const projectId = params.id as string

  return <ProjectDetailsPage projectId={projectId} />
}