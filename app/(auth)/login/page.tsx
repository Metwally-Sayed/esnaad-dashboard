import { Metadata } from 'next'
import { LoginPage } from "./_components/LoginContent"

export const metadata: Metadata = {
  title: 'Login | Esnaad Dashboard',
  description: 'Login to your account',
}

export default function Login() {
  return <LoginPage />
}
