import { Outlet, useLocation } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { NAV_ENTRIES } from '@/config/resources'

const TITLES: Record<string, string> = Object.fromEntries(
  NAV_ENTRIES.map((entry) => [entry.path, entry.label])
)

export function DashboardLayout() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Dashboard'

  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar className="hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
