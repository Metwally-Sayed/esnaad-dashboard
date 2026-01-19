import { Metadata } from 'next'
import { ProjectDetail } from './_components/ProjectDetail'

export const metadata: Metadata = {
  title: 'Project Details | Esnaad Dashboard',
  description: 'View project details, units, and history',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  return <ProjectDetail projectId={id} />
}
