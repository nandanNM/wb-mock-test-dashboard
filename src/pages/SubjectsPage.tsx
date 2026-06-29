import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SubjectFormDialog } from '@/features/subjects/SubjectFormDialog'
import { useAuth } from '@/features/auth'
import { useServerTable } from '@/hooks/use-server-table'
import { ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { subjectsService, type Subject } from '@/services'

export function SubjectsPage() {
  const { can } = useAuth()
  const canManage = can('subjects:manage')

  const table = useServerTable<Subject>({
    fetcher: subjectsService.list,
    initialSort: 'position',
    initialOrder: 'asc',
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [deleting, setDeleting] = useState<Subject | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(subject: Subject) {
    setEditing(subject)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await subjectsService.remove(deleting.id)
      toast.success('Subject deleted')
      setDeleting(null)
      table.refetch()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete')
    } finally {
      setDeletingBusy(false)
    }
  }

  const columns = ((): ColumnDef<Subject>[] => {
    const cols: ColumnDef<Subject>[] = [
      {
        id: 'name',
        accessorKey: 'name_en',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name (EN)" />
        ),
      },
      {
        accessorKey: 'name_bn',
        header: 'Name (BN)',
        enableSorting: false,
      },
      {
        id: 'position',
        accessorKey: 'position',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Position" />
        ),
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ]

    if (canManage) {
      cols.push({
        id: 'actions',
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => openEdit(row.original)}>
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleting(row.original)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      })
    }

    return cols
  })()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Subjects</h2>
          <p className="text-muted-foreground text-sm">
            Manage the subject catalog.
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New subject
          </Button>
        )}
      </div>

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
        emptyMessage={table.error ? table.error.message : 'No subjects yet.'}
        toolbar={
          <Input
            placeholder="Search subjects…"
            value={table.search}
            onChange={(e) => table.setSearch(e.target.value)}
            className="max-w-xs"
          />
        }
      />

      <SubjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subject={editing}
        onSaved={table.refetch}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{' '}
              <span className="text-foreground font-medium">
                {deleting?.name_en}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
              disabled={deletingBusy}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
