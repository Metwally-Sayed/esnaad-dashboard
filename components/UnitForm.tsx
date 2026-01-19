'use client';

import { useProjects } from '@/lib/hooks/use-projects';
import { useUsers } from '@/lib/hooks/use-users';
import { AlertCircle } from 'lucide-react';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';

export interface UnitFormData {
  id?: string;
  unitCode: string;
  unitType: 'Apartment' | 'Villa' | 'Office' | 'Other';
  buildingName: string;
  projectId?: string;
  projectName?: string;
  address: string;
  floor: string;
  size: string;
  ownerId?: string;
  ownerName?: string;
  bedrooms?: string;
  bathrooms?: string;
  amenities?: string;
  price?: string; // Unit price for service charge calculation
  createdAt?: string;
  lastUpdated?: string;
}

interface UnitFormProps {
  mode: 'create' | 'edit';
  initialData?: UnitFormData;
  onDataChange?: (data: UnitFormData, isValid: boolean) => void;
  lockProject?: boolean; // Lock project selection (when coming from project page)
}

export interface UnitFormHandle {
  validate: () => boolean;
  getData: () => UnitFormData;
}

const defaultFormData: UnitFormData = {
  unitCode: '',
  unitType: 'Apartment',
  buildingName: '',
  address: '',
  floor: '',
  size: '',
  bedrooms: '',
  bathrooms: '',
  amenities: '',
  price: '',
};

