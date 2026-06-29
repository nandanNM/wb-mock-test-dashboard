export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatarUrl?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSession {
  token: string
  user: User
}

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated'
