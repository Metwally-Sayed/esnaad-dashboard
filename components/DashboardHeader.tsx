'use client';

import { useState } from 'react';
import { Search, ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { NotificationBell } from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

export function DashboardHeader() {
  const { user, logout, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get user display name (prefer name, fallback to email username)
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) {
      // Extract username from email (part before @)
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get user initials for avatar
  const getInitials = (name: string | null | undefined) => {
    const displayName = name || getDisplayName();
    if (!displayName || displayName === 'User') return 'U';
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Search - Responsive width */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 bg-muted border-0 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Right section - Responsive spacing */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
        {/* Notifications - Hide on smallest screens */}
        <div className="hidden sm:inline-flex">
          <NotificationBell />
        </div>

        {/* User Menu - Responsive */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 flex items-center gap-1 md:gap-2 px-1 md:px-2">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-medium">
                {getInitials(user?.name)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground hidden sm:inline-block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <Badge className="mt-2 w-fit" variant={isAdmin ? 'default' : 'secondary'}>
                  <Shield className="mr-1 h-3 w-3" />
                  {isAdmin ? 'Admin' : 'Owner'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
