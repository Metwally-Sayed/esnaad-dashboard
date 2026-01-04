import { StatsCard } from './StatsCard';
import { PropertiesTable } from './PropertiesTable';
import { RecentActivityCard } from './RecentActivityCard';
import { Building2, Home, Users, DollarSign } from 'lucide-react';
import { Button } from './ui/button';

export function DashboardPage() {
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
        <Button className="w-full sm:w-auto">Add Property</Button>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Total Properties"
          value="24"
          change="+2 this month"
          changeType="positive"
          icon={Building2}
        />
        <StatsCard
          title="Total Units"
          value="448"
          change="+12 this month"
          changeType="positive"
          icon={Home}
        />
        <StatsCard
          title="Occupancy Rate"
          value="94.2%"
          change="+2.1% from last month"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Monthly Revenue"
          value="$892,400"
          change="+8.3% from last month"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Properties Section - Responsive */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">Properties Overview</h2>
          <Button variant="outline" className="w-full sm:w-auto">View All</Button>
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
