import { Outlet, useLocation } from 'react-router-dom'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { CommandMenu } from '@/components/layout/CommandMenu'
import { Header } from '@/components/layout/Header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useCommandMenu } from '@/hooks/use-command-menu'

export function DashboardLayout() {
  const { open, setOpen } = useCommandMenu()
  const { pathname } = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header onSearch={() => setOpen(true)} />
        {/* key by pathname so each route remounts on navigation — otherwise
            two same-typed pages (e.g. all ResourceTable routes) reuse the
            instance and never re-fetch. */}
        <div key={pathname} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </SidebarInset>
      <CommandMenu open={open} onOpenChange={setOpen} />
    </SidebarProvider>
  )
}
