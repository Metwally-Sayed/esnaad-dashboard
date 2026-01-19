'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, X, Building2 } from 'lucide-react';
import { UnitForm, UnitFormData } from '@/components/UnitForm';
import { useUnitMutations } from '@/lib/hooks/use-units';
import { CreateUnitDto } from '@/lib/types/api.types';
import { toast } from 'sonner';

interface UnitCreatePageProps {
  onCancel?: () => void;
  onCreate?: (data: UnitFormData) => void;
  defaultProjectId?: string;
  lockProject?: boolean; // Lock project selection if coming from project page
}

export function UnitCreatePage({ onCancel, onCreate, defaultProjectId, lockProject }: UnitCreatePageProps) {
  const router = useRouter();
  const { createUnit, isCreating } = useUnitMutations();
  const formDataRef = useRef<UnitFormData | null>(null);
  const validateRef = useRef<((data?: UnitFormData) => boolean) | null>(null);
  const onDataChangeRef = useRef<((data: UnitFormData, isValid: boolean) => void) | null>(null);

  const handleDataChange = (data: UnitFormData, isValid: boolean) => {
    console.log('Form data changed:', data);
    console.log('Form is valid:', isValid);
    formDataRef.current = data;
  };

  // Try to capture the validate function after mount
  useEffect(() => {
    if (onDataChangeRef.current && (onDataChangeRef.current as any).validate) {
      validateRef.current = (onDataChangeRef.current as any).validate;
      console.log('Validate function captured in useEffect');
    }
  }, []);

  const handleCreate = async () => {
    console.log('handleCreate called');
    console.log('validateRef.current:', validateRef.current);
    console.log('formDataRef.current:', formDataRef.current);

    // Check if we have form data
    if (!formDataRef.current) {
      toast.error('Please fill in the form');
      return;
    }

    // Try to validate, but proceed anyway if validation is not available
    let validationPassed = true;
    if (validateRef.current) {
      // Pass the current form data to validate function
      validationPassed = validateRef.current(formDataRef.current);
      console.log('Validation result:', validationPassed);

      if (!validationPassed) {
        toast.error('Please fix the validation errors');
        return;
      }
    } else {
      console.log('Validation not available, proceeding with basic checks');
      // Basic validation if the validate function is not available
      if (!formDataRef.current.unitCode || !formDataRef.current.address || !formDataRef.current.floor || !formDataRef.current.size) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    if (validationPassed && formDataRef.current) {
      console.log('Proceeding with unit creation');
      try {
          // Convert form data to API format
          const apiData: CreateUnitDto = {
            unitNumber: formDataRef.current.unitCode, // Map unitCode to unitNumber
            unitType: formDataRef.current.unitType,
            buildingName: formDataRef.current.buildingName,
            address: formDataRef.current.address,
            floor: formDataRef.current.floor ? parseInt(formDataRef.current.floor) : undefined,
            area: formDataRef.current.size ? parseFloat(formDataRef.current.size) : undefined, // Map size to area
            bedrooms: formDataRef.current.bedrooms ? parseInt(formDataRef.current.bedrooms) : undefined,
            bathrooms: formDataRef.current.bathrooms ? parseFloat(formDataRef.current.bathrooms) : undefined,
            price: formDataRef.current.price ? parseFloat(formDataRef.current.price) : undefined,
            amenities: formDataRef.current.amenities,
            projectId: formDataRef.current.projectId && formDataRef.current.projectId !== 'none' ? formDataRef.current.projectId : undefined,
            ownerId: formDataRef.current.ownerId && formDataRef.current.ownerId !== 'none' ? formDataRef.current.ownerId : undefined,
          };

          console.log('API Data to send:', apiData);

          // Create unit via API
          const result = await createUnit(apiData);
          console.log('Unit created successfully:', result);

          // If an owner is assigned in the form, we'd need to call assign owner API separately
          // For now, we'll handle that in a separate flow

          toast.success('Unit created successfully!');

          // Call parent onCreate if provided (for backward compatibility)
          if (onCreate) {
            onCreate(formDataRef.current);
          }

          // Navigate back to units list
          router.push('/units');
      } catch (error: any) {
        console.error('Error creating unit:', error);
        toast.error(error.message || 'Failed to create unit');
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/units');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold">Create Unit</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Building2 className="h-3 w-3 mr-1" />
              New Unit
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Add a new property unit to the system
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Unit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Shared Unit Form */}
      <UnitForm
        mode="create"
        initialData={defaultProjectId ? {
          unitCode: '',
          unitType: 'Apartment',
          buildingName: '',
          projectId: defaultProjectId,
          address: '',
          floor: '',
          size: '',
          bedrooms: '',
          bathrooms: '',
          amenities: '',
        } : undefined}
        lockProject={lockProject}
        onDataChange={(() => {
          const callback = (data: UnitFormData, isValid: boolean) => {
            handleDataChange(data, isValid);
          };

          // Store the callback reference so we can access validate function later
          onDataChangeRef.current = callback;

          // After the component mounts, the validate function will be attached
          setTimeout(() => {
            if ((callback as any).validate) {
              validateRef.current = (callback as any).validate;
              console.log('Validate function captured');
            }
          }, 0);

          return callback;
        })()}
      />
    </div>
  );
}

// Re-export types for compatibility
export type { UnitFormData } from '@/components/UnitForm';