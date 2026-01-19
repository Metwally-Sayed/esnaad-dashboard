import { Metadata } from 'next'
import { AuditLogsPage } from './_components/AuditLogsContent'

export const metadata: Metadata = {
  title: 'Audit Logs | Esnaad Dashboard',
  description: 'View system audit logs',
}

export default function AuditLogsRoute() {
  return <AuditLogsPage />
}
