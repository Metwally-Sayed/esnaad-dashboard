'use client';

import { OwnerEditPage, OwnerFormData, OwnedUnit } from "@/components/OwnerEditPage";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function EditOwner({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const { userId } = use(params);
  const { userRole } = useAuth();

  // Redirect non-admin users to users page
  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/users');
    }
  }, [userRole, router]);

  // Mock initial data - in real app, fetch from API based on userId
  const initialData: OwnerFormData = {
    id: userId,
    firstName: 'Ahmed',
    familyName: 'Al-Rashid',
    email: 'ahmed.rashid@email.com',
    iqamaNumber: '2345678903',
    phoneNumber: '+966 50 123 4567',
    status: 'Active',
    createdAt: 'Dec 15, 2024',
    lastUpdated: 'Dec 20, 2024',
  };

  // Mock owned units - in real app, fetch from API
  const ownedUnits: OwnedUnit[] = [
    { id: '1', unitCode: 'A-101', type: 'Studio', building: 'Riverside Apartments', status: 'Occupied' },
    { id: '2', unitCode: 'B-205', type: '2 Bedroom', building: 'Garden Tower', status: 'Vacant' },
    { id: '3', unitCode: 'C-312', type: '1 Bedroom', building: 'Skyline Plaza', status: 'Occupied' },
  ];

  const handleBack = () => {
    router.push('/users');
  };

  const handleSave = (data: OwnerFormData) => {
    console.log('Saving owner data:', data);

    // In a real app, this would make an API call
    // Example:
    // const response = await fetch(`/api/owners/${userId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });

    // For demo purposes, show success message and redirect
    alert(`Owner updated successfully!\n\nName: ${data.firstName} ${data.familyName}\nEmail: ${data.email}\nStatus: ${data.status}`);
    router.push(`/users/${userId}`);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push(`/users/${userId}`);
    }
  };

  const handleDeactivate = () => {
    console.log('Deactivating owner:', userId);

    // In a real app, this would make an API call
    alert(`Owner account has been deactivated.\n\nThe owner will no longer have access to the system.`);
    router.push('/users');
  };

  // Only render for admin users
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <OwnerEditPage
      initialData={initialData}
      ownedUnits={ownedUnits}
      onBack={handleBack}
      onSave={handleSave}
      onCancel={handleCancel}
      onDeactivate={handleDeactivate}
    />
  );
}
