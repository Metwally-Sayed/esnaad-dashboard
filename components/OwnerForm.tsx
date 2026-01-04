'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export interface OwnerFormData {
  id?: string;
  firstName: string;
  familyName: string;
  email: string;
  nationalityId: string;
  phoneNumber: string;
  status: 'Active' | 'Pending' | 'Suspended';
  createdAt?: string;
  lastUpdated?: string;
}

export interface OwnedUnit {
  id: string;
  unitCode: string;
  type: string;
  building: string;
  status: 'Occupied' | 'Vacant' | 'Maintenance';
}

interface OwnerFormProps {
  mode: 'create' | 'edit';
  initialData?: OwnerFormData;
  ownedUnits?: OwnedUnit[];
  onDataChange?: (data: OwnerFormData, isValid: boolean) => void;
}

const defaultFormData: OwnerFormData = {
  firstName: '',
  familyName: '',
  email: '',
  nationalityId: '',
  phoneNumber: '',
  status: 'Pending',
};

export function OwnerForm({ mode, initialData, ownedUnits = [], onDataChange }: OwnerFormProps) {
  const [formData, setFormData] = useState<OwnerFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [emailEditWarning, setEmailEditWarning] = useState(false);

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const handleInputChange = (field: keyof OwnerFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Notify parent of changes
    if (onDataChange) {
      const isValid = validateFormData(newFormData);
      onDataChange(newFormData, isValid);
    }
  };

  const handleBlur = (field: keyof OwnerFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleEmailFocus = () => {
    if (isEditMode) {
      setEmailEditWarning(true);
    }
  };

  const validateFormData = (data: OwnerFormData): boolean => {
    const newErrors: Record<string, string> = {};

    // First Name validation
    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (data.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Family Name validation
    if (!data.familyName.trim()) {
      newErrors.familyName = 'Family name is required';
    } else if (data.familyName.trim().length < 2) {
      newErrors.familyName = 'Family name must be at least 2 characters';
    }

    // Email validation
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Nationality ID validation
    if (!data.nationalityId.trim()) {
      newErrors.nationalityId = 'Nationality ID is required';
    } else if (!/^\d{10}$/.test(data.nationalityId)) {
      newErrors.nationalityId = 'Nationality ID must be exactly 10 digits';
    }

    // Phone Number validation (optional but must be valid if provided)
    if (data.phoneNumber.trim() && !/^[\d\s\-\+\(\)]+$/.test(data.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Public method to validate and mark all touched
  const validate = (): boolean => {
    setTouched({
      firstName: true,
      familyName: true,
      email: true,
      nationalityId: true,
      phoneNumber: true,
    });
    return validateFormData(formData);
  };

  // Expose validate method to parent
  if (onDataChange) {
    (onDataChange as any).validate = validate;
  }

  const getUnitStatusBadge = (status: string) => {
    switch (status) {
      case 'Occupied':
        return <Badge variant="default">Occupied</Badge>;
      case 'Vacant':
        return <Badge variant="secondary">Vacant</Badge>;
      case 'Maintenance':
        return <Badge variant="outline">Maintenance</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && Object.values(touched).some(t => t) && (
        <Card className="mb-6 bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-medium text-destructive mb-2">Please fix the following errors:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive/90">
                  {Object.values(errors).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Edit Warning - Only in Edit Mode */}
      {isEditMode && emailEditWarning && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900 mb-1">Warning: Changing Email Address</h3>
                <p className="text-sm text-amber-800">
                  Changing the email address will affect the owner's login credentials and all communications.
                  The new email must exist in the clients database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Personal & Contact Information */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    className={`mt-1.5 ${errors.firstName && touched.firstName ? 'border-destructive' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && touched.firstName && (
                    <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                  )}
                </div>

                <Separator />

                {/* Family Name */}
                <div>
                  <Label htmlFor="familyName">
                    Family Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="familyName"
                    value={formData.familyName}
                    onChange={(e) => handleInputChange('familyName', e.target.value)}
                    onBlur={() => handleBlur('familyName')}
                    className={`mt-1.5 ${errors.familyName && touched.familyName ? 'border-destructive' : ''}`}
                    placeholder="Enter family name"
                  />
                  {errors.familyName && touched.familyName && (
                    <p className="text-sm text-destructive mt-1">{errors.familyName}</p>
                  )}
                </div>

                <Separator />

                {/* Nationality ID */}
                <div>
                  <Label htmlFor="nationalityId">
                    Nationality ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nationalityId"
                    value={formData.nationalityId}
                    onChange={(e) => handleInputChange('nationalityId', e.target.value)}
                    onBlur={() => handleBlur('nationalityId')}
                    className={`mt-1.5 ${errors.nationalityId && touched.nationalityId ? 'border-destructive' : ''}`}
                    placeholder="Enter 10-digit Nationality ID"
                    maxLength={10}
                  />
                  {errors.nationalityId && touched.nationalityId && (
                    <p className="text-sm text-destructive mt-1">{errors.nationalityId}</p>
                  )}
                  {!errors.nationalityId && isCreateMode && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Must be exactly 10 digits
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email <span className="text-destructive">*</span>
                    {isEditMode && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onFocus={handleEmailFocus}
                    onBlur={() => handleBlur('email')}
                    className={`mt-1.5 ${
                      errors.email && touched.email
                        ? 'border-destructive'
                        : isEditMode
                        ? 'border-amber-300'
                        : ''
                    }`}
                    placeholder="owner@example.com"
                  />
                  {errors.email && touched.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                  {!errors.email && isEditMode && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Changing email affects login credentials
                    </p>
                  )}
                  {!errors.email && isCreateMode && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Email must exist in the clients database
                    </p>
                  )}
                </div>

                <Separator />

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    onBlur={() => handleBlur('phoneNumber')}
                    className={`mt-1.5 ${errors.phoneNumber && touched.phoneNumber ? 'border-destructive' : ''}`}
                    placeholder="+966 XX XXX XXXX"
                  />
                  {errors.phoneNumber && touched.phoneNumber && (
                    <p className="text-sm text-destructive mt-1">{errors.phoneNumber}</p>
                  )}
                  {!errors.phoneNumber && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Optional - Include country code
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information - Only in Edit Mode */}
          {isEditMode && formData.id && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Owner ID:</span>
                    <span className="text-sm font-mono font-medium">#{formData.id}</span>
                  </div>
                  {formData.createdAt && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="text-sm font-medium">{formData.createdAt}</span>
                      </div>
                    </>
                  )}
                  {formData.lastUpdated && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                        <span className="text-sm font-medium">{formData.lastUpdated}</span>
                      </div>
                    </>
                  )}
                  {ownedUnits.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Owned Units:</span>
                        <span className="text-sm font-medium">{ownedUnits.length} units</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guidelines - Only in Create Mode */}
          {isCreateMode && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Fields marked with <span className="text-destructive">*</span> are required</li>
                  <li>• Email must exist in the clients database</li>
                  <li>• Nationality ID must be unique in the system</li>
                  <li>• Phone number is optional but recommended</li>
                  <li>• New owners are created with "Pending" status by default</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Additional Sections */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Active' | 'Pending' | 'Suspended') =>
                    handleInputChange('status', value)
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="Active">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="Suspended">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        Suspended
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {formData.status === 'Pending' && 'Owner account is awaiting approval'}
                  {formData.status === 'Active' && 'Owner has full access to the system'}
                  {formData.status === 'Suspended' && 'Owner account is temporarily disabled'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Owned Units Section - Only in Edit Mode */}
          {isEditMode && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Owned Units</CardTitle>
                  <Badge variant="secondary">{ownedUnits.length} units</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Building</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ownedUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No units owned by this owner
                          </TableCell>
                        </TableRow>
                      ) : (
                        ownedUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.unitCode}</TableCell>
                            <TableCell>{unit.type}</TableCell>
                            <TableCell>{unit.building}</TableCell>
                            <TableCell>{getUnitStatusBadge(unit.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {ownedUnits.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-3">
                    This owner currently manages {ownedUnits.length} property unit{ownedUnits.length !== 1 ? 's' : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Owner Preview - Only in Create Mode */}
          {isCreateMode && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Owner Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Full Name:</span>
                    <span className="text-sm font-medium">
                      {formData.firstName || formData.familyName
                        ? `${formData.firstName} ${formData.familyName}`.trim()
                        : '—'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">
                      {formData.email || '—'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nationality ID:</span>
                    <span className="text-sm font-medium">
                      {formData.nationalityId || '—'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        formData.status === 'Active' ? 'default' :
                        formData.status === 'Pending' ? 'secondary' :
                        'outline'
                      }
                    >
                      {formData.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
