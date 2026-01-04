'use client';

import { UnitEditPage, UnitFormData } from "@/components/UnitEditPage";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function UnitEdit({ params }: { params: Promise<{ unitId: string }> }) {
  const router = useRouter();
  const { unitId } = use(params);
  const { userRole } = useAuth();

  // Redirect owners to view page (no edit access)
  useEffect(() => {
    if (userRole === 'owner') {
      router.push(`/units/${unitId}`);
    }
  }, [userRole, unitId, router]);

  // Mock initial data - in real app, fetch from API based on unitId
  const initialData: UnitFormData = {
    id: unitId,
    unitCode: 'A-101',
    unitType: 'Apartment',
    buildingName: 'Riverside Apartments',
    address: '123 River Street, Downtown District\nRiyadh 12345, Saudi Arabia',
    floor: '1st Floor',
    size: '120.5',
    ownerId: '1',
    ownerName: 'Ahmed Al-Rashid',
    bedrooms: '2',
    bathrooms: '2',
    amenities: 'Parking, Balcony, Pool Access, Gym, 24/7 Security',
    createdAt: 'Dec 15, 2024',
    lastUpdated: 'Dec 20, 2024',
  };

  const handleBack = () => {
    router.push('/units');
  };

  const handleSave = (data: UnitFormData) => {
    console.log('Saving unit data:', data);

    // In a real app, this would make an API call
    // Example:
    // const response = await fetch(`/api/units/${unitId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });

    // For demo purposes, show success message and redirect
    alert(`Unit updated successfully!\n\nUnit Code: ${data.unitCode}\nType: ${data.unitType}${data.ownerName ? `\nOwner: ${data.ownerName}` : ''}`);
    router.push(`/units/${unitId}`);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push(`/units/${unitId}`);
    }
  };

  // Only render edit page for admins
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <UnitEditPage
      initialData={initialData}
      onBack={handleBack}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
