import { Metadata } from 'next'
import { ProjectsContent } from './_components/ProjectsContent'

export const metadata: Metadata = {
  title: 'Projects | Esnaad Dashboard',
  description: 'Manage and monitor all property projects',
}

export default function ProjectsPage() {
  return <ProjectsContent />
}
