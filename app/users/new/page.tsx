import { Metadata } from 'next'
import { UserCreateWrapper } from './_components/UserCreateWrapper'

export const metadata: Metadata = {
  title: 'Create User | Esnaad Dashboard',
  description: 'Create a new property owner',
}

export default function UserCreatePage() {
  return <UserCreateWrapper />
}
