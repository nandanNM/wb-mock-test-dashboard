import { api, unwrap } from '@/lib/api'

export interface BackendUser {
  id: string
  name: string
  email: string
  created_at: string
}

export interface CreateUserInput {
  name: string
  email: string
}

export function getUsers(limit?: number) {
  return unwrap<BackendUser[]>(
    api.get('/v1/users', { params: limit ? { limit } : undefined })
  )
}

export function getUser(id: string) {
  return unwrap<BackendUser>(api.get(`/v1/users/${id}`))
}

export function createUser(input: CreateUserInput) {
  return unwrap<BackendUser>(api.post('/v1/users', input))
}
