import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
  const me = useAuthStore((s) => s.me)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const hasRole = useAuthStore((s) => s.hasRole)
  const can = useAuthStore((s) => s.can)

  return {
    me,
    isInitializing,
    isAuthenticated: me !== null,
    login,
    logout,
    hasRole,
    can,
  }
}
