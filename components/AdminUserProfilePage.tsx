'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ChevronLeft, Edit, UserCheck, UserX, Mail, Phone, IdCard, MapPin, Calendar, Building2, Home, Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import { UserDetails, UnitDetails } from '@/lib/types/api.types';
import { format } from 'date-fns';
import { AuditLogsTable } from './AuditLogsTable';
import { AuditLog } from '@/lib/types/audit.types';

interface AdminUserProfilePageProps {
  user: UserDetails | null;
  units?: UnitDetails[];
  auditLogs?: AuditLog[];
  isLoading?: boolean;
  isUpdating?: boolean;
  auditLoading?: boolean;
  onBack?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onViewUnit?: (unitId: string) => void;
}

export function AdminUserProfilePage({
  user,
  units = [],
  auditLogs = [],
  isLoading = false,
  isUpdating = false,
  auditLoading = false,
  onBack,
  onEdit,
  onToggleStatus,
  onViewUnit
}: AdminUserProfilePageProps) {

  if (isLoading || !user) {
    return (
      <div className="max-w-[1440px] mx-auto p-8">
        <Button variant="ghost" className="mb-6" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Users
        </Button>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isActive = user.isActive;
  const totalUnits = units.length;
  const totalValue = units.reduce((sum, unit) => sum + (unit.price || 0), 0);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy, h:mm a');
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUserRole = () => {
    if (user.role === 'ADMIN') return 'Admin';
    if (user.role === 'OWNER') return 'Owner';
    return user.role || 'User';
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus();
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
            <h1 className="text-3xl font-semibold">{user.name || 'Unnamed User'}</h1>
            <Badge
              variant="outline"
              className={
                isActive
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="secondary">
              {getUserRole()}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Registered on {formatDate(user.createdAt)} • {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} owned
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className={
              isActive
                ? 'border-red-200 text-red-700 hover:bg-red-50'
                : 'border-green-200 text-green-700 hover:bg-green-50'
            }
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isActive ? (
              <UserX className="h-4 w-4 mr-2" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            {isActive ? 'Deactivate User' : 'Activate User'}
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
                      <p className="mt-1">{user.phone || user.externalClient?.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <IdCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">National ID</Label>
                      <p className="mt-1">{user.nationalId || user.externalClient?.nationalityId || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Address</Label>
                      <p className="mt-1">
                        {user.address || user.externalClient?.address ||
                         (user.externalClient?.city && user.externalClient?.country
                          ? `${user.externalClient.city}, ${user.externalClient.country}`
                          : 'Not provided')}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Registration Date</Label>
                      <p className="mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-sm">Last Updated</Label>
                      <p className="mt-1">{formatDateTime(user.updatedAt)}</p>
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
                  {totalUnits} {totalUnits === 1 ? 'Unit' : 'Units'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Code</TableHead>
                      <TableHead>Project/Building</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead className="text-right">Price (SAR)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No units owned
                        </TableCell>
                      </TableRow>
                    ) : (
                      units.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.unitCode}</TableCell>
                          <TableCell>{unit.project?.name || unit.building || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{unit.type}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {unit.area ? `${unit.area} m²` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {unit.floor || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {unit.price ? formatCurrency(unit.price) : 'N/A'}
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

          {/* Audit Logs Section */}
          <AuditLogsTable
            auditLogs={auditLogs}
            isLoading={auditLoading}
            showActor={true}
            showEntity={true}
            compact={true}
          />
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
                      <p className="text-2xl font-semibold">{totalUnits}</p>
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
                      <p className="text-2xl font-semibold">{formatCurrency(totalValue)} SAR</p>
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
                      {isActive ? 'Active' : 'Inactive'}
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
                  <Label className="text-muted-foreground text-sm">User Role</Label>
                  <p className="mt-1 font-medium">{getUserRole()}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-sm">Member Since</Label>
                  <p className="mt-1">{formatDate(user.createdAt)}</p>
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
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isActive ? (
                    <UserX className="h-4 w-4 mr-2" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  {isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {user.externalClient && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.externalClient.nationality && (
                    <>
                      <div>
                        <Label className="text-muted-foreground text-sm">Nationality</Label>
                        <p className="mt-1">{user.externalClient.nationality}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  {user.externalClient.dateOfBirth && (
                    <>
                      <div>
                        <Label className="text-muted-foreground text-sm">Date of Birth</Label>
                        <p className="mt-1">{formatDate(user.externalClient.dateOfBirth)}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div>
                    <Label className="text-muted-foreground text-sm">Email Verified</Label>
                    <p className="mt-1">{user.isEmailVerified ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}