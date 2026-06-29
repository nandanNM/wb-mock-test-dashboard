import { ExternalLink, ScrollText } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'sonner'

import { NAV_ENTRIES } from '@/config/resources'
import { env } from '@/config/env'
import { useAuth } from '@/features/auth'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'

export function Sidebar({ className }: { className?: string }) {
  const { can } = useAuth()

  const items = NAV_ENTRIES.filter(
    (item) => !item.readPerm || can(item.readPerm)
  )

  const showLogs = Boolean(env.logsUrl) && can('audit:read')

  function openLogs() {
    if (env.logsUser || env.logsPassword) {
      toast.info('Backend logs — sign in required', {
        description: `Username: ${env.logsUser || '—'} · Password: ${
          env.logsPassword || '—'
        }`,
        duration: 10000,
      })
    }
    window.open(env.logsUrl, '_blank', 'noopener,noreferrer')
  }

  const itemClass =
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors'

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col border-r',
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md font-semibold">
          A
        </div>
        <span className="truncate font-semibold">{env.appName}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.dashboard}
            className={({ isActive }) =>
              cn(
                itemClass,
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}

        {showLogs && (
          <button
            type="button"
            onClick={openLogs}
            className={cn(
              itemClass,
              'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground w-full'
            )}
          >
            <ScrollText className="size-4" />
            Logs
            <ExternalLink className="ml-auto size-3.5 opacity-60" />
          </button>
        )}
      </nav>

      <div className="text-muted-foreground border-t p-4 text-xs">
        v0.0.0 · {env.isProd ? 'production' : 'development'}
      </div>
    </aside>
  )
}
