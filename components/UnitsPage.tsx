import { UnitsTable } from './UnitsTable';
import { UnitsFilters } from './UnitsFilters';
import { Pagination } from './Pagination';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface UnitsPageProps {
  onViewUnit?: (unitId: string) => void;
  onAddUnit?: () => void;
  userRole?: 'admin' | 'owner';
}

export function UnitsPage({ onViewUnit, onAddUnit, userRole = 'admin' }: UnitsPageProps) {
  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Units</h1>
          <p className="text-muted-foreground mt-1">
            {userRole === 'admin' ? 'Manage and view all property units' : 'View your property units'}
          </p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={onAddUnit}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <UnitsFilters />
      </div>

      {/* Units Table */}
      <div className="mb-6">
        <UnitsTable onViewUnit={onViewUnit} userRole={userRole} />
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}