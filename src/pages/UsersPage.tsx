import type { ColumnDef } from '@tanstack/react-table'
import {
  Ban,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Shield,
  Trash2,
  UserX,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'
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
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserRolesDialog } from '@/features/access/UserRolesDialog'
import { useAuth } from '@/features/auth'
import { useServerTable } from '@/hooks/use-server-table'
import { ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { usersService, type AdminUser, type UserStatus } from '@/services'

const STATUS_VARIANT: Record<
  UserStatus,
  'success' | 'secondary' | 'destructive'
> = {
  active: 'success',
  suspended: 'secondary',
  banned: 'destructive',
}

type ReasonAction = 'ban' | 'suspend'

export function UsersPage() {
  const { can, hasRole } = useAuth()
  const canModerate = can('users:ban')
  const canDelete = can('users:delete')
  const canManageRoles = hasRole('super_admin')

  const table = useServerTable<AdminUser>({
    fetcher: usersService.list,
    initialSort: 'created_at',
    initialOrder: 'desc',
  })

  const [reasonTarget, setReasonTarget] = useState<{
    user: AdminUser
    action: ReasonAction
  } | null>(null)
  const [reason, setReason] = useState('')
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const [rolesUser, setRolesUser] = useState<AdminUser | null>(null)
  const [busy, setBusy] = useState(false)

  async function reinstate(user: AdminUser) {
    try {
      await usersService.reinstate(user.id)
      toast.success(`${user.name} reinstated`)
      table.refetch()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed')
    }
  }

  async function submitReason() {
    if (!reasonTarget) return
    setBusy(true)
    try {
      const { user, action } = reasonTarget
      if (action === 'ban') await usersService.ban(user.id, reason)
      else await usersService.suspend(user.id, reason)
      toast.success(`${user.name} ${action === 'ban' ? 'banned' : 'suspended'}`)
      setReasonTarget(null)
      setReason('')
      table.refetch()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await usersService.remove(deleting.id)
      toast.success('User deleted')
      setDeleting(null)
      table.refetch()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  const columns = ((): ColumnDef<AdminUser>[] => {
    const cols: ColumnDef<AdminUser>[] = [
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status
          return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
        },
      },
      {
        id: 'points',
        accessorKey: 'points',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Points" />
        ),
        cell: ({ row }) => row.original.points ?? 0,
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined" />
        ),
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ]

    if (canModerate || canDelete || canManageRoles) {
      cols.push({
        id: 'actions',
        cell: ({ row }) => {
          const user = row.original
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
                  {canModerate && user.status === 'active' && (
                    <>
                      <DropdownMenuItem
                        onSelect={() =>
                          setReasonTarget({ user, action: 'suspend' })
                        }
                      >
                        <UserX className="size-4" />
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          setReasonTarget({ user, action: 'ban' })
                        }
                      >
                        <Ban className="size-4" />
                        Ban
                      </DropdownMenuItem>
                    </>
                  )}
                  {canModerate && user.status !== 'active' && (
                    <DropdownMenuItem onSelect={() => void reinstate(user)}>
                      <RotateCcw className="size-4" />
                      Reinstate
                    </DropdownMenuItem>
                  )}
                  {canManageRoles && (
                    <DropdownMenuItem onSelect={() => setRolesUser(user)}>
                      <Shield className="size-4" />
                      Manage roles
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleting(user)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      })
    }

    return cols
  })()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="text-muted-foreground text-sm">
          Manage members and moderate accounts.
        </p>
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
        emptyMessage={table.error ? table.error.message : 'No users found.'}
        selectable
        getRowId={(u) => u.id}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Filter users…"
              value={table.search}
              onChange={(e) => table.setSearch(e.target.value)}
              className="h-8 w-40 lg:w-56"
            />
            <DataTableFacetedFilter
              title="Status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Banned', value: 'banned' },
              ]}
              selected={((table.filters.status as string) ?? '')
                .split(',')
                .filter(Boolean)}
              onChange={(values) =>
                table.setFilter(
                  'status',
                  values.length ? values.join(',') : undefined
                )
              }
            />
          </div>
        }
      />

      <Dialog
        open={Boolean(reasonTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setReasonTarget(null)
            setReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reasonTarget?.action === 'ban' ? 'Ban' : 'Suspend'} user
            </DialogTitle>
            <DialogDescription>
              This revokes all of {reasonTarget?.user.name}&apos;s sessions and
              takes effect within seconds.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Why is this action being taken?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReasonTarget(null)
                setReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy || reason.trim().length === 0}
              onClick={() => void submitReason()}
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{' '}
              <span className="text-foreground font-medium">
                {deleting?.name}
              </span>
              . This action cannot be undone.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserRolesDialog
        open={Boolean(rolesUser)}
        onOpenChange={(open) => !open && setRolesUser(null)}
        user={rolesUser}
        onSaved={table.refetch}
      />
    </div>
  )
}
