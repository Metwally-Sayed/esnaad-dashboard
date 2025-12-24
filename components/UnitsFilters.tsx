import { Search } from 'lucide-react';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function UnitsFilters() {
  return (
    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search units..."
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Status Filter */}
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="owned">Owned</SelectItem>
          <SelectItem value="not-owned">Not Owned</SelectItem>
        </SelectContent>
      </Select>

      {/* Unit Type Filter */}
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Unit Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="studio">Studio</SelectItem>
          <SelectItem value="1bed">1 Bedroom</SelectItem>
          <SelectItem value="2bed">2 Bedroom</SelectItem>
          <SelectItem value="3bed">3 Bedroom</SelectItem>
        </SelectContent>
      </Select>

      {/* Building Filter */}
      <Select defaultValue="all">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Building" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Buildings</SelectItem>
          <SelectItem value="riverside">Riverside Apartments</SelectItem>
          <SelectItem value="downtown">Downtown Plaza</SelectItem>
          <SelectItem value="sunset">Sunset Heights</SelectItem>
          <SelectItem value="oak">Oak Street Residences</SelectItem>
          <SelectItem value="harbor">Harbor View Complex</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
