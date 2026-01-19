import { Metadata } from 'next'
import { ServiceChargeContent } from './_components/ServiceChargeContent'

export const metadata: Metadata = {
  title: 'Service Charges | Esnaad Dashboard',
  description: 'View your unit service charges and download statements',
}

export default function ServiceChargePage() {
  return <ServiceChargeContent />
}
