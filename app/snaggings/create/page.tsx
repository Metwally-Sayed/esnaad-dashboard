import { Metadata } from 'next'
import { CreateSnaggingWrapper } from './_components/CreateSnaggingWrapper'

export const metadata: Metadata = {
  title: 'Create Snagging Report | Esnaad Dashboard',
  description: 'Create a new snagging inspection report',
}

export default function CreateSnaggingPage() {
  return <CreateSnaggingWrapper />
}
