import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth'

import { ROUTES } from './paths'

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  return <Outlet />
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="border-muted-foreground/30 border-t-primary size-8 animate-spin rounded-full border-4" />
    </div>
  )
}
