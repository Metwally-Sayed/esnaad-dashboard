'use client';

import { UsersPage } from "@/components/UsersPage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Users() {
  const router = useRouter();
  const { userRole } = useAuth();

  // If owner, redirect to their profile page
  useEffect(() => {
    if (userRole === 'owner') {
      router.push('/users/me');
    }
  }, [userRole, router]);

  // Only render users page for admins
  if (userRole !== 'admin') {
    return null;
  }

  return <UsersPage />;
}
