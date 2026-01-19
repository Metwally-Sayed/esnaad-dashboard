'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserSearch } from '@/lib/hooks/useUserSearch';
import { cn } from '@/lib/utils';
import { Check, Search, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface UserOption {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

interface UserSearchInputProps {
  value: UserOption | null;
  onChange: (value: UserOption | null) => void;
  role?: string;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingText?: string;
  addButtonText?: string;
  addManualButtonText?: string;
  confirmButtonText?: string;
  newUserFormTitle?: string;
  newUserBadgeText?: string;
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  phonePlaceholder?: string;
  emailRequired?: boolean;
  phoneRequired?: boolean;
  showNewUserBadge?: boolean;
  existingUsersHeading?: string;
}

/**
 * UserSearchInput - Reusable component for searching and selecting users with option to add new
 *
 * @example
 * ```tsx
 * // For owner selection
 * <UserSearchInput
 *   value={selectedOwner}
 *   onChange={setSelectedOwner}
 *   role="OWNER"
 *   placeholder="Search or add new owner..."
 *   newUserBadgeText="New owner - will be created on approval"
 * />
 *
 * // For contractor selection
 * <UserSearchInput
 *   value={selectedContractor}
 *   onChange={setSelectedContractor}
 *   role="CONTRACTOR"
 *   placeholder="Search or add new contractor..."
 *   emailRequired={true}
 * />
 * ```
 */
export function UserSearchInput({
  value,
  onChange,
  role,
  disabled = false,
  placeholder = 'Search or add new user...',
  searchPlaceholder = 'Search by name, email, or phone...',
  emptyMessage = 'No users found',
  loadingText = 'Searching...',
  addButtonText = 'Add New User',
  addManualButtonText = 'Add New User Manually',
  confirmButtonText = 'Confirm',
  newUserFormTitle = 'New User Details',
  newUserBadgeText = 'New user - will be created',
  nameLabel = 'Name',
  emailLabel = 'Email',
  phoneLabel = 'Phone',
  namePlaceholder = 'Full Name',
  emailPlaceholder = 'email@example.com',
  phonePlaceholder = '+966 XX XXX XXXX',
  emailRequired = false,
  phoneRequired = false,
  showNewUserBadge = true,
  existingUsersHeading = 'Existing Users',
}: UserSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, search, clearResults } = useUserSearch();

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      clearResults();
      return;
    }

    const timeoutId = setTimeout(() => {
      search(searchQuery, role);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, search, role, clearResults]);

  const handleSelectExisting = (user: { id: string; name?: string; email: string; phone?: string }) => {
    onChange({ id: user.id, name: user.name || user.email, email: user.email, phone: user.phone });
    setSearchQuery('');
    clearResults();
  };

  const handleCreateNew = () => {
    setShowNewUserForm(true);
    setSearchQuery('');
    clearResults();
  };

  const handleNewUserSubmit = () => {
    // Validate required fields
    if (!newUser.name) return;
    if (emailRequired && !newUser.email) return;
    if (phoneRequired && !newUser.phone) return;

    onChange({
      name: newUser.name,
      email: newUser.email || undefined,
      phone: newUser.phone || undefined,
    });
    setShowNewUserForm(false);
  };

  const handleCancelNewUser = () => {
    setShowNewUserForm(false);
    setNewUser({ name: '', email: '', phone: '' });
  };

  const isFormValid = () => {
    if (!newUser.name) return false;
    if (emailRequired && !newUser.email) return false;
    if (phoneRequired && !newUser.phone) return false;
    return true;
  };

  if (showNewUserForm) {
    return (
      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{newUserFormTitle}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelNewUser}
          >
            Cancel
          </Button>
        </div>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">{nameLabel} *</Label>
            <Input
              placeholder={namePlaceholder}
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">
              {emailLabel} {emailRequired ? '*' : '(optional)'}
            </Label>
            <Input
              placeholder={emailPlaceholder}
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">
              {phoneLabel} {phoneRequired ? '*' : '(optional)'}
            </Label>
            <Input
              placeholder={phonePlaceholder}
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
          </div>
        </div>
        <Button
          type="button"
          onClick={handleNewUserSubmit}
          disabled={!isFormValid()}
          className="w-full"
        >
          {confirmButtonText}
        </Button>
      </div>
    );
  }

  // If a value is already selected, show it with change option
  if (value) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
        <div>
          <p className="font-medium">{value.name}</p>
          {value.email && (
            <p className="text-xs text-muted-foreground">{value.email}</p>
          )}
          {!value.id && showNewUserBadge && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {newUserBadgeText}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="pl-9"
        />
      </div>

      {/* Search Results */}
      {isLoading && (
        <div className="p-3 text-center text-sm text-muted-foreground border rounded-md">
          {loadingText}
        </div>
      )}

      {!isLoading && searchQuery.length >= 2 && results.length === 0 && (
        <div className="p-3 text-center text-sm text-muted-foreground border rounded-md">
          {emptyMessage}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
            {existingUsersHeading}
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectExisting(user)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted transition-colors',
                  (value as UserOption | null)?.id === user.id && 'bg-muted'
                )}
              >
                <Check
                  className={cn(
                    'h-4 w-4 shrink-0',
                    (value as UserOption | null)?.id === user.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{user.name || user.email}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider with "or" */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Add New Owner Manually Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleCreateNew}
        disabled={disabled}
        className="w-full"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {addManualButtonText}
      </Button>
    </div>
  );
}
