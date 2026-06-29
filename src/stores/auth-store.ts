import { create } from 'zustand'

import { getMe } from '@/features/auth/auth-service'
import type { Me } from '@/features/auth/types'
import { loginWithGoogle, logout as apiLogout, refresh } from '@/lib/api'

interface AuthState {
  me: Me | null
  isInitializing: boolean
  bootstrap: () => Promise<void>
  login: () => void
  logout: () => Promise<void>
  setMe: (me: Me | null) => void
  hasRole: (role: string) => boolean
  can: (permission: string) => boolean
}

let bootstrapped = false

export const useAuthStore = create<AuthState>((set, get) => ({
  me: null,
  isInitializing: true,

  bootstrap: async () => {
    if (bootstrapped) return
    bootstrapped = true

    const ok = await refresh()
    if (ok) {
      try {
        set({ me: await getMe() })
      } catch {
        set({ me: null })
      }
    }
    set({ isInitializing: false })
  },

  login: loginWithGoogle,

  logout: async () => {
    try {
      await apiLogout()
    } finally {
      set({ me: null })
    }
  },

  setMe: (me) => set({ me }),

  hasRole: (role) => {
    const roles = get().me?.roles ?? []
    return roles.includes('super_admin') || roles.includes(role)
  },

  can: (permission) => {
    const me = get().me
    const roles = me?.roles ?? []
    if (roles.includes('super_admin')) return true
    return (me?.permissions ?? []).includes(permission)
  },
}))
