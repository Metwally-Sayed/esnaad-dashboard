'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, AlertCircle, Home } from 'lucide-react'
import { useUnit, useUnitMutations } from '@/lib/hooks/use-units'
import { useProjects } from '@/lib/hooks/use-projects'
import { CreateUnitDto, UpdateUnitDto } from '@/lib/types/api.types'
import { toast } from 'sonner'

const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required').max(50),
  buildingName: z.string().optional(),
  floor: z.union([z.number(), z.string()]).optional(),
  area: z.union([z.number(), z.string()]).optional(),
  bedrooms: z.union([z.number(), z.string()]).optional(),
  bathrooms: z.union([z.number(), z.string()]).optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
})

type UnitFormData = z.infer<typeof unitSchema>

interface UnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId?: string | null
  onSave?: () => void
}

export function UnitDialog({
  open,
  onOpenChange,
  unitId,
  onSave
}: UnitDialogProps) {
  const { unit, isLoading: isLoadingUnit } = useUnit(unitId || undefined)
  const { createUnit, updateUnit, isCreating, isUpdating, error } = useUnitMutations()
  const { projects } = useProjects({ limit: 100 }) // Load all projects for selection

  const isEditMode = !!unitId
  const isLoading = isCreating || isUpdating

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitNumber: '',
      buildingName: '',
      floor: undefined,
      area: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      description: '',
      projectId: 'none',
    },
  })

  // Load unit data when editing
  useEffect(() => {
    if (unit && isEditMode) {
      form.reset({
        unitNumber: unit.unitNumber,
        buildingName: unit.buildingName || '',
        floor: unit.floor || undefined,
        area: unit.area || undefined,
        bedrooms: unit.bedrooms || undefined,
        bathrooms: unit.bathrooms || undefined,
        description: unit.description || '',
        projectId: unit.projectId || 'none',
      })
    }
  }, [unit, isEditMode, form])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  const onSubmit = async (data: UnitFormData) => {
    try {
      const unitData = {
        unitNumber: data.unitNumber,
        buildingName: data.buildingName || undefined,
        floor: data.floor ? Number(data.floor) : undefined,
        area: data.area ? Number(data.area) : undefined,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        description: data.description || undefined,
        projectId: data.projectId === "none" ? undefined : data.projectId || undefined,
      }

      if (isEditMode && unitId) {
        await updateUnit(unitId, unitData as UpdateUnitDto)
        toast.success('Unit updated successfully')
      } else {
        await createUnit(unitData as CreateUnitDto)
        toast.success('Unit created successfully')
      }

      onOpenChange(false)
      onSave?.()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} unit`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {isEditMode ? 'Edit Unit' : 'Add New Unit'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the unit details below'
              : 'Fill in the details to create a new unit'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Unit Number */}
              <FormField
                control={form.control}
                name="unitNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A-101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Building Name */}
              <FormField
                control={form.control}
                name="buildingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tower A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Floor */}
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Area */}
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq m)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 75.5"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bedrooms */}
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bathrooms */}
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the unit..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description or notes about the unit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingUnit}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Unit' : 'Create Unit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}