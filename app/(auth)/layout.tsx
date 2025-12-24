import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Esnaad Dashboard",
  description: "Sign in to your property management account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
