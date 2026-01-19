import { Metadata } from 'next'
import { RegisterPage } from "./_components/RegisterContent"

export const metadata: Metadata = {
  title: 'Register | Esnaad Dashboard',
  description: 'Create a new account',
}

export default function Register() {
  return <RegisterPage />
}
