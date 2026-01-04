'use client'

import { UnitDetailsPage } from "@/components/UnitDetailsPage"
import { use } from "react"

export default function UnitDetails({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = use(params)

  return <UnitDetailsPage unitId={unitId} />
}