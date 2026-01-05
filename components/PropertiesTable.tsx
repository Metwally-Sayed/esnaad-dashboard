'use client';

import { useProjects } from '@/lib/hooks/use-projects';
import { useUnits } from '@/lib/hooks/use-units';
import { Loader2, MapPin, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function PropertiesTable() {
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { units, isLoading: isLoadingUnits } = useUnits();

  // Transform projects data with unit counts
  const displayProjects = useMemo(() => {
    if (!projects || !units) return [];

    return projects.slice(0, 5).map(project => {
      // Count units for this project
      const projectUnits = units.filter(unit => unit.projectId === project.id);
      const totalUnits = projectUnits.length;
      const occupiedUnits = projectUnits.filter(unit => unit.ownerId).length;

      return {
        id: project.id,
        name: project.name,
        location: project.location || 'N/A',
        units: totalUnits,
        occupied: occupiedUnits,
        status: project.status,
      };
    });
  }, [projects, units]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'on-hold':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'on-hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (isLoadingProjects || isLoadingUnits) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            displayProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span>{project.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.location}</TableCell>
                <TableCell>{project.units}</TableCell>
               
                <TableCell>
                  <Badge variant={getStatusVariant(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
