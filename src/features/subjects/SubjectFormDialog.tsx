import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { subjectsService, type Subject } from '@/services'

const schema = z.object({
  name_en: z.string().min(1, 'English name is required'),
  name_bn: z.string().min(1, 'Bangla name is required'),
  position: z.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

interface SubjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject?: Subject | null
  onSaved: () => void
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
  onSaved,
}: SubjectFormDialogProps) {
  const isEdit = Boolean(subject)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name_en: '', name_bn: '', position: 0 },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name_en: subject?.name_en ?? '',
        name_bn: subject?.name_bn ?? '',
        position: subject?.position ?? 0,
      })
    }
  }, [open, subject, form])

  async function onSubmit(values: FormValues) {
    try {
      if (subject) {
        await subjectsService.update(subject.id, values)
        toast.success('Subject updated')
      } else {
        await subjectsService.create(values)
        toast.success('Subject created')
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const [field, message] of Object.entries(err.details)) {
          form.setError(field as keyof FormValues, { message })
        }
      }
      toast.error(
        err instanceof ApiError ? err.message : 'Something went wrong'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit subject' : 'New subject'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the subject details.'
              : 'Create a new subject for the catalog.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="General Knowledge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_bn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Bangla)</FormLabel>
                  <FormControl>
                    <Input placeholder="সাধারণ জ্ঞান" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
