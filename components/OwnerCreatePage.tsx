'use client';

import { useRef, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Save, X, UserPlus, Loader2 } from 'lucide-react';
import { OwnerForm, OwnerFormData } from './OwnerForm';
import { authService } from '@/lib/api/auth.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface OwnerCreatePageProps {
  onCancel?: () => void;
  onCreate?: (data: OwnerFormData) => void;
}

export function OwnerCreatePage({ onCancel, onCreate }: OwnerCreatePageProps) {
  const router = useRouter();
  const formDataRef = useRef<OwnerFormData | null>(null);
  const validateRef = useRef<(() => boolean) | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleDataChange = (data: OwnerFormData, isValid: boolean) => {
    formDataRef.current = data;
  };

  const validatePasswords = (): boolean => {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.valid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleCreate = () => {
    // First validate the form
    if (validateRef.current && validateRef.current()) {
      if (formDataRef.current) {
        // Show password dialog
        setShowPasswordDialog(true);
        setPassword('');
        setConfirmPassword('');
        setPasswordErrors([]);
      }
    }
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswords()) {
      return;
    }

    if (!formDataRef.current) {
      return;
    }

    setIsCreating(true);

    try {
      // Step 1: Register the user with the backend
      const registerData = {
        email: formDataRef.current.email,
        password: password,
        name: `${formDataRef.current.firstName} ${formDataRef.current.familyName}`.trim()
      };

      const response = await authService.register(registerData);

      if (response.success) {
        // Store the owner data for later use (after OTP verification)
        sessionStorage.setItem('pendingOwnerData', JSON.stringify({
          ...formDataRef.current,
          email: formDataRef.current.email
        }));

        toast.success('Account created! Please check your email for verification code.');

        // Redirect to OTP verification page
        router.push(`/register/verify?email=${encodeURIComponent(formDataRef.current.email)}`);
      } else {
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Failed to create account';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Invalid data provided';
        toast.error(errorMessage);
      } else if (error.response?.status === 404) {
        toast.error('Email not found in the system. Please contact administrator.');
      } else if (error.response?.status === 409) {
        toast.error('An account with this email already exists.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setIsCreating(false);
      setShowPasswordDialog(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/users');
    }
  };

  return (
    <>
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
            <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
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

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Account Password</DialogTitle>
            <DialogDescription>
              Create a secure password for the new owner account. The owner will use this password to log in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordErrors.length > 0) {
                    setPasswordErrors([]);
                  }
                }}
                placeholder="Enter password"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordErrors.length > 0) {
                    setPasswordErrors([]);
                  }
                }}
                placeholder="Confirm password"
                disabled={isCreating}
              />
            </div>

            {/* Password Requirements */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Password requirements:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
              </ul>
            </div>

            {/* Error Messages */}
            {passwordErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                  {passwordErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Re-export types for compatibility
export type { OwnerFormData } from './OwnerForm';