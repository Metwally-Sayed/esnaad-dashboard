import { Metadata } from 'next'
import { Suspense } from 'react'
import { CreateUnitWrapper } from './_components/CreateUnitWrapper'

export const metadata: Metadata = {
  title: 'Create Unit | Esnaad Dashboard',
  description: 'Create a new property unit',
}

export default function CreateUnitPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <CreateUnitWrapper />
    </Suspense>
  )
}
