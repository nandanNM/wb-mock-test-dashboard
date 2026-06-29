import { useCallback, useEffect, useMemo, useState } from 'react'

import { getStoredToken, setStoredToken } from '@/lib/api'

import { AuthContext } from './auth-context'
import * as authService from './auth-service'
import type { AuthStatus, LoginCredentials, User } from './types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [isInitializing, setIsInitializing] = useState(
    () => getStoredToken() !== null
  )

  useEffect(() => {
    let cancelled = false
    const token = getStoredToken()

    if (!token) {
      return
    }

    authService
      .fetchCurrentUser(token)
      .then((restored) => {
        if (cancelled) return
        setUser(restored)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        setStoredToken(null)
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setStatus('authenticating')
    try {
      const session = await authService.login(credentials)
      setStoredToken(session.token)
      setUser(session.user)
      setStatus('authenticated')
    } catch (error) {
      setStatus('idle')
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setStoredToken(null)
      setUser(null)
      setStatus('idle')
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated' && user !== null,
      isInitializing,
      login,
      logout,
    }),
    [user, status, isInitializing, login, logout]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
