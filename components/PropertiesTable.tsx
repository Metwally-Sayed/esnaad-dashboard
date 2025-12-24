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
import { MoreHorizontal, MapPin } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  units: number;
  occupied: number;
  revenue: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

const properties: Property[] = [
  {
    id: '1',
    name: 'Riverside Apartments',
    location: 'Seattle, WA',
    units: 48,
    occupied: 45,
    revenue: '$94,500',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Downtown Plaza',
    location: 'Portland, OR',
    units: 32,
    occupied: 28,
    revenue: '$67,200',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Sunset Heights',
    location: 'San Francisco, CA',
    units: 64,
    occupied: 58,
    revenue: '$156,800',
    status: 'Active',
  },
  {
    id: '4',
    name: 'Oak Street Residences',
    location: 'Austin, TX',
    units: 24,
    occupied: 24,
    revenue: '$48,000',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Harbor View Complex',
    location: 'Boston, MA',
    units: 56,
    occupied: 52,
    revenue: '$124,800',
    status: 'Maintenance',
  },
];

export function PropertiesTable() {
  const getStatusVariant = (status: Property['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Maintenance':
        return 'secondary';
      case 'Inactive':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead>Monthly Revenue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span>{property.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{property.location}</TableCell>
              <TableCell>{property.units}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{property.occupied}/{property.units}</span>
                  <span className="text-muted-foreground text-sm">
                    ({Math.round((property.occupied / property.units) * 100)}%)
                  </span>
                </div>
              </TableCell>
              <TableCell>{property.revenue}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(property.status)}>{property.status}</Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
