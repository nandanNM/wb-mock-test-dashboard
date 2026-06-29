export interface AuthUser {
  id: string
  name: string
  email: string
  status: string
}

export interface Me {
  user: AuthUser
  roles: string[]
  permissions: string[]
}
