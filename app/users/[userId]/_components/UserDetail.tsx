'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Edit, UserCheck, UserX, Mail, Phone, IdCard, MapPin, Calendar, Building2, Home, Loader2, FileText, ShieldCheck, ShieldX, ShieldAlert, ExternalLink, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { UserDetails, UnitDetails } from '@/lib/types/api.types';
import { format } from 'date-fns';
import { AuditLogsTable } from '@/components/AuditLogsTable';
import { AuditLog } from '@/lib/types/audit.types';

interface UserDetailProps {
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

export function UserDetail({
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
}: UserDetailProps) {

  if (isLoading || !user) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" className="mb-6" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Back to Users</span>
          <span className="sm:hidden">Back</span>
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
    <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={onBack}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Back to Users</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold">{user.name || 'Unnamed User'}</h1>
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
            {user.verificationStatus && (
              <Badge
                variant="outline"
                className={
                  user.verificationStatus === 'APPROVED'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : user.verificationStatus === 'REJECTED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : user.verificationStatus === 'PENDING_APPROVAL'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }
              >
                {user.verificationStatus === 'APPROVED' && <ShieldCheck className="h-3 w-3 mr-1" />}
                {user.verificationStatus === 'REJECTED' && <ShieldX className="h-3 w-3 mr-1" />}
                {user.verificationStatus === 'PENDING_APPROVAL' && <ShieldAlert className="h-3 w-3 mr-1" />}
                {user.verificationStatus === 'APPROVED' ? 'Verified' : user.verificationStatus === 'REJECTED' ? 'Rejected' : user.verificationStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : 'Pending Documents'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Registered on {formatDate(user.createdAt)} • {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} owned
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={isUpdating}
            size="sm"
            className={`flex-1 sm:flex-none ${
              isActive
                ? 'border-red-200 text-red-700 hover:bg-red-50'
                : 'border-green-200 text-green-700 hover:bg-green-50'
            }`}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
            ) : isActive ? (
              <UserX className="h-4 w-4 sm:mr-2" />
            ) : (
              <UserCheck className="h-4 w-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{isActive ? 'Deactivate User' : 'Activate User'}</span>
            <span className="sm:hidden">{isActive ? 'Deactivate' : 'Activate'}</span>
          </Button>
          <Button onClick={onEdit} size="sm" className="flex-1 sm:flex-none">
            <Edit className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit User</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* User Information Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      <TableHead className="text-right">Price (AED)</TableHead>
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

          {/* Verification Documents */}
          {user.ownerDocuments && user.ownerDocuments.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Verification Documents
                  </CardTitle>
                  <Badge variant="secondary">
                    {user.ownerDocuments.length} {user.ownerDocuments.length === 1 ? 'Document' : 'Documents'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.ownerDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg overflow-hidden">
                      {/* Document Preview */}
                      {doc.mimeType.startsWith('image/') ? (
                        <div className="relative h-48 bg-muted">
                          <img
                            src={doc.fileKey}
                            alt={doc.type === 'PASSPORT' ? 'Passport' : 'National ID'}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-muted flex items-center justify-center">
                          <FileText className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      {/* Document Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {doc.type === 'PASSPORT' ? 'Passport' : 'National ID'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {formatDate(doc.createdAt)} • {(doc.sizeBytes / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              doc.status === 'APPROVED'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : doc.status === 'REJECTED'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        {doc.status === 'REJECTED' && doc.rejectionReason && (
                          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            Reason: {doc.rejectionReason}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(doc.fileKey, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = doc.fileKey
                              link.download = `${doc.type.toLowerCase()}-${user.name || user.id}.${doc.mimeType.split('/')[1] || 'pdf'}`
                              link.click()
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                      <p className="text-2xl font-semibold">{formatCurrency(totalValue)} AED</p>
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
                  <Label className="text-muted-foreground text-sm">Verification</Label>
                  <div className="mt-2">
                    <Badge
                      className={
                        user.verificationStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : user.verificationStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : user.verificationStatus === 'PENDING_APPROVAL'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {user.verificationStatus === 'APPROVED' ? 'Verified' : user.verificationStatus === 'REJECTED' ? 'Rejected' : user.verificationStatus === 'PENDING_APPROVAL' ? 'Pending Review' : 'Pending Documents'}
                    </Badge>
                  </div>
                  {user.verificationNote && (
                    <p className="text-xs text-muted-foreground mt-1">{user.verificationNote}</p>
                  )}
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
