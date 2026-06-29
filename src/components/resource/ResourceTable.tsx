import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTable } from '@/components/data-table/data-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/features/auth'
import { useServerTable } from '@/hooks/use-server-table'
import { ApiError } from '@/lib/api'

import type { ResAction, ResourceConfig } from './resource-config'
import { ResourceForm } from './ResourceForm'

function actionLabel<T>(action: ResAction<T>, row: T): string {
  return typeof action.label === 'function' ? action.label(row) : action.label
}

export function ResourceTable<T>({ config }: { config: ResourceConfig<T> }) {
  if (config.mode === 'bare') {
    return <BareResourceTable config={config} />
  }
  return <PaginatedResourceTable config={config} />
}

function PageHeader<T>({
  config,
  canWrite,
  onNew,
}: {
  config: ResourceConfig<T>
  canWrite: boolean
  onNew: () => void
}) {
  const canCreate = canWrite && Boolean(config.fields?.length)
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {config.title}
        </h2>
        {config.description && (
          <p className="text-muted-foreground text-sm">{config.description}</p>
        )}
      </div>
      {canCreate && (
        <Button onClick={onNew}>
          <Plus className="size-4" />
          New
        </Button>
      )}
    </div>
  )
}

function PaginatedResourceTable<T>({ config }: { config: ResourceConfig<T> }) {
  const { can } = useAuth()
  const canWrite = config.writePerm ? can(config.writePerm) : false
  const idKey = (config.idKey ?? 'id') as keyof T

  const table = useServerTable<T>({
    fetcher: config.service.list,
    initialSort: config.initialSort,
    initialOrder: config.initialOrder ?? 'desc',
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [pendingAction, setPendingAction] = useState<{
    action: ResAction<T>
    row: T
  } | null>(null)
  const [detailRow, setDetailRow] = useState<T | null>(null)
  const [detailData, setDetailData] = useState<T | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  const canEdit =
    canWrite && Boolean(config.fields?.length && config.service.update)
  const canDelete = canWrite && Boolean(config.service.remove)

  async function runAction(action: ResAction<T>, row: T) {
    if (action.href) {
      window.open(action.href(row), '_blank', 'noopener')
      return
    }
    if (!action.run) return
    setBusy(true)
    try {
      await action.run(row)
      const msg =
        typeof action.successMessage === 'function'
          ? action.successMessage(row)
          : (action.successMessage ?? 'Done')
      toast.success(msg)
      table.refetch()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed')
    } finally {
      setBusy(false)
      setPendingAction(null)
    }
  }

  function triggerAction(action: ResAction<T>, row: T) {
    if (action.confirmTitle && action.run) {
      setPendingAction({ action, row })
    } else {
      void runAction(action, row)
    }
  }

  async function openEdit(row: T) {
    if (config.fetchOnEdit) {
      try {
        setEditing(await config.fetchOnEdit(row))
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load')
        return
      }
    } else {
      setEditing(row)
    }
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting || !config.service.remove) return
    setBusy(true)
    try {
      const args = config.removeArgs
        ? config.removeArgs(deleting)
        : [deleting[idKey] as number | string]
      await config.service.remove(...args)
      toast.success(`${config.removeLabel ?? 'Deleted'}`)
      setDeleting(null)
      table.refetch()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  async function openDetail(row: T) {
    if (!config.detail) return
    setDetailRow(row)
    setDetailData(null)
    setDetailLoading(true)
    try {
      setDetailData(await config.detail.fetch(row))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load')
      setDetailRow(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const visibleActions = (row: T) =>
    (config.actions ?? []).filter(
      (a) => (!a.perm || can(a.perm)) && !a.hidden?.(row)
    )

  const hasRowMenu = (row: T) =>
    canEdit ||
    canDelete ||
    Boolean(config.detail) ||
    visibleActions(row).length > 0

  const columns: ColumnDef<T>[] = config.columns.map((col) => ({
    id: col.key,
    accessorKey: col.key,
    enableSorting: Boolean(col.sortable),
    header: col.sortable
      ? ({ column }) => (
          <DataTableColumnHeader column={column} title={col.header} />
        )
      : col.header,
    cell: col.cell
      ? ({ row }) => col.cell!(row.original)
      : ({ row }) => {
          const value = (row.original as Record<string, unknown>)[col.key]
          return value == null || value === '' ? '—' : String(value)
        },
  }))

  columns.push({
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original
      if (!hasRowMenu(item)) return null
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {config.detail && (
                <DropdownMenuItem onSelect={() => void openDetail(item)}>
                  <Eye className="size-4" />
                  View
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onSelect={() => void openEdit(item)}>
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {visibleActions(item).map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  variant={action.destructive ? 'destructive' : 'default'}
                  onSelect={() => triggerAction(action, item)}
                >
                  {action.icon && <action.icon className="size-4" />}
                  {actionLabel(action, item)}
                </DropdownMenuItem>
              ))}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDeleting(item)}
                  >
                    <Trash2 className="size-4" />
                    {config.removeLabel ?? 'Delete'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  })

  return (
    <div className="space-y-4">
      <PageHeader
        config={config}
        canWrite={canWrite}
        onNew={() => {
          setEditing(null)
          setFormOpen(true)
        }}
      />

      <DataTable
        columns={columns}
        data={table.data}
        loading={table.loading}
        pageCount={table.pageCount}
        pagination={table.pagination}
        onPaginationChange={table.setPagination}
        sorting={table.sorting}
        onSortingChange={table.setSorting}
        total={table.total}
        emptyMessage={
          table.error
            ? table.error.message
            : `No ${config.title.toLowerCase()}.`
        }
        toolbar={<Toolbar config={config} table={table} />}
      />

      {config.fields?.length ? (
        <ResourceForm
          config={config}
          open={formOpen}
          onOpenChange={setFormOpen}
          row={editing}
          onSaved={table.refetch}
        />
      ) : null}

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {config.removeLabel ?? 'Delete'} this {config.title.toLowerCase()}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
              disabled={busy}
            >
              {config.removeLabel ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action.confirmTitle}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (pendingAction)
                  void runAction(pendingAction.action, pendingAction.row)
              }}
              disabled={busy}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {config.detail && (
        <Dialog
          open={Boolean(detailRow)}
          onOpenChange={(open) => {
            if (!open) {
              setDetailRow(null)
              setDetailData(null)
            }
          }}
        >
          <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {detailRow ? config.detail.title(detailRow) : ''}
              </DialogTitle>
              <DialogDescription>Resource details</DialogDescription>
            </DialogHeader>
            {detailLoading || !detailData ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : (
              config.detail.render(detailData)
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface ToolbarTableState {
  search: string
  setSearch: (value: string) => void
  filters: Record<string, unknown>
  setFilter: (key: string, value: unknown) => void
}

function Toolbar<T>({
  config,
  table,
}: {
  config: ResourceConfig<T>
  table: ToolbarTableState
}) {
  if (!config.searchable && !config.filters?.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {config.searchable && (
        <Input
          placeholder={config.searchPlaceholder ?? 'Search…'}
          value={table.search}
          onChange={(e) => table.setSearch(e.target.value)}
          className="max-w-xs"
        />
      )}
      {(config.filters ?? []).map((filter) =>
        filter.type === 'select' ? (
          <Select
            key={filter.key}
            value={(table.filters[filter.key] as string) ?? 'all'}
            onValueChange={(v) =>
              table.setFilter(filter.key, v === 'all' ? undefined : v)
            }
          >
            <SelectTrigger className={filter.width ?? 'w-44'}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.label}: all</SelectItem>
              {(filter.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            key={filter.key}
            placeholder={filter.label}
            value={(table.filters[filter.key] as string) ?? ''}
            onChange={(e) =>
              table.setFilter(filter.key, e.target.value || undefined)
            }
            className={filter.width ?? 'max-w-xs'}
          />
        )
      )}
    </div>
  )
}

function BareResourceTable<T>({ config }: { config: ResourceConfig<T> }) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, unknown>>({})

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const data = await config.bareFetch!(JSON.parse(filtersKey))
        if (!cancelled) {
          setRows(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setRows([])
          setError(err instanceof ApiError ? err.message : 'Failed to load')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey])

  return (
    <div className="space-y-4">
      <PageHeader config={config} canWrite={false} onNew={() => {}} />

      {config.filters?.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {config.filters.map((filter) => (
            <Input
              key={filter.key}
              placeholder={filter.label}
              className="max-w-xs"
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  [filter.key]: e.target.value || undefined,
                }))
              }
            />
          ))}
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((col) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {config.columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row, i) => (
                <TableRow key={i}>
                  {config.columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.cell
                        ? col.cell(row)
                        : (() => {
                            const value = (row as Record<string, unknown>)[
                              col.key
                            ]
                            return value == null || value === ''
                              ? '—'
                              : String(value)
                          })()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={config.columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {error ?? `No ${config.title.toLowerCase()}.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
