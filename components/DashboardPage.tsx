import { StatsCard } from './StatsCard';
import { PropertiesTable } from './PropertiesTable';
import { RecentActivityCard } from './RecentActivityCard';
import { Building2, Home, Users, DollarSign } from 'lucide-react';
import { Button } from './ui/button';

export function DashboardPage() {
  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your properties.
          </p>
        </div>
        <Button>Add Property</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
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

      {/* Properties Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2>Properties Overview</h2>
          <Button variant="outline">View All</Button>
        </div>
        <PropertiesTable />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {/* Placeholder for future charts or content */}
          <div className="rounded-lg border border-border bg-card p-6 h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Analytics Chart Placeholder</p>
          </div>
        </div>
        <div>
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
