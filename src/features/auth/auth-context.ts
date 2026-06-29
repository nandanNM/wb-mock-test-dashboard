import { createContext } from 'react'

import type { AuthStatus, LoginCredentials, User } from './types'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  isAuthenticated: boolean
  isInitializing: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)
