import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, Pencil } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  iqamaNumber: string;
  status: 'Active' | 'Pending' | 'Suspended';
  unitsOwned: number;
}

interface UsersTableProps {
  onViewUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
}

const users: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    iqamaNumber: '2345678901',
    status: 'Active',
    unitsOwned: 3,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    iqamaNumber: '2345678902',
    status: 'Active',
    unitsOwned: 2,
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    iqamaNumber: '2345678903',
    status: 'Pending',
    unitsOwned: 0,
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    iqamaNumber: '2345678904',
    status: 'Active',
    unitsOwned: 1,
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@email.com',
    iqamaNumber: '2345678905',
    status: 'Suspended',
    unitsOwned: 1,
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    iqamaNumber: '2345678906',
    status: 'Active',
    unitsOwned: 4,
  },
  {
    id: '7',
    name: 'James Martinez',
    email: 'james.m@email.com',
    iqamaNumber: '2345678907',
    status: 'Active',
    unitsOwned: 2,
  },
  {
    id: '8',
    name: 'Patricia Taylor',
    email: 'patricia.t@email.com',
    iqamaNumber: '2345678908',
    status: 'Pending',
    unitsOwned: 0,
  },
  {
    id: '9',
    name: 'Robert Thomas',
    email: 'robert.thomas@email.com',
    iqamaNumber: '2345678909',
    status: 'Active',
    unitsOwned: 1,
  },
  {
    id: '10',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@email.com',
    iqamaNumber: '2345678910',
    status: 'Active',
    unitsOwned: 2,
  },
];

export function UsersTable({ onViewUser, onEditUser }: UsersTableProps) {
  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Iqama Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Units Owned</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span>{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="font-mono text-sm">{user.iqamaNumber}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(user.status)}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-md bg-muted text-sm">
                  {user.unitsOwned}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewUser?.(user.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser?.(user.id)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
