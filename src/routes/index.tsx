import { createBrowserRouter } from 'react-router-dom'

import { RequirePermission } from '@/components/auth/RequirePermission'
import { NAV_ENTRIES } from '@/config/resources'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

import { ROUTES } from './paths'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

const dashboardChildren = NAV_ENTRIES.map((entry) => ({
  index: entry.path === ROUTES.dashboard,
  path: entry.path === ROUTES.dashboard ? undefined : entry.path,
  element: entry.readPerm ? (
    <RequirePermission permission={entry.readPerm}>
      {entry.element}
    </RequirePermission>
  ) : (
    entry.element
  ),
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
