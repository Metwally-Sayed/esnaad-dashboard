'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export interface FormDialogProps {
  /** Dialog open state */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Optional dialog description */
  description?: string
  /** Form content to render */
  children: React.ReactNode
  /** Optional footer content (if not provided, default footer with Cancel/Submit is shown) */
  footer?: React.ReactNode
  /** Submit button text */
  submitText?: string
  /** Cancel button text */
  cancelText?: string
  /** Loading state */
  isLoading?: boolean
  /** Disabled state for submit button */
  isSubmitDisabled?: boolean
  /** Submit handler (only used if footer is not provided) */
  onSubmit?: () => void
  /** Cancel handler (only used if footer is not provided) */
  onCancel?: () => void
  /** Submit button variant */
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /** Maximum width for dialog */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  /** Hide default footer */
  hideFooter?: boolean
}

/**
 * Reusable Form Dialog Component
 *
 * Usage:
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Create Item"
 *   description="Fill in the details below"
 *   submitText="Create"
 *   onSubmit={handleSubmit}
 *   isLoading={isSubmitting}
 * >
 *   <form>
 *     <Input name="title" />
 *     <Textarea name="description" />
 *   </form>
 * </FormDialog>
 * ```
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  isSubmitDisabled = false,
  onSubmit,
  onCancel,
  submitVariant = 'default',
  maxWidth = 'md',
  hideFooter = false,
}: FormDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    }
  }

  const maxWidthClasses = {
    sm: 'sm:max-w-[425px]',
    md: 'sm:max-w-[525px]',
    lg: 'sm:max-w-[625px]',
    xl: 'sm:max-w-[725px]',
    '2xl': 'sm:max-w-[825px]',
    '3xl': 'sm:max-w-[925px]',
    '4xl': 'sm:max-w-[1025px]',
    '5xl': 'sm:max-w-[1125px]',
    full: 'sm:max-w-full',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {!hideFooter && (
          <DialogFooter>
            {footer || (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  variant={submitVariant}
                  onClick={handleSubmit}
                  disabled={isLoading || isSubmitDisabled}
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {submitText}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
