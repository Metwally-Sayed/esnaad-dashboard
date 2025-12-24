'use client';

import { useRef } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Save, X, UserPlus } from 'lucide-react';
import { OwnerForm, OwnerFormData } from './OwnerForm';

interface OwnerCreatePageProps {
  onCancel?: () => void;
  onCreate?: (data: OwnerFormData) => void;
}

export function OwnerCreatePage({ onCancel, onCreate }: OwnerCreatePageProps) {
  const formDataRef = useRef<OwnerFormData | null>(null);
  const validateRef = useRef<(() => boolean) | null>(null);

  const handleDataChange = (data: OwnerFormData, isValid: boolean) => {
    formDataRef.current = data;
  };

  const handleCreate = () => {
    // Trigger validation
    if (validateRef.current && validateRef.current()) {
      if (onCreate && formDataRef.current) {
        onCreate(formDataRef.current);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold">Create Owner</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <UserPlus className="h-3 w-3 mr-1" />
              New Owner
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Add a new property owner to the system
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            <Save className="h-4 w-4 mr-2" />
            Create Owner
          </Button>
        </div>
      </div>

      {/* Shared Owner Form */}
      <OwnerForm
        mode="create"
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
export type { OwnerFormData } from './OwnerForm';
