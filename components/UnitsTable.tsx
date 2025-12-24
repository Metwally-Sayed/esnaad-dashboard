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

interface Unit {
  id: string;
  unitCode: string;
  type: string;
  building: string;
  status: 'Owned' | 'Not Owned';
  owner: string;
  lastUpdated: string;
}

interface UnitsTableProps {
  onViewUnit?: (unitId: string) => void;
  userRole?: 'admin' | 'owner';
}

const units: Unit[] = [
  {
    id: '1',
    unitCode: 'A-101',
    type: 'Studio',
    building: 'Riverside Apartments',
    status: 'Owned',
    owner: 'John Smith',
    lastUpdated: '2024-12-20',
  },
  {
    id: '2',
    unitCode: 'A-102',
    type: '1 Bedroom',
    building: 'Riverside Apartments',
    status: 'Owned',
    owner: 'Sarah Johnson',
    lastUpdated: '2024-12-19',
  },
  {
    id: '3',
    unitCode: 'A-103',
    type: '2 Bedroom',
    building: 'Riverside Apartments',
    status: 'Not Owned',
    owner: '-',
    lastUpdated: '2024-12-18',
  },
  {
    id: '4',
    unitCode: 'B-201',
    type: '1 Bedroom',
    building: 'Downtown Plaza',
    status: 'Owned',
    owner: 'Michael Chen',
    lastUpdated: '2024-12-21',
  },
  {
    id: '5',
    unitCode: 'B-202',
    type: '2 Bedroom',
    building: 'Downtown Plaza',
    status: 'Owned',
    owner: 'Emily Davis',
    lastUpdated: '2024-12-15',
  },
  {
    id: '6',
    unitCode: 'B-203',
    type: 'Studio',
    building: 'Downtown Plaza',
    status: 'Not Owned',
    owner: '-',
    lastUpdated: '2024-12-14',
  },
  {
    id: '7',
    unitCode: 'C-301',
    type: '3 Bedroom',
    building: 'Sunset Heights',
    status: 'Owned',
    owner: 'David Wilson',
    lastUpdated: '2024-12-22',
  },
  {
    id: '8',
    unitCode: 'C-302',
    type: '2 Bedroom',
    building: 'Sunset Heights',
    status: 'Owned',
    owner: 'Lisa Anderson',
    lastUpdated: '2024-12-17',
  },
  {
    id: '9',
    unitCode: 'C-303',
    type: '1 Bedroom',
    building: 'Sunset Heights',
    status: 'Not Owned',
    owner: '-',
    lastUpdated: '2024-12-16',
  },
  {
    id: '10',
    unitCode: 'D-401',
    type: 'Studio',
    building: 'Oak Street Residences',
    status: 'Owned',
    owner: 'Robert Taylor',
    lastUpdated: '2024-12-23',
  },
];

export function UnitsTable({ onViewUnit, userRole = 'admin' }: UnitsTableProps) {
  const getStatusVariant = (status: Unit['status']) => {
    return status === 'Owned' ? 'default' : 'secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell>{unit.unitCode}</TableCell>
              <TableCell className="text-muted-foreground">{unit.type}</TableCell>
              <TableCell className="text-muted-foreground">{unit.building}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(unit.status)}>{unit.status}</Badge>
              </TableCell>
              <TableCell>{unit.owner}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(unit.lastUpdated)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onViewUnit?.(unit.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {userRole === 'admin' && (
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}