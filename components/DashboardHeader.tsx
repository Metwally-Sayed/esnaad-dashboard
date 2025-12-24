import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search properties, units, tenants..."
            className="pl-9 bg-muted border-0"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full"></span>
        </Button>

        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            JD
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
