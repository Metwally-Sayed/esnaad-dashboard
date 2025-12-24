import { UsersTable } from './UsersTable';
import { UsersFilters } from './UsersFilters';
import { Pagination } from './Pagination';
import { Button } from './ui/button';
import { UserPlus } from 'lucide-react';

interface UsersPageProps {
  onViewUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
  onAddUser?: () => void;
}

export function UsersPage({ onViewUser, onEditUser, onAddUser }: UsersPageProps) {
  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all users
          </p>
        </div>
        <Button onClick={onAddUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <UsersFilters />
      </div>

      {/* Users Table */}
      <div className="mb-6">
        <UsersTable onViewUser={onViewUser} onEditUser={onEditUser} />
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}
