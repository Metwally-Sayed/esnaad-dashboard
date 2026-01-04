'use client';

import { DashboardPage } from "@/components/DashboardPage";
import { OwnerDashboardPage } from "@/components/OwnerDashboardPage";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAdmin } = useAuth();

  return isAdmin ? <DashboardPage /> : <OwnerDashboardPage />;
}
