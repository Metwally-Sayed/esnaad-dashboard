'use client'

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  // Legacy props for backwards compatibility
  date?: Date
  onSelect?: (date: Date | undefined) => void
}

export function DatePicker({
  value,
  onChange,
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false
}: DatePickerProps) {
  // Support both new and legacy prop names
  const selectedDate = value || date
  const handleChange = onChange || onSelect
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}