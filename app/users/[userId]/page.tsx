'use client';

import { AdminUserProfilePage } from "@/components/AdminUserProfilePage";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function UserProfile({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const { userId } = use(params);
  const [userStatus, setUserStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleBack = () => {
    router.push('/users');
  };

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleToggleStatus = () => {
    // Toggle the status
    const newStatus = userStatus === 'Active' ? 'Inactive' : 'Active';
    setUserStatus(newStatus);

    // In a real app, this would update via API
    console.log(`User ${userId} status changed to:`, newStatus);

    // Show success message
    alert(`User has been ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
  };

  const handleViewUnit = (unitId: string) => {
    router.push(`/units/${unitId}`);
  };

  return (
    <AdminUserProfilePage
      onBack={handleBack}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onViewUnit={handleViewUnit}
    />
  );
}
