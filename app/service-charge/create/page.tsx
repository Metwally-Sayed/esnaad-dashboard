import { Metadata } from 'next'
import { CreateServiceChargeContent } from './_components/CreateServiceChargeContent'

export const metadata: Metadata = {
  title: 'Create Service Charge | Esnaad Admin',
  description: 'Create a new project service charge',
}

export default function CreateServiceChargePage() {
  return <CreateServiceChargeContent />
}
