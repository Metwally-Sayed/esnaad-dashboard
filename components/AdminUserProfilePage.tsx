'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ChevronLeft, Edit, UserCheck, UserX, Mail, Phone, IdCard, MapPin, Calendar, Building2, Home } from 'lucide-react';
import { Separator } from './ui/separator';

interface AdminUserProfilePageProps {
  onBack?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onViewUnit?: (unitId: string) => void;
}

// Mock user data - in real app this would come from API
const mockUser = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '+966 50 123 4567',
  iqama: '2345678901',
  address: '123 King Fahd Road, Riyadh, Saudi Arabia',
  status: 'Active' as 'Active' | 'Inactive',
  registrationDate: 'Jan 15, 2024',
  lastLogin: 'Dec 20, 2024, 3:45 PM',
  totalUnits: 3,
  totalValue: '1,350,000',
};

// Mock owned units data
const mockOwnedUnits = [
  {
    id: '1',
    unitCode: 'A-101',
    building: 'Riverside Apartments',
    type: 'Studio',
    floor: '1st Floor',
    size: '450 sq ft',
    status: 'Owned',
    purchaseDate: 'Jan 20, 2024',
    value: '450,000',
  },
  {
    id: '2',
    unitCode: 'B-205',
    building: 'Riverside Apartments',
    type: '2 Bedroom',
    floor: '2nd Floor',
    size: '850 sq ft',
    status: 'Owned',
    purchaseDate: 'Mar 15, 2024',
    value: '650,000',
  },
  {
    id: '3',
    unitCode: 'C-302',
    building: 'Tower Heights',
    type: '1 Bedroom',
    floor: '3rd Floor',
    size: '600 sq ft',
    status: 'Owned',
    purchaseDate: 'May 10, 2024',
    value: '250,000',
  },
];

export function AdminUserProfilePage({
  onBack,
  onEdit,
  onToggleStatus,
  onViewUnit
}: AdminUserProfilePageProps) {
  const [user] = useState(mockUser);
  const [ownedUnits] = useState(mockOwnedUnits);

  const isActive = user.status === 'Active';

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      const action = isActive ? 'deactivate' : 'activate';
      if (confirm(`Are you sure you want to ${action} this user?`)) {
        onToggleStatus();
      }
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Users
      </Button>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1>{user.name}</h1>
            <Badge
              variant="outline"
              className={
                isActive
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }
            >
              {user.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Registered on {user.registrationDate} • {user.totalUnits} units owned
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            className={
              isActive
                ? 'border-red-200 text-red-700 hover:bg-red-50'
                : 'border-green-200 text-green-700 hover:bg-green-50'
            }
          >
            {isActive ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate User
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate User
              </>
            )}
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="col-span-2 space-y-6">
          {/* User Information Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Email Address</Label>
                      <p className="mt-1">{user.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Phone Number</Label>
                      <p className="mt-1">{user.phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <IdCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Iqama Number</Label>
                      <p className="mt-1">{user.iqama}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Address</Label>
                      <p className="mt-1">{user.address}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Registration Date</Label>
                      <p className="mt-1">{user.registrationDate}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Last Login</Label>
                      <p className="mt-1">{user.lastLogin}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owned Units Table */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Owned Units</CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  {user.totalUnits} {user.totalUnits === 1 ? 'Unit' : 'Units'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Code</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead className="text-right">Value (SAR)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ownedUnits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No units owned
                        </TableCell>
                      </TableRow>
                    ) : (
                      ownedUnits.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.unitCode}</TableCell>
                          <TableCell>{unit.building}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{unit.type}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {unit.size}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {unit.purchaseDate}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {unit.value}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewUnit && onViewUnit(unit.id)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Home className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Units</p>
                      <p className="text-2xl font-semibold">{user.totalUnits}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-semibold">{user.totalValue} SAR</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Current Status</Label>
                  <div className="mt-2">
                    <Badge
                      className={
                        isActive
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isActive
                      ? 'User has full access to the system'
                      : 'User access is currently restricted'}
                  </p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-sm">Last Activity</Label>
                  <p className="mt-1">{user.lastLogin}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-sm">Member Since</Label>
                  <p className="mt-1">{user.registrationDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  onClick={handleToggleStatus}
                >
                  {isActive ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate Account
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No notes available. Click edit to add admin notes about this user.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for labels
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
