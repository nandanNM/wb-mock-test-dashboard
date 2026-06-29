import { createBrowserRouter } from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

import { ROUTES } from './paths'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

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
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          {
            path: ROUTES.users,
            element: <PlaceholderPage title="Users" />,
          },
          {
            path: ROUTES.settings,
            element: <PlaceholderPage title="Settings" />,
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
