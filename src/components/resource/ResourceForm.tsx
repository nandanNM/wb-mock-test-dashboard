import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api'

import type { ResField, ResourceConfig } from './resource-config'

type Values = Record<string, unknown>

interface OptionRow {
  position: number
  body_en: string
  body_bn: string
  is_correct: boolean
}

function emptyOption(position: number): OptionRow {
  return { position, body_en: '', body_bn: '', is_correct: position === 0 }
}

function buildDefaults(fields: ResField[], row: Values | null): Values {
  const defaults: Values = {}
  for (const field of fields) {
    const existing = row?.[field.name]
    switch (field.type) {
      case 'number':
        defaults[field.name] = typeof existing === 'number' ? existing : 0
        break
      case 'checkbox':
        defaults[field.name] = Boolean(existing)
        break
      case 'number-csv':
        defaults[field.name] = Array.isArray(existing) ? existing : []
        break
      case 'options':
        defaults[field.name] =
          Array.isArray(existing) && existing.length
            ? (existing as OptionRow[]).map((o, i) => ({
                position: i,
                body_en: o.body_en,
                body_bn: o.body_bn,
                is_correct: o.is_correct,
              }))
            : [emptyOption(0), emptyOption(1)]
        break
      default:
        defaults[field.name] = existing != null ? String(existing) : ''
    }
  }
  return defaults
}

function OptionsEditor({
  value,
  onChange,
}: {
  value: OptionRow[]
  onChange: (next: OptionRow[]) => void
}) {
  const reindex = (rows: OptionRow[]) =>
    rows.map((row, i) => ({ ...row, position: i }))

  return (
    <div className="space-y-2">
      {value.map((opt, i) => (
        <div key={i} className="flex items-start gap-2 rounded-md border p-2">
          <label className="mt-2 flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="correct-option"
              checked={opt.is_correct}
              onChange={() =>
                onChange(
                  value.map((o, idx) => ({ ...o, is_correct: idx === i }))
                )
              }
            />
            <span className="sr-only">Correct</span>
          </label>
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Input
              placeholder="Option (EN)"
              value={opt.body_en}
              onChange={(e) =>
                onChange(
                  value.map((o, idx) =>
                    idx === i ? { ...o, body_en: e.target.value } : o
                  )
                )
              }
            />
            <Input
              placeholder="Option (BN)"
              value={opt.body_bn}
              onChange={(e) =>
                onChange(
                  value.map((o, idx) =>
                    idx === i ? { ...o, body_bn: e.target.value } : o
                  )
                )
              }
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            disabled={value.length <= 2}
            onClick={() =>
              onChange(reindex(value.filter((_, idx) => idx !== i)))
            }
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Remove option</span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, emptyOption(value.length)])}
      >
        <Plus className="size-4" />
        Add option
      </Button>
      <p className="text-muted-foreground text-xs">
        At least 2 options; select the radio for the correct one.
      </p>
    </div>
  )
}

interface ResourceFormProps<T> {
  config: ResourceConfig<T>
  open: boolean
  onOpenChange: (open: boolean) => void
  row: T | null
  onSaved: () => void
}

export function ResourceForm<T>({
  config,
  open,
  onOpenChange,
  row,
  onSaved,
}: ResourceFormProps<T>) {
  const fields = config.fields ?? []
  const isEdit = row !== null
  const idKey = (config.idKey ?? 'id') as keyof T

  const form = useForm<Values>({
    defaultValues: buildDefaults(fields, row as Values | null),
  })

  useEffect(() => {
    if (open) {
      form.reset(buildDefaults(fields, row as Values | null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, row])

  async function onSubmit(values: Values) {
    // Validate options fields client-side.
    for (const field of fields) {
      if (field.type === 'options') {
        const opts = (values[field.name] as OptionRow[]) ?? []
        if (opts.length < 2) {
          toast.error('At least 2 options are required')
          return
        }
        if (opts.filter((o) => o.is_correct).length !== 1) {
          toast.error('Exactly one option must be marked correct')
          return
        }
      }
    }

    const payload: Values = {}
    for (const field of fields) {
      if (isEdit && field.createOnly) continue
      payload[field.name] = values[field.name]
    }

    try {
      if (row) {
        await config.service.update?.(row[idKey] as number | string, payload)
        toast.success(`${config.title} updated`)
      } else {
        await config.service.create?.(payload)
        toast.success(`${config.title} created`)
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const [field, message] of Object.entries(err.details)) {
          form.setError(field, { message })
        }
      }
      toast.error(
        err instanceof ApiError ? err.message : 'Something went wrong'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${config.title}` : `New ${config.title}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the ${config.title.toLowerCase()} details.`
              : `Create a new ${config.title.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields
            .filter((field) => !(isEdit && field.createOnly))
            .map((field) => (
              <Controller
                key={field.name}
                control={form.control}
                name={field.name}
                rules={{
                  required:
                    field.required && field.type !== 'checkbox'
                      ? `${field.label} is required`
                      : false,
                }}
                render={({ field: f, fieldState }) => (
                  <div className="space-y-2">
                    {field.type !== 'checkbox' && (
                      <Label htmlFor={field.name}>{field.label}</Label>
                    )}

                    {field.type === 'textarea' && (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        value={(f.value as string) ?? ''}
                        onChange={f.onChange}
                      />
                    )}

                    {field.type === 'number' && (
                      <Input
                        id={field.name}
                        type="number"
                        placeholder={field.placeholder}
                        value={(f.value as number) ?? 0}
                        onChange={(e) =>
                          f.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    )}

                    {field.type === 'number-csv' && (
                      <Input
                        id={field.name}
                        placeholder="e.g. 1, 2, 3"
                        value={((f.value as number[]) ?? []).join(', ')}
                        onChange={(e) =>
                          f.onChange(
                            e.target.value
                              .split(',')
                              .map((s) => Number(s.trim()))
                              .filter((n) => Number.isFinite(n))
                          )
                        }
                      />
                    )}

                    {field.type === 'select' && (
                      <Select
                        value={(f.value as string) || ''}
                        onValueChange={f.onChange}
                      >
                        <SelectTrigger id={field.name} className="w-full">
                          <SelectValue
                            placeholder={field.placeholder ?? 'Select…'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options ?? []).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Checkbox
                          checked={Boolean(f.value)}
                          onCheckedChange={(c) => f.onChange(Boolean(c))}
                        />
                        {field.label}
                      </label>
                    )}

                    {field.type === 'options' && (
                      <OptionsEditor
                        value={(f.value as OptionRow[]) ?? []}
                        onChange={f.onChange}
                      />
                    )}

                    {(field.type === 'text' || field.type === undefined) && (
                      <Input
                        id={field.name}
                        placeholder={field.placeholder}
                        value={(f.value as string) ?? ''}
                        onChange={f.onChange}
                      />
                    )}

                    {field.description && (
                      <p className="text-muted-foreground text-xs">
                        {field.description}
                      </p>
                    )}
                    {fieldState.error && (
                      <p className="text-destructive text-sm">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            ))}

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
