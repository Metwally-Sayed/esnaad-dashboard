import { Metadata } from 'next'
import { UsersWrapper } from './_components/UsersWrapper'

export const metadata: Metadata = {
  title: 'Users | Esnaad Dashboard',
  description: 'Manage system users',
}

export default function UsersPage() {
  return <UsersWrapper />
}
