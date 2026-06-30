import { ExternalLink, ScrollText } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { NavUser } from '@/components/layout/NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { env } from '@/config/env'
import { NAV_GROUPS, NAV_ENTRIES } from '@/config/resources'
import { useAuth } from '@/features/auth'
import { ROUTES } from '@/routes/paths'

export function AppSidebar() {
  const { can, hasRole } = useAuth()
  const { pathname } = useLocation()

  const visible = NAV_ENTRIES.filter(
    (item) =>
      (!item.readPerm || can(item.readPerm)) &&
      (!item.requireRole || hasRole(item.requireRole))
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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={ROUTES.dashboard}>
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-semibold">
                  A
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{env.appName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {env.isProd ? 'production' : 'development'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => {
          const items = visible.filter((item) => item.group === group)
          const isSystem = group === 'System'
          if (!items.length && !(isSystem && showLogs)) return null
          return (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active =
                      item.path === ROUTES.dashboard
                        ? pathname === item.path
                        : pathname.startsWith(item.path)
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                        >
                          <Link to={item.path}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                  {isSystem && showLogs && (
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={openLogs} tooltip="Logs">
                        <ScrollText />
                        <span>Logs</span>
                        <ExternalLink className="ml-auto size-3.5 opacity-60" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
