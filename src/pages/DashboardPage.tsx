import {
  BookOpen,
  ClipboardList,
  ListChecks,
  Swords,
  Users as UsersIcon,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth'
import { formatDateTime } from '@/lib/format'
import {
  auditService,
  battlesService,
  chaptersService,
  questionsService,
  subjectsService,
  testsService,
  usersService,
  type AuditRecord,
} from '@/services'

interface Metric {
  key: string
  label: string
  perm: string
  icon: LucideIcon
  fetchTotal: () => Promise<number>
}

const METRICS: Metric[] = [
  {
    key: 'users',
    label: 'Users',
    perm: 'users:read',
    icon: UsersIcon,
    fetchTotal: () => usersService.list({ limit: 1 }).then((r) => r.total),
  },
  {
    key: 'subjects',
    label: 'Subjects',
    perm: 'subjects:read',
    icon: BookOpen,
    fetchTotal: () => subjectsService.list({ limit: 1 }).then((r) => r.total),
  },
  {
    key: 'chapters',
    label: 'Chapters',
    perm: 'chapters:read',
    icon: ListChecks,
    fetchTotal: () => chaptersService.list({ limit: 1 }).then((r) => r.total),
  },
  {
    key: 'questions',
    label: 'Questions',
    perm: 'questions:read',
    icon: ListChecks,
    fetchTotal: () => questionsService.list({ limit: 1 }).then((r) => r.total),
  },
  {
    key: 'tests',
    label: 'Tests',
    perm: 'tests:read',
    icon: ClipboardList,
    fetchTotal: () => testsService.list({ limit: 1 }).then((r) => r.total),
  },
  {
    key: 'battles',
    label: 'Battles',
    perm: 'battles:read',
    icon: Swords,
    fetchTotal: () => battlesService.list({ limit: 1 }).then((r) => r.total),
  },
]

export function DashboardPage() {
  const { me, can } = useAuth()

  const metrics = METRICS.filter((m) => can(m.perm))
  const canSeeAudit = can('audit:read')

  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [countsLoading, setCountsLoading] = useState(metrics.length > 0)
  const [events, setEvents] = useState<AuditRecord[]>([])
  const [eventsLoading, setEventsLoading] = useState(canSeeAudit)

  useEffect(() => {
    let cancelled = false

    const loadCounts = async () => {
      if (metrics.length === 0) return
      const entries = await Promise.all(
        metrics.map(async (m) => {
          try {
            return [m.key, await m.fetchTotal()] as const
          } catch {
            return [m.key, null] as const
          }
        })
      )
      if (!cancelled) {
        setCounts(Object.fromEntries(entries))
        setCountsLoading(false)
      }
    }

    const loadEvents = async () => {
      if (!canSeeAudit) return
      try {
        const records = await auditService.list({ limit: 8 })
        if (!cancelled) setEvents(records)
      } catch {
        if (!cancelled) setEvents([])
      } finally {
        if (!cancelled) setEventsLoading(false)
      }
    }

    void loadCounts()
    void loadEvents()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back, {me?.user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-muted-foreground">
          An overview of the platform you administer.
        </p>
      </div>

      {metrics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => (
            <Card key={metric.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <metric.icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                {countsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {counts[metric.key] != null
                      ? counts[metric.key]!.toLocaleString()
                      : '—'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {canSeeAudit && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                Latest events from the audit log.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : events.length ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Badge variant="outline">{event.event_type}</Badge>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {event.user_id ? `User ${event.user_id}` : 'System'} ·{' '}
                        {event.ip}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatDateTime(event.occurred_at)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No recent events.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className={canSeeAudit ? '' : 'lg:col-span-3'}>
          <CardHeader>
            <CardTitle>Your access</CardTitle>
            <CardDescription>
              Roles and permissions on your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2 text-sm">Roles</p>
              <div className="flex flex-wrap gap-1.5">
                {(me?.roles ?? []).length ? (
                  me!.roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-sm">
                Permissions ({me?.permissions.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(me?.permissions ?? []).slice(0, 24).map((perm) => (
                  <Badge key={perm} variant="outline" className="font-mono">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
