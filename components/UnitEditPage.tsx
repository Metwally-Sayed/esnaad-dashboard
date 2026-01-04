'use client';

import { useRef } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Save, X, Building2, ChevronLeft } from 'lucide-react';
import { UnitForm, UnitFormData } from './UnitForm';

interface UnitEditPageProps {
  onBack?: () => void;
  onSave?: (data: UnitFormData) => void;
  onCancel?: () => void;
  initialData?: UnitFormData;
}

export function UnitEditPage({ onBack, onSave, onCancel, initialData }: UnitEditPageProps) {
  const formDataRef = useRef<UnitFormData | null>(initialData || null);
  const validateRef = useRef<(() => boolean) | null>(null);

  const handleDataChange = (data: UnitFormData, isValid: boolean) => {
    formDataRef.current = data;
  };

  const handleSave = () => {
    // Trigger validation
    if (validateRef.current && validateRef.current()) {
      if (onSave && formDataRef.current) {
        onSave(formDataRef.current);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Owned':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Not Owned':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const currentStatus = (formDataRef.current?.ownerId || initialData?.ownerId) ? 'Owned' : 'Not Owned';

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
            <h1 className="text-3xl font-semibold">Edit Unit</h1>
            <Badge variant="outline" className={getStatusColor(currentStatus)}>
              <Building2 className="h-3 w-3 mr-1" />
              {currentStatus}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Update unit information and manage ownership
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Shared Unit Form */}
      <UnitForm
        mode="edit"
        initialData={initialData}
        onDataChange={(data, isValid) => {
          handleDataChange(data, isValid);
          // Capture the validate function
          if ((handleDataChange as any).validate) {
            validateRef.current = (handleDataChange as any).validate;
          }
        }}
      />
    </div>
  );
}

// Re-export types for compatibility
export type { UnitFormData } from './UnitForm';
