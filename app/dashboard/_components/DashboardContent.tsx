'use client';

import { StatsCard } from '@/components/StatsCard';
import { PropertiesTable } from '@/components/PropertiesTable';
import { RecentActivityCard } from '@/components/RecentActivityCard';
import { Building2, Home, Users, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/lib/hooks/use-projects';
import { useUnits } from '@/lib/hooks/use-units';
import { useUsers } from '@/lib/hooks/use-users';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardContent() {
  // Fetch data from backend
  const router = useRouter();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { units, isLoading: isLoadingUnits } = useUnits();
  const { users, isLoading: isLoadingUsers } = useUsers({ role: 'OWNER' });

  // Calculate statistics from real data
  const stats = useMemo(() => {
    if (isLoadingProjects || isLoadingUnits || isLoadingUsers) {
      return {
        totalProjects: 0,
        totalUnits: 0,
        totalOwners: 0,
        occupancyRate: '0%',
      };
    }

    const totalProjects = projects?.length || 0;
    const totalUnits = units?.length || 0;
    const totalOwners = users?.length || 0;

    // Calculate occupancy (units with owners / total units)
    const unitsWithOwners = units?.filter(unit => unit.ownerId).length || 0;
    const occupancyRate = totalUnits > 0
      ? ((unitsWithOwners / totalUnits) * 100).toFixed(1)
      : '0';

    return {
      totalProjects,
      totalUnits,
      totalOwners,
      occupancyRate: `${occupancyRate}%`,
    };
  }, [projects, units, users, isLoadingProjects, isLoadingUnits, isLoadingUsers]);

  const isLoading = isLoadingProjects || isLoadingUnits || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your properties.
          </p>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Total Projects"
          value={stats.totalProjects.toString()}
          change="Active projects"
          changeType="neutral"
          icon={Building2}
        />
        <StatsCard
          title="Total Units"
          value={stats.totalUnits.toString()}
          change="Property units"
          changeType="neutral"
          icon={Home}
        />
        <StatsCard
          title="Occupancy Rate"
          value={stats.occupancyRate}
          change="Units with owners"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Total Owners"
          value={stats.totalOwners.toString()}
          change="Registered owners"
          changeType="neutral"
          icon={DollarSign}
        />
      </div>

      {/* Properties Section - Responsive */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">Properties Overview</h2>
          <Button onClick={() => router.push('/projects')} variant="outline" className="w-full sm:w-auto">View All</Button>
        </div>
        <PropertiesTable />
      </div>

      {/* Recent Activity - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
        <div className="lg:col-span-2">
          {/* Placeholder for future charts or content */}
          <div className="rounded-lg border border-border bg-card p-4 md:p-6 h-[300px] md:h-[350px] lg:h-[400px] flex items-center justify-center">
            <p className="text-sm md:text-base text-muted-foreground">Analytics Chart Placeholder</p>
          </div>
        </div>
        <div>
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
