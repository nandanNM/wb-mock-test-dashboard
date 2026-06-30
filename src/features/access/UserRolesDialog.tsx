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
import {
  rbacService,
  usersService,
  type AdminUser,
  type Role,
} from '@/services'

export function UserRolesDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSaved: () => void
}) {
  const [roles, setRoles] = useState<Role[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [allRoles, detail] = await Promise.all([
          rbacService.listRoles(),
          usersService.get(user.id),
        ])
        if (cancelled) return
        setRoles(allRoles)
        setSelected(new Set(detail.roles))
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
  }, [open, user])

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function save() {
    if (!user) return
    setSaving(true)
    try {
      await usersService.setRoles(user.id, Array.from(selected))
      toast.success('Roles updated')
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage roles · {user?.name}</DialogTitle>
          <DialogDescription>
            Assign roles to this user. Changes apply on their next token refresh
            (≤10 min) or re-login.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55svh] space-y-1 overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          ) : roles.length ? (
            roles.map((role) => (
              <label
                key={role.id}
                className="hover:bg-accent flex cursor-pointer items-start gap-3 rounded-md p-2"
              >
                <Checkbox
                  className="mt-0.5"
                  checked={selected.has(role.name)}
                  onCheckedChange={() => toggle(role.name)}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{role.name}</p>
                  {role.description && (
                    <p className="text-muted-foreground text-xs">
                      {role.description}
                    </p>
                  )}
                </div>
              </label>
            ))
          ) : (
            <p className="text-muted-foreground p-2 text-sm">
              No roles defined.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
