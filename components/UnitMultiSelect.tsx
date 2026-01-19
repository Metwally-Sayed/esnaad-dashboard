'use client';

import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface UnitOption {
  id: string;
  unitNumber: string;
  buildingName?: string;
  project?: {
    id: string;
    name: string;
  };
}

interface UnitMultiSelectProps {
  units: UnitOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingText?: string;
}

/**
 * UnitMultiSelect - Reusable multi-select component for units
 *
 * @example
 * ```tsx
 * <UnitMultiSelect
 *   units={myUnits}
 *   selectedIds={selectedIds}
 *   onChange={setSelectedIds}
 *   isLoading={isLoading}
 *   placeholder="Select units to transfer..."
 * />
 * ```
 */
export function UnitMultiSelect({
  units,
  selectedIds,
  onChange,
  isLoading = false,
  disabled = false,
  placeholder = 'Select units...',
  searchPlaceholder = 'Search units...',
  emptyMessage = 'No units found.',
  loadingText = 'Loading units...',
}: UnitMultiSelectProps) {
  const selectedUnits = units.filter((u) => selectedIds.includes(u.id));

  const toggleUnit = (unitId: string) => {
    if (selectedIds.includes(unitId)) {
      onChange(selectedIds.filter((id) => id !== unitId));
    } else {
      onChange([...selectedIds, unitId]);
    }
  };

  const removeUnit = (unitId: string) => {
    onChange(selectedIds.filter((id) => id !== unitId));
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isLoading || disabled}
          >
            {isLoading
              ? loadingText
              : selectedIds.length === 0
              ? placeholder
              : `${selectedIds.length} unit(s) selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {units.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    onSelect={() => toggleUnit(unit.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedIds.includes(unit.id)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{unit.unitNumber}</span>
                      {(unit.buildingName || unit.project) && (
                        <span className="text-xs text-muted-foreground">
                          {[unit.buildingName, unit.project?.name]
                            .filter(Boolean)
                            .join(' • ')}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUnits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUnits.map((unit) => (
            <Badge
              key={unit.id}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => removeUnit(unit.id)}
            >
              {unit.unitNumber}
              <span className="ml-1 text-muted-foreground">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
