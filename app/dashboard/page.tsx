'use client';

import dynamic from 'next/dynamic';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

// Lazy load dashboard components based on role
const DashboardPage = dynamic(() => import('@/components/DashboardPage').then(mod => ({ default: mod.DashboardPage })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

const OwnerDashboardPage = dynamic(() => import('@/components/OwnerDashboardPage').then(mod => ({ default: mod.OwnerDashboardPage })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

export default function Dashboard() {
  const { isAdmin } = useAuth();

  return isAdmin ? <DashboardPage /> : <OwnerDashboardPage />;
}