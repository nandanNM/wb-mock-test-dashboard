import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  icon: LucideIcon
}

const STATS: Stat[] = [
  {
    label: 'Total Users',
    value: '8,492',
    delta: '+12.5%',
    trend: 'up',
    icon: Users,
  },
  {
    label: 'Revenue',
    value: '$48,210',
    delta: '+4.3%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    label: 'Active Sessions',
    value: '1,203',
    delta: '-2.1%',
    trend: 'down',
    icon: Activity,
  },
  {
    label: 'Conversion',
    value: '3.24%',
    delta: '+0.8%',
    trend: 'up',
    icon: ArrowUpRight,
  },
]

const ACTIVITY = [
  { user: 'Grace Hopper', action: 'created a new project', time: '2m ago' },
  { user: 'Alan Turing', action: 'updated billing settings', time: '1h ago' },
  { user: 'Katherine Johnson', action: 'invited 3 members', time: '3h ago' },
  { user: 'Edsger Dijkstra', action: 'deleted a workspace', time: '5h ago' },
  { user: 'Barbara Liskov', action: 'changed their password', time: '1d ago' },
]

export function DashboardPage() {
  const { me } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back, {me?.user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening across your workspace today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={cn(
                  'mt-1 flex items-center gap-1 text-xs',
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-destructive'
                )}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {stat.delta} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest actions taken by members of your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ACTIVITY.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.user}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {item.action}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {item.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick stats</CardTitle>
            <CardDescription>This is placeholder content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Open tickets', value: '12' },
              { label: 'Pending invites', value: '4' },
              { label: 'Storage used', value: '68%' },
              { label: 'Uptime', value: '99.98%' },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
