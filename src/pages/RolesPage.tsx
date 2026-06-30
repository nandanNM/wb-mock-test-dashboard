import { KeyRound, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EntityFormDialog } from '@/features/access/EntityFormDialog'
import { RolePermissionsDialog } from '@/features/access/RolePermissionsDialog'
import { ApiError } from '@/lib/api'
import { rbacService, type Role } from '@/services'

const SYSTEM_ROLES = new Set(['super_admin', 'admin', 'user', 'teacher'])

export function RolesPage() {
  const [items, setItems] = useState<Role[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [permRole, setPermRole] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)
  const [busy, setBusy] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = () => setReloadKey((k) => k + 1)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const roles = await rbacService.listRoles()
        if (cancelled) return
        setItems(roles)
        setError(null)
        // Fetch permission counts (roles are few).
        const entries = await Promise.all(
          roles.map(async (r) => {
            try {
              const detail = await rbacService.getRole(r.id)
              return [r.id, detail.permissions.length] as const
            } catch {
              return [r.id, -1] as const
            }
          })
        )
        if (!cancelled) setCounts(Object.fromEntries(entries))
      } catch (err) {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await rbacService.deleteRole(deleting.id)
      toast.success('Role deleted')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Roles</h2>
          <p className="text-muted-foreground text-sm">
            Group permissions into roles and assign them to users.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" />
          New role
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : items.length ? (
              items.map((role) => {
                const isSystem = SYSTEM_ROLES.has(role.name)
                const count = counts[role.id]
                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium">
                        {role.name}
                        {isSystem && (
                          <Badge variant="secondary" className="font-normal">
                            system
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || '—'}
                    </TableCell>
                    <TableCell>
                      {count === undefined ? '…' : count < 0 ? '—' : count}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setPermRole(role)}>
                            <KeyRound className="size-4" />
                            Edit permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditing(role)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={isSystem}
                            onSelect={() => setDeleting(role)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-24 text-center"
                >
                  {error ?? 'No roles yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entity="role"
        initial={editing}
        namePlaceholder="analyst"
        nameDisabled={editing ? SYSTEM_ROLES.has(editing.name) : false}
        onSubmit={(values) =>
          editing
            ? rbacService.updateRole(editing.id, values)
            : rbacService.createRole(values)
        }
        onSaved={reload}
      />

      <RolePermissionsDialog
        open={Boolean(permRole)}
        onOpenChange={(open) => !open && setPermRole(null)}
        role={permRole}
        onSaved={reload}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting{' '}
              <span className="text-foreground font-medium">
                {deleting?.name}
              </span>{' '}
              removes it from every user who has it. This cannot be undone.
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
    </div>
  )
}
