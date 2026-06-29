import { BookOpen, LayoutDashboard, Settings, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { env } from '@/config/env'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes/paths'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: ROUTES.dashboard,
    icon: LayoutDashboard,
    end: true,
  },
  { label: 'Subjects', to: ROUTES.subjects, icon: BookOpen },
  { label: 'Users', to: ROUTES.users, icon: Users },
  { label: 'Settings', to: ROUTES.settings, icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
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

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
      </nav>

      <div className="text-muted-foreground border-t p-4 text-xs">
        v0.0.0 · {env.isProd ? 'production' : 'development'}
      </div>
    </aside>
  )
}
