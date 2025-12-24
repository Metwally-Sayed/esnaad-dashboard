'use client';

import { UnitCreatePage, UnitFormData } from "@/components/UnitCreatePage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function CreateUnit() {
  const router = useRouter();
  const { userRole } = useAuth();

  // Redirect non-admin users to units page
  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/units');
    }
  }, [userRole, router]);

  const handleCreate = (data: UnitFormData) => {
    console.log('Creating unit with data:', data);

    // In a real app, this would make an API call
    // Example:
    // const response = await fetch('/api/units', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });

    // For demo purposes, show success message and redirect
    alert(`Unit created successfully!\n\nUnit Code: ${data.unitCode}\nType: ${data.unitType}\nBuilding: ${data.buildingName}\nSize: ${data.size} sqm`);
    router.push('/units');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/units');
    }
  };

  // Only render for admin users
  if (userRole !== 'admin') {
    return null;
  }

  return <UnitCreatePage onCreate={handleCreate} onCancel={handleCancel} />;
}
