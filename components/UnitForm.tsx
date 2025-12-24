'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';

export interface UnitFormData {
  id?: string;
  unitCode: string;
  unitType: 'Apartment' | 'Villa' | 'Office' | 'Other';
  buildingName: string;
  address: string;
  floor: string;
  size: string;
  ownershipStatus: 'Not Owned' | 'Owned';
  ownerId?: string;
  ownerName?: string;
  bedrooms?: string;
  bathrooms?: string;
  amenities?: string;
  createdAt?: string;
  lastUpdated?: string;
}

interface UnitFormProps {
  mode: 'create' | 'edit';
  initialData?: UnitFormData;
  onDataChange?: (data: UnitFormData, isValid: boolean) => void;
}

const defaultFormData: UnitFormData = {
  unitCode: '',
  unitType: 'Apartment',
  buildingName: '',
  address: '',
  floor: '',
  size: '',
  ownershipStatus: 'Not Owned',
  bedrooms: '',
  bathrooms: '',
  amenities: '',
};

export function UnitForm({ mode, initialData, onDataChange }: UnitFormProps) {
  const [formData, setFormData] = useState<UnitFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const handleInputChange = (field: keyof UnitFormData, value: string) => {
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

  const handleBlur = (field: keyof UnitFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateFormData = (data: UnitFormData): boolean => {
    const newErrors: Record<string, string> = {};

    // Unit Code validation
    if (!data.unitCode.trim()) {
      newErrors.unitCode = 'Unit code is required';
    } else if (data.unitCode.trim().length < 2) {
      newErrors.unitCode = 'Unit code must be at least 2 characters';
    }

    // Building Name validation
    if (!data.buildingName.trim()) {
      newErrors.buildingName = 'Building/Project name is required';
    }

    // Address validation
    if (!data.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Floor validation
    if (!data.floor.trim()) {
      newErrors.floor = 'Floor is required';
    }

    // Size validation
    if (!data.size.trim()) {
      newErrors.size = 'Size is required';
    } else if (isNaN(Number(data.size)) || Number(data.size) <= 0) {
      newErrors.size = 'Size must be a valid positive number';
    }

    // Bedrooms validation (optional but must be valid if provided)
    if (data.bedrooms && (isNaN(Number(data.bedrooms)) || Number(data.bedrooms) < 0)) {
      newErrors.bedrooms = 'Bedrooms must be a valid number';
    }

    // Bathrooms validation (optional but must be valid if provided)
    if (data.bathrooms && (isNaN(Number(data.bathrooms)) || Number(data.bathrooms) < 0)) {
      newErrors.bathrooms = 'Bathrooms must be a valid number';
    }

    // Owner validation (required if ownership status is Owned)
    if (data.ownershipStatus === 'Owned' && !data.ownerId) {
      newErrors.ownerId = 'Owner is required when status is "Owned"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Public method to validate and mark all touched
  const validate = (): boolean => {
    setTouched({
      unitCode: true,
      buildingName: true,
      address: true,
      floor: true,
      size: true,
      bedrooms: true,
      bathrooms: true,
      ownerId: true,
    });
    return validateFormData(formData);
  };

  // Expose validate method to parent
  if (onDataChange) {
    (onDataChange as any).validate = validate;
  }

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

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Unit Code */}
                <div>
                  <Label htmlFor="unitCode">
                    Unit Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="unitCode"
                    value={formData.unitCode}
                    onChange={(e) => handleInputChange('unitCode', e.target.value)}
                    onBlur={() => handleBlur('unitCode')}
                    className={`mt-1.5 ${errors.unitCode && touched.unitCode ? 'border-destructive' : ''}`}
                    placeholder="e.g., A-101, V-205"
                  />
                  {errors.unitCode && touched.unitCode && (
                    <p className="text-sm text-destructive mt-1">{errors.unitCode}</p>
                  )}
                  {!errors.unitCode && isCreateMode && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Must be unique across all units
                    </p>
                  )}
                </div>

                <Separator />

                {/* Unit Type */}
                <div>
                  <Label htmlFor="unitType">
                    Unit Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.unitType}
                    onValueChange={(value: 'Apartment' | 'Villa' | 'Office' | 'Other') =>
                      handleInputChange('unitType', value)
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">
                        <div className="flex items-center gap-2">
                          Apartment
                        </div>
                      </SelectItem>
                      <SelectItem value="Villa">
                        <div className="flex items-center gap-2">
                          Villa
                        </div>
                      </SelectItem>
                      <SelectItem value="Office">
                        <div className="flex items-center gap-2">
                          Office
                        </div>
                      </SelectItem>
                      <SelectItem value="Other">
                        <div className="flex items-center gap-2">
                          Other
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Building Name */}
                <div>
                  <Label htmlFor="buildingName">
                    Building / Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="buildingName"
                    value={formData.buildingName}
                    onChange={(e) => handleInputChange('buildingName', e.target.value)}
                    onBlur={() => handleBlur('buildingName')}
                    className={`mt-1.5 ${errors.buildingName && touched.buildingName ? 'border-destructive' : ''}`}
                    placeholder="e.g., Riverside Apartments"
                  />
                  {errors.buildingName && touched.buildingName && (
                    <p className="text-sm text-destructive mt-1">{errors.buildingName}</p>
                  )}
                </div>

                <Separator />

                {/* Address */}
                <div>
                  <Label htmlFor="address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    className={`mt-1.5 min-h-[80px] ${errors.address && touched.address ? 'border-destructive' : ''}`}
                    placeholder="Enter full address including city and postal code"
                  />
                  {errors.address && touched.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines - Only in Create Mode */}
          {isCreateMode && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Fields marked with <span className="text-destructive">*</span> are required</li>
                  <li>• Unit code must be unique across all properties</li>
                  <li>• Size should be entered in square meters (sqm)</li>
                  <li>• All new units are set to "Not Owned" by default</li>
                  <li>• You can assign an owner after creating the unit</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Metadata - Only in Edit Mode */}
          {isEditMode && formData.id && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Unit Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Unit ID:</span>
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details & Status */}
        <div className="space-y-6">
          {/* Unit Details */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Unit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Floor */}
                <div>
                  <Label htmlFor="floor">
                    Floor <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                    onBlur={() => handleBlur('floor')}
                    className={`mt-1.5 ${errors.floor && touched.floor ? 'border-destructive' : ''}`}
                    placeholder="e.g., 1st Floor, Ground, 5"
                  />
                  {errors.floor && touched.floor && (
                    <p className="text-sm text-destructive mt-1">{errors.floor}</p>
                  )}
                </div>

                <Separator />

                {/* Size */}
                <div>
                  <Label htmlFor="size">
                    Size (sqm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="size"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    onBlur={() => handleBlur('size')}
                    className={`mt-1.5 ${errors.size && touched.size ? 'border-destructive' : ''}`}
                    placeholder="e.g., 120.5"
                  />
                  {errors.size && touched.size && (
                    <p className="text-sm text-destructive mt-1">{errors.size}</p>
                  )}
                  {!errors.size && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter size in square meters
                    </p>
                  )}
                </div>

                <Separator />

                {/* Bedrooms */}
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    onBlur={() => handleBlur('bedrooms')}
                    className={`mt-1.5 ${errors.bedrooms && touched.bedrooms ? 'border-destructive' : ''}`}
                    placeholder="e.g., 2"
                  />
                  {errors.bedrooms && touched.bedrooms && (
                    <p className="text-sm text-destructive mt-1">{errors.bedrooms}</p>
                  )}
                  {!errors.bedrooms && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Optional - Enter 0 for studios
                    </p>
                  )}
                </div>

                <Separator />

                {/* Bathrooms */}
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    onBlur={() => handleBlur('bathrooms')}
                    className={`mt-1.5 ${errors.bathrooms && touched.bathrooms ? 'border-destructive' : ''}`}
                    placeholder="e.g., 2"
                  />
                  {errors.bathrooms && touched.bathrooms && (
                    <p className="text-sm text-destructive mt-1">{errors.bathrooms}</p>
                  )}
                  {!errors.bathrooms && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Optional - Can use decimals (e.g., 2.5)
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Status */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Ownership Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ownershipStatus">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.ownershipStatus}
                    onValueChange={(value: 'Not Owned' | 'Owned') => {
                      handleInputChange('ownershipStatus', value);
                      // Clear owner data when switching to Not Owned
                      if (value === 'Not Owned') {
                        handleInputChange('ownerId', '');
                        handleInputChange('ownerName', '');
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select ownership status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Owned">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500" />
                          Not Owned
                        </div>
                      </SelectItem>
                      <SelectItem value="Owned">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Owned
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.ownershipStatus === 'Not Owned'
                      ? 'Unit is available for ownership assignment'
                      : 'Unit has an assigned owner'}
                  </p>
                </div>

                {/* Owner Assignment - Only shown if status is Owned */}
                {formData.ownershipStatus === 'Owned' && (
                  <>
                    <Separator />
                    <div>
                      <Label htmlFor="ownerId">
                        Assign Owner <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.ownerId || ''}
                        onValueChange={(value) => {
                          handleInputChange('ownerId', value);
                          // Find owner name from mock data
                          const mockOwners = [
                            { id: '1', name: 'Ahmed Al-Rashid' },
                            { id: '2', name: 'Sarah Johnson' },
                            { id: '3', name: 'Mohammed Ali' },
                            { id: '4', name: 'Fatima Hassan' },
                          ];
                          const owner = mockOwners.find(o => o.id === value);
                          if (owner) {
                            handleInputChange('ownerName', owner.name);
                          }
                        }}
                      >
                        <SelectTrigger className={`mt-1.5 ${errors.ownerId && touched.ownerId ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="Select an owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Ahmed Al-Rashid</SelectItem>
                          <SelectItem value="2">Sarah Johnson</SelectItem>
                          <SelectItem value="3">Mohammed Ali</SelectItem>
                          <SelectItem value="4">Fatima Hassan</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.ownerId && touched.ownerId && (
                        <p className="text-sm text-destructive mt-1">{errors.ownerId}</p>
                      )}
                      {!errors.ownerId && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Select from existing owners in the system
                        </p>
                      )}
                    </div>

                    {formData.ownerName && (
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-sm text-muted-foreground">Selected Owner:</p>
                        <p className="font-medium">{formData.ownerName}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Amenities & Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="amenities">Amenities</Label>
                <Textarea
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => handleInputChange('amenities', e.target.value)}
                  className="mt-1.5 min-h-[100px]"
                  placeholder="List amenities (e.g., parking, balcony, pool access, gym)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional - List key features and amenities
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Unit Preview - Only in Create Mode */}
          {isCreateMode && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Unit Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Unit Code:</span>
                    <span className="text-sm font-medium">
                      {formData.unitCode || '—'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm font-medium">{formData.unitType}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Building:</span>
                    <span className="text-sm font-medium">
                      {formData.buildingName || '—'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <span className="text-sm font-medium">
                      {formData.size ? `${formData.size} sqm` : '—'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="secondary">
                      {formData.ownershipStatus}
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
