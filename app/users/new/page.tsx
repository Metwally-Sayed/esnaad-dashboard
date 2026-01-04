'use client';

import { OwnerCreatePage } from "@/components/OwnerCreatePage";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewUser() {
  const router = useRouter();
  const { userRole } = useAuth();

  // Redirect non-admin users to users page
  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/users');
    }
  }, [userRole, router]);

  // Only render for admin users
  if (userRole !== 'admin') {
    return null;
  }

  // The OwnerCreatePage component now handles all the logic internally
  // including API calls and navigation
  return <OwnerCreatePage />;
}