'use client';

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Save, X, UserCog, Trash2, Lock, ChevronLeft, Loader2 } from 'lucide-react';
import { OwnerForm, OwnerFormData, OwnedUnit } from './OwnerForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Separator } from './ui/separator';

interface OwnerEditPageProps {
  onBack?: () => void;
  onSave?: (data: OwnerFormData) => void;
  onCancel?: () => void;
  onDeactivate?: () => void;
  initialData?: OwnerFormData;
  ownedUnits?: OwnedUnit[];
  isSaving?: boolean;
}

export function OwnerEditPage({
  onBack,
  onSave,
  onCancel,
  onDeactivate,
  initialData,
  ownedUnits = [],
  isSaving = false
}: OwnerEditPageProps) {
  const formDataRef = useRef<OwnerFormData | null>(initialData || null);
  const validateRef = useRef<(() => boolean) | null>(null);

  const handleDataChange = (data: OwnerFormData, isValid: boolean) => {
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

  const handleDeactivate = () => {
    if (onDeactivate) {
      onDeactivate();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Suspended':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const currentStatus = formDataRef.current?.status || initialData?.status || 'Pending';
  const ownerName = formDataRef.current
    ? `${formDataRef.current.firstName} ${formDataRef.current.familyName}`.trim()
    : initialData
    ? `${initialData.firstName} ${initialData.familyName}`.trim()
    : 'this owner';

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
            <h1 className="text-3xl font-semibold">Edit Owner</h1>
            <Badge variant="outline" className={getStatusColor(currentStatus)}>
              <UserCog className="h-3 w-3 mr-1" />
              {currentStatus}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Update owner information and manage account settings
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Shared Owner Form */}
      <OwnerForm
        mode="edit"
        initialData={initialData}
        ownedUnits={ownedUnits}
        onDataChange={(data, isValid) => {
          handleDataChange(data, isValid);
          // Capture the validate function
          if ((handleDataChange as any).validate) {
            validateRef.current = (handleDataChange as any).validate;
          }
        }}
      />

      {/* Admin Controls Section - Only in Edit Mode */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div></div>
        <div>
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800 mb-4">
                <li>• Only administrators can edit owner information</li>
                <li>• Email changes require owner re-verification</li>
                <li>• Status changes take effect immediately</li>
                <li>• All modifications are logged in the audit trail</li>
              </ul>

              <Separator className="my-4 bg-blue-300" />

              {/* Deactivate Account Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deactivate Account
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will deactivate the owner account for{' '}
                      <strong>{ownerName}</strong>.
                      The owner will lose access to the system, but all data will be preserved.
                      You can reactivate the account later if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeactivate}
                      disabled={isSaving}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isSaving ? 'Deactivating...' : 'Deactivate Account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Re-export types for compatibility
export type { OwnerFormData, OwnedUnit };
