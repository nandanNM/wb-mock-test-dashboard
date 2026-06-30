import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api'

interface FormValues {
  name: string
  description: string
}

interface EntityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Singular entity noun, e.g. "permission" or "role". */
  entity: string
  initial?: { name: string; description?: string } | null
  namePlaceholder?: string
  nameDisabled?: boolean
  onSubmit: (values: FormValues) => Promise<unknown>
  onSaved: () => void
}

export function EntityFormDialog({
  open,
  onOpenChange,
  entity,
  initial,
  namePlaceholder,
  nameDisabled,
  onSubmit,
  onSaved,
}: EntityFormDialogProps) {
  const isEdit = Boolean(initial)
  const form = useForm<FormValues>({
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  async function handleSubmit(values: FormValues) {
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
      })
      toast.success(`${entity} ${isEdit ? 'updated' : 'created'}`)
      onOpenChange(false)
      onSaved()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) {
          for (const [field, message] of Object.entries(err.details)) {
            if (field === 'name' || field === 'description') {
              form.setError(field, { message })
            }
          }
        }
        toast.error(err.message)
      } else {
        toast.error('Something went wrong')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">
            {isEdit ? `Edit ${entity}` : `New ${entity}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? `Update this ${entity}.` : `Create a new ${entity}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entity-name">Name</Label>
            <Input
              id="entity-name"
              placeholder={namePlaceholder}
              disabled={nameDisabled}
              {...form.register('name', { required: 'Name is required' })}
            />
            {nameDisabled && (
              <p className="text-muted-foreground text-xs">
                System {entity} names can&apos;t be changed.
              </p>
            )}
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity-description">Description</Label>
            <Textarea
              id="entity-description"
              placeholder="Optional"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-destructive text-sm">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEdit ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
