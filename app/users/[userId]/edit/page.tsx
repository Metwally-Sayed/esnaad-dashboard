import { Metadata } from 'next'
import { UserEditWrapper } from './_components/UserEditWrapper'

export const metadata: Metadata = {
  title: 'Edit User | Esnaad Dashboard',
  description: 'Edit user details',
}

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserEditPage({ params }: Props) {
  const { userId } = await params
  return <UserEditWrapper userId={userId} />
}
