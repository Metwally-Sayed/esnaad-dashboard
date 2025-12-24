'use client';

import { UnitProfilePage } from "@/components/UnitProfilePage";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function UnitProfile({ params }: { params: Promise<{ unitId: string }> }) {
  const router = useRouter();
  const { unitId } = use(params);
  const { userRole } = useAuth();

  const handleBack = () => {
    router.push('/units');
  };

  const handleEdit = () => {
    router.push(`/units/${unitId}/edit`);
  };

  return <UnitProfilePage onBack={handleBack} onEdit={userRole === 'admin' ? handleEdit : undefined} />;
}