export const UnitForm = forwardRef<UnitFormHandle, UnitFormProps>(function UnitForm({ mode, initialData, onDataChange, lockProject }, ref) {
  const [formData, setFormData] = useState<UnitFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [testValue, setTestValue] = useState<string>(''); // For debugging select issues

  // Get real owners from the API
  const { users: owners, isLoading: isLoadingOwners, error: ownersError } = useUsers({ role: 'OWNER', limit: 100 });

  // Get projects from the API
  const { projects, error: projectsError } = useProjects({ limit: 100 });

  // Check for authentication errors
  const hasAuthError = (ownersError?.statusCode === 401 || projectsError?.statusCode === 401) ||
                       (ownersError?.message?.includes('No token') || projectsError?.message?.includes('No token'));

  // Fallback data when not authenticated (for development)
  const fallbackProjects = hasAuthError ? [
    { id: 'proj1', name: 'Marina Tower', location: 'Dubai Marina' },
    { id: 'proj2', name: 'Downtown Plaza', location: 'Downtown Dubai' },
    { id: 'proj3', name: 'Green Valley Villas', location: 'Al Barsha' },
  ] : [];

  const fallbackOwners = hasAuthError ? [
    { id: 'owner1', name: 'John Smith', email: 'john.smith@example.com' },
    { id: 'owner2', name: 'Jane Doe', email: 'jane.doe@example.com' },
  ] : [];

  // Use real data if available, fallback if auth error
  const displayProjects = projects && projects.length > 0 ? projects : fallbackProjects;
  const displayOwners = owners && owners.length > 0 ? owners : fallbackOwners;

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Expose validate and getData methods to parent via ref
  useImperativeHandle(ref, () => ({
    validate: () => {
      return validateFormData(formData);
    },
    getData: () => {
      return formData;
    },
  }));

  const handleInputChange = (field: keyof UnitFormData, value: string) => {
    console.log(`handleInputChange called: field=${field}, value=${value}`);
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    console.log('New formData:', newFormData);

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

    console.log('Validating form data:', data);

    // Unit Code validation
    if (!data.unitCode || !data.unitCode.trim()) {
      newErrors.unitCode = 'Unit code is required';
    } else if (data.unitCode.trim().length < 2) {
      newErrors.unitCode = 'Unit code must be at least 2 characters';
    }

    // Project validation (optional - backend allows units without projects)
    // No validation required - project is optional

    // Address validation
    if (!data.address || !data.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Floor validation
    if (!data.floor || !data.floor.trim()) {
      newErrors.floor = 'Floor is required';
    }

    // Size validation
    if (!data.size || !data.size.trim()) {
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

    // Price validation (optional but must be valid if provided)
    if (data.price && (isNaN(Number(data.price)) || Number(data.price) <= 0)) {
      newErrors.price = 'Price must be a valid positive number';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Public method to validate and mark all touched
  // Can optionally accept data to validate, otherwise uses current formData
  const validate = (dataToValidate?: UnitFormData): boolean => {
    const dataToUse = dataToValidate || formData;
    console.log('Validate called with data:', dataToUse);

    setTouched({
      unitCode: true,
      projectId: true,
      address: true,
      floor: true,
      size: true,
      bedrooms: true,
      bathrooms: true,
      price: true,
    });

    const isValid = validateFormData(dataToUse);
    console.log('Validation result:', isValid);
    return isValid;
  };

  // Expose validate method to parent
  if (onDataChange) {
    (onDataChange as any).validate = validate;
  }

  // Log errors for debugging
  if (ownersError) {
    console.log('Owners API Error:', ownersError);
  }
  if (projectsError) {
    console.log('Projects API Error:', projectsError);
  }

  return (
    <>


      {/* Authentication Error */}
      {hasAuthError && (
        <Card className="mb-6 bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900 mb-2">Authentication Required</h3>
                <p className="text-sm text-yellow-800">
                  Your session has expired or you need to log in to access this feature.
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  Please <a href="/login" className="underline font-medium">log in</a> to continue.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {/* Unit Code */}
                <div>
                  <Label htmlFor="unitCode" className="text-sm sm:text-base">
                    Unit Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="unitCode"
                    value={formData.unitCode || ''}
                    onChange={(e) => handleInputChange('unitCode', e.target.value)}
                    onBlur={() => handleBlur('unitCode')}
                    className={`mt-1.5 h-10 sm:h-9 ${errors.unitCode && touched.unitCode ? 'border-destructive' : ''}`}
                    placeholder="e.g., A-101, V-205"
                  />
                  {errors.unitCode && touched.unitCode && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.unitCode}</p>
                  )}
                  {!errors.unitCode && isCreateMode && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Must be unique across all units
                    </p>
                  )}
                </div>

                <Separator />

                {/* Unit Type */}
                <div>
                  <Label htmlFor="unitType" className="text-sm sm:text-base">
                    Unit Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.unitType}
                    onValueChange={(value: 'Apartment' | 'Villa' | 'Office' | 'Other') =>
                      handleInputChange('unitType', value)
                    }
                  >
                    <SelectTrigger className="mt-1.5 h-10 sm:h-9">
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

                {/* Project Selection */}
                <div>
                  <Label htmlFor="projectId" className="text-sm sm:text-base">
                    Project <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.projectId || 'none'}
                    onValueChange={(value) => {
                      console.log('Project select changed:', value);
                      console.log('Current formData.projectId:', formData.projectId);
                      console.log('Available projects:', displayProjects);

                      if (value === 'none') {
                        // Clear project selection
                        setFormData(prev => {
                          const newData = {
                            ...prev,
                            projectId: '',
                            projectName: '',
                            buildingName: prev.buildingName // Keep existing building name
                          };

                          // Notify parent if callback exists
                          if (onDataChange) {
                            const isValid = validateFormData(newData);
                            onDataChange(newData, isValid);
                          }

                          return newData;
                        });
                      } else {
                        // Set project selection
                        const project = displayProjects?.find(p => p.id === value);
                        setFormData(prev => {
                          const newData = {
                            ...prev,
                            projectId: value,
                            projectName: project?.name || '',
                            buildingName: project?.name || prev.buildingName // Update building name to project name
                          };

                          // Notify parent if callback exists
                          if (onDataChange) {
                            const isValid = validateFormData(newData);
                            onDataChange(newData, isValid);
                          }

                          return newData;
                        });
                      }

                      // Trigger blur for validation
                      handleBlur('projectId');
                    }}
                    disabled={lockProject}
                  >
                    <SelectTrigger
                      className={`mt-1.5 h-10 sm:h-9 ${errors.projectId && touched.projectId ? 'border-destructive' : ''} ${hasAuthError ? 'border-yellow-500' : ''}`}
                    >
                      <SelectValue placeholder={hasAuthError ? "Login required - Using fallback data" : "Select a project"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project</SelectItem>
                      {displayProjects && displayProjects.length > 0 ? (
                        displayProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} {project.location ? `- ${project.location}` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No projects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.projectId && touched.projectId && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.projectId}</p>
                  )}
                  {lockProject && formData.projectId && formData.projectId !== 'none' && (
                    <p className="text-xs sm:text-sm text-primary mt-1 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Project pre-selected from project page
                    </p>
                  )}
                  {!lockProject && !errors.projectId && formData.projectId && formData.projectId !== 'none' && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Unit will be assigned to: {formData.projectName}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Building Name */}
                <div>
                  <Label htmlFor="buildingName" className="text-sm sm:text-base">
                    Building Name
                  </Label>
                  <Input
                    id="buildingName"
                    value={formData.buildingName || ''}
                    onChange={(e) => handleInputChange('buildingName', e.target.value)}
                    onBlur={() => handleBlur('buildingName')}
                    className="mt-1.5 h-10 sm:h-9"
                    placeholder="e.g., Tower A, Building 1"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Optional - Specific building within the project
                  </p>
                </div>

                <Separator />

                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-sm sm:text-base">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    className={`mt-1.5 min-h-[80px] ${errors.address && touched.address ? 'border-destructive' : ''}`}
                    placeholder="Enter full address including city and postal code"
                  />
                  {errors.address && touched.address && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines - Only in Create Mode */}
          {isCreateMode && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg sm:text-xl">Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
                  <li>• Fields marked with <span className="text-destructive">*</span> are required</li>
                  <li>• Unit code must be unique across all properties</li>
                  <li>• Size should be entered in square meters (sqm)</li>
                  <li>• Owner assignment is optional during creation</li>
                  <li>• You can assign or change the owner at any time</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Metadata - Only in Edit Mode */}
          {isEditMode && formData.id && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Unit Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">Unit ID:</span>
                    <span className="text-xs sm:text-sm font-mono font-medium">#{formData.id}</span>
                  </div>
                  {formData.createdAt && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Created:</span>
                        <span className="text-xs sm:text-sm font-medium">{formData.createdAt}</span>
                      </div>
                    </>
                  )}
                  {formData.lastUpdated && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Last Updated:</span>
                        <span className="text-xs sm:text-sm font-medium">{formData.lastUpdated}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details & Status */}
        <div className="space-y-4 sm:space-y-6">
          {/* Unit Details */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Unit Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {/* Floor */}
                <div>
                  <Label htmlFor="floor" className="text-sm sm:text-base">
                    Floor <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="floor"
                    value={formData.floor || ''}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                    onBlur={() => handleBlur('floor')}
                    className={`mt-1.5 h-10 sm:h-9 ${errors.floor && touched.floor ? 'border-destructive' : ''}`}
                    placeholder="e.g., 1st Floor, Ground, 5"
                  />
                  {errors.floor && touched.floor && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.floor}</p>
                  )}
                </div>

                <Separator />

                {/* Size */}
                <div>
                  <Label htmlFor="size" className="text-sm sm:text-base">
                    Size (sqm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="size"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.size || ''}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    onBlur={() => handleBlur('size')}
                    className={`mt-1.5 h-10 sm:h-9 ${errors.size && touched.size ? 'border-destructive' : ''}`}
                    placeholder="e.g., 120.5"
                  />
                  {errors.size && touched.size && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.size}</p>
                  )}
                  {!errors.size && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Enter size in square meters
                    </p>
                  )}
                </div>

                <Separator />

                {/* Bedrooms */}
                <div>
                  <Label htmlFor="bedrooms" className="text-sm sm:text-base">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    onBlur={() => handleBlur('bedrooms')}
                    className={`mt-1.5 h-10 sm:h-9 ${errors.bedrooms && touched.bedrooms ? 'border-destructive' : ''}`}
                    placeholder="e.g., 2"
                  />
                  {errors.bedrooms && touched.bedrooms && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.bedrooms}</p>
                  )}
                  {!errors.bedrooms && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Optional - Enter 0 for studios
                    </p>
                  )}
                </div>

                <Separator />

                {/* Bathrooms */}
                <div>
                  <Label htmlFor="bathrooms" className="text-sm sm:text-base">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    onBlur={() => handleBlur('bathrooms')}
                    className={`mt-1.5 h-10 sm:h-9 ${errors.bathrooms && touched.bathrooms ? 'border-destructive' : ''}`}
                    placeholder="e.g., 2"
                  />
                  {errors.bathrooms && touched.bathrooms && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.bathrooms}</p>
                  )}
                  {!errors.bathrooms && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Optional - Can use decimals (e.g., 2.5)
                    </p>
                  )}
                </div>

                <Separator />

                {/* Price */}
                <div>
                  <Label htmlFor="price" className="text-sm sm:text-base">Unit Price (AED)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    onBlur={() => handleBlur('price')}
                    className={`mt-1.5 h-10 sm:h-9 ${errors.price && touched.price ? 'border-destructive' : ''}`}
                    placeholder="e.g., 500000"
                  />
                  {errors.price && touched.price && (
                    <p className="text-xs sm:text-sm text-destructive mt-1">{errors.price}</p>
                  )}
                  {!errors.price && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Optional - Required for service charge calculation
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Assignment */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Owner Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="ownerId" className="text-sm sm:text-base">
                    Assign Owner
                  </Label>
                  <Select
                    value={formData.ownerId || 'none'}
                    onValueChange={(value) => {
                      console.log('Owner select changed:', value);
                      console.log('Current formData.ownerId:', formData.ownerId);
                      console.log('Available owners:', displayOwners);

                      if (value === 'none') {
                        // Clear owner selection
                        setFormData(prev => {
                          const newData = {
                            ...prev,
                            ownerId: '',
                            ownerName: ''
                          };

                          // Notify parent if callback exists
                          if (onDataChange) {
                            const isValid = validateFormData(newData);
                            onDataChange(newData, isValid);
                          }

                          return newData;
                        });
                      } else {
                        // Set owner selection
                        const owner = displayOwners?.find(o => o.id === value);
                        setFormData(prev => {
                          const newData = {
                            ...prev,
                            ownerId: value,
                            ownerName: owner?.name || owner?.email || ''
                          };

                          // Notify parent if callback exists
                          if (onDataChange) {
                            const isValid = validateFormData(newData);
                            onDataChange(newData, isValid);
                          }

                          return newData;
                        });
                      }
                    }}
                    disabled={isLoadingOwners}
                  >
                    <SelectTrigger className={`mt-1.5 h-10 sm:h-9 ${hasAuthError ? 'border-yellow-500' : ''}`}>
                      <SelectValue placeholder={
                        hasAuthError ? "Login required - Using fallback data" :
                        isLoadingOwners ? "Loading owners..." :
                        "Select an owner (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Owner</SelectItem>
                      {displayOwners && displayOwners.length > 0 ? (
                        displayOwners.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            <div className="flex flex-col">
                              <span>{owner.name || 'Unnamed Owner'}</span>
                              <span className="text-xs text-muted-foreground">{owner.email}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        !isLoadingOwners && (
                          <SelectItem value="none" disabled>
                            No owners available
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Optional - Select from existing owners in the system
                  </p>
                </div>

                {formData.ownerId && formData.ownerId !== 'none' && (
                  <div className="p-2 sm:p-3 bg-muted/50 rounded-md">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Selected Owner:</p>
                    <div>
                      <p className="text-sm sm:text-base font-medium">{formData.ownerName}</p>
                      {displayOwners?.find(o => o.id === formData.ownerId) && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {displayOwners.find(o => o.id === formData.ownerId)?.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Amenities & Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="amenities" className="text-sm sm:text-base">Amenities</Label>
                <Textarea
                  id="amenities"
                  value={formData.amenities || ''}
                  onChange={(e) => handleInputChange('amenities', e.target.value)}
                  className="mt-1.5 min-h-[100px]"
                  placeholder="List amenities (e.g., parking, balcony, pool access, gym)"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
});