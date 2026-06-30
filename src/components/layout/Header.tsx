import { Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme/ThemeToggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NAV_ENTRIES } from '@/config/resources'
import { ROUTES } from '@/routes/paths'

export function Header({ onSearch }: { onSearch: () => void }) {
  const { pathname } = useLocation()

  const current = NAV_ENTRIES.find((item) =>
    item.path === ROUTES.dashboard
      ? pathname === item.path
      : pathname.startsWith(item.path)
  )
  const isDashboard = pathname === ROUTES.dashboard

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-4"
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isDashboard ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={ROUTES.dashboard}>Dashboard</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isDashboard && current && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onSearch}
          className="text-muted-foreground relative h-9 w-9 justify-start px-0 sm:w-56 sm:px-3"
        >
          <Search className="size-4" />
          <span className="hidden sm:inline-flex">Search…</span>
          <kbd className="bg-muted pointer-events-none absolute top-1/2 right-1.5 hidden -translate-y-1/2 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:inline-flex">
            ⌘K
          </kbd>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
