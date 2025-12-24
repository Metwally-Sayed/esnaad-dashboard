'use client';

import { UnitsPage } from "@/components/UnitsPage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Units() {
  const router = useRouter();
  const { userRole } = useAuth();

  const handleViewUnit = (unitId: string) => {
    router.push(`/units/${unitId}`);
  };

  const handleAddUnit = () => {
    router.push('/units/create');
  };

  return <UnitsPage onViewUnit={handleViewUnit} onAddUnit={handleAddUnit} userRole={userRole} />;
}
