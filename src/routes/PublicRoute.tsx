import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/features/auth'

import { ROUTES } from './paths'

export function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
