import { useCallback, useEffect, useMemo, useState } from 'react'

import { loginWithGoogle, logout as apiLogout, refresh } from '@/lib/api'

import { AuthContext } from './auth-context'
import { getMe } from './auth-service'
import type { Me } from './types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const ok = await refresh()
      if (ok) {
        try {
          const profile = await getMe()
          if (!cancelled) setMe(profile)
        } catch {
          if (!cancelled) setMe(null)
        }
      }
      if (!cancelled) setIsInitializing(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setMe(null)
    }
  }, [])

  const hasRole = useCallback(
    (role: string) => {
      const roles = me?.roles ?? []
      return roles.includes('super_admin') || roles.includes(role)
    },
    [me]
  )

  const can = useCallback(
    (permission: string) => {
      const roles = me?.roles ?? []
      if (roles.includes('super_admin')) return true
      return (me?.permissions ?? []).includes(permission)
    },
    [me]
  )

  const value = useMemo(
    () => ({
      me,
      isAuthenticated: me !== null,
      isInitializing,
      login: loginWithGoogle,
      logout,
      hasRole,
      can,
    }),
    [me, isInitializing, logout, hasRole, can]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
