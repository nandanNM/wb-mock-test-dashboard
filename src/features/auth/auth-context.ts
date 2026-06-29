import { createContext } from 'react'

import type { Me } from './types'

export interface AuthContextValue {
  me: Me | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: () => void
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
  can: (permission: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)
