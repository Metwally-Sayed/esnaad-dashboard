'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Pencil, UserPlus, FileDown, ChevronLeft } from 'lucide-react';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface UnitProfilePageProps {
  onBack?: () => void;
  onEdit?: () => void;
}

export function UnitProfilePage({ onBack, onEdit }: UnitProfilePageProps) {
  const { userRole } = useAuth();
  // Mock data - in a real app this would come from props or API
  const unit = {
    unitCode: 'A-101',
    status: 'Owned' as const,
    type: 'Studio',
    building: 'Riverside Apartments',
    floor: '1st Floor',
    size: '450 sq ft',
  };

  const owner = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    iqamaNumber: '2345678901',
  };

  const isOwned = unit.status === 'Owned';
  const isAdmin = userRole === 'admin';
  const isOwner = userRole === 'owner';

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Units
      </Button>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1>Unit {unit.unitCode}</h1>
            <Badge variant={isOwned ? 'default' : 'secondary'}>
              {unit.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {isAdmin ? 'View and manage unit details' : 'View your unit details'}
          </p>
        </div>

        {/* Action Buttons - Conditional based on role */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Owner
              </Button>
            </>
          )}
          {/* Export buttons available to all users */}
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export Word
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Unit Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-muted-foreground text-sm">Type</label>
                  <p className="mt-1">{unit.type}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-muted-foreground text-sm">Building</label>
                  <p className="mt-1">{unit.building}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-muted-foreground text-sm">Floor</label>
                  <p className="mt-1">{unit.floor}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-muted-foreground text-sm">Size</label>
                  <p className="mt-1">{unit.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-muted-foreground text-sm">Status</label>
                  <p className="mt-1">{unit.status}</p>
                </div>
                <Badge variant={isOwned ? 'default' : 'secondary'} className="h-8">
                  {isOwned ? 'Currently Owned' : 'Available'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Owner Information Card - Only shown if owned */}
          {isOwned && (
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm">Name</label>
                    <p className="mt-1">{owner.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-muted-foreground text-sm">Email</label>
                    <p className="mt-1">{owner.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-muted-foreground text-sm">Iqama Number</label>
                    <p className="mt-1">{owner.iqamaNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-muted-foreground text-sm">Registration Date</label>
                  <p className="mt-1">Dec 15, 2024</p>
                </div>
                <Separator />
                <div>
                  <label className="text-muted-foreground text-sm">Last Updated</label>
                  <p className="mt-1">Dec 20, 2024</p>
                </div>
                <Separator />
                <div>
                  <label className="text-muted-foreground text-sm">Status History</label>
                  <p className="mt-1 text-muted-foreground text-sm">
                    2 ownership changes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}