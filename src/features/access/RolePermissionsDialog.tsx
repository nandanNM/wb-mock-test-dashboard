import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api'
import { rbacService, type Permission, type Role } from '@/services'

export function RolePermissionsDialog({
  open,
  onOpenChange,
  role,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSaved: () => void
}) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = role?.name === 'super_admin'

  useEffect(() => {
    if (!open || !role) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [all, detail] = await Promise.all([
          rbacService.listPermissions(),
          rbacService.getRole(role.id),
        ])
        if (cancelled) return
        setPermissions(all)
        setSelected(new Set(detail.permissions.map((p) => p.id)))
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof ApiError ? err.message : 'Failed to load')
          onOpenChange(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function save() {
    if (!role) return
    setSaving(true)
    try {
      await rbacService.setRolePermissions(role.id, Array.from(selected))
      toast.success('Permissions updated')
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Permissions · {role?.name}</DialogTitle>
          <DialogDescription>
            {isSuperAdmin
              ? 'The super_admin role has every permission by design and can’t be edited.'
              : 'Select the permissions granted by this role.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55svh] space-y-1 overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          ) : permissions.length ? (
            permissions.map((perm) => (
              <label
                key={perm.id}
                className="hover:bg-accent flex cursor-pointer items-start gap-3 rounded-md p-2"
              >
                <Checkbox
                  className="mt-0.5"
                  checked={selected.has(perm.id)}
                  disabled={isSuperAdmin}
                  onCheckedChange={() => toggle(perm.id)}
                />
                <div className="min-w-0">
                  <p className="font-mono text-sm">{perm.name}</p>
                  {perm.description && (
                    <p className="text-muted-foreground text-xs">
                      {perm.description}
                    </p>
                  )}
                </div>
              </label>
            ))
          ) : (
            <p className="text-muted-foreground p-2 text-sm">
              No permissions defined yet.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving || isSuperAdmin}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
