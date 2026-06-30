import { createBrowserRouter } from 'react-router-dom'

import { RequirePermission } from '@/components/auth/RequirePermission'
import { RequireRole } from '@/components/auth/RequireRole'
import { NAV_ENTRIES } from '@/config/resources'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

import { ROUTES } from './paths'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

function guard(entry: (typeof NAV_ENTRIES)[number]) {
  let node = entry.element
  if (entry.readPerm) {
    node = (
      <RequirePermission permission={entry.readPerm}>{node}</RequirePermission>
    )
  }
  if (entry.requireRole) {
    node = <RequireRole role={entry.requireRole}>{node}</RequireRole>
  }
  return node
}

const dashboardChildren = NAV_ENTRIES.map((entry) => ({
  index: entry.path === ROUTES.dashboard,
  path: entry.path === ROUTES.dashboard ? undefined : entry.path,
  element: guard(entry),
}))

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: ROUTES.login, element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: dashboardChildren,
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
