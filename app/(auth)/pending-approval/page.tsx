import { Metadata } from 'next'
import { PendingApprovalContent } from './_components/PendingApprovalContent'

export const metadata: Metadata = {
  title: 'Pending Approval | Esnaad Dashboard',
  description: 'Your documents are under review',
}

export default function PendingApprovalPage() {
  return <PendingApprovalContent />
}
