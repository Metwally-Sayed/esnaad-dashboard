'use client';

import { OwnerCreatePage, OwnerFormData } from "@/components/OwnerCreatePage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function CreateOwner() {
  const router = useRouter();
  const { userRole } = useAuth();

  // Redirect non-admin users to users page
  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/users');
    }
  }, [userRole, router]);

  const handleCreate = (data: OwnerFormData) => {
    console.log('Creating owner with data:', data);

    // In a real app, this would make an API call
    // Example:
    // const response = await fetch('/api/owners', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });

    // For demo purposes, show success message and redirect
    alert(`Owner created successfully!\n\nName: ${data.firstName} ${data.familyName}\nEmail: ${data.email}\nStatus: ${data.status}`);
    router.push('/users');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/users');
    }
  };

  // Only render for admin users
  if (userRole !== 'admin') {
    return null;
  }

  return <OwnerCreatePage onCreate={handleCreate} onCancel={handleCancel} />;
}
