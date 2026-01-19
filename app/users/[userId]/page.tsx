import { Metadata } from 'next'
import { UserDetailWrapper } from './_components/UserDetailWrapper'

export const metadata: Metadata = {
  title: 'User Details | Esnaad Dashboard',
  description: 'View user profile and details',
}

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params
  return <UserDetailWrapper userId={userId} />
}
