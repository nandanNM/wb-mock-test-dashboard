import { api, unwrap, type Paginated } from '@/lib/api'

export interface AdminUser {
  id: string
  name: string
  email: string
  status: string
  roles?: string[]
  created_at?: string
}

export interface ListUsersParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}

export function listUsers(params: ListUsersParams = {}) {
  return unwrap<Paginated<AdminUser>>(api.get('/v1/admin/users', { params }))
}

export function getUser(id: string) {
  return unwrap<AdminUser>(api.get(`/v1/admin/users/${id}`))
}

export function banUser(id: string) {
  return unwrap<AdminUser>(api.post(`/v1/admin/users/${id}/ban`))
}

export function suspendUser(id: string) {
  return unwrap<AdminUser>(api.post(`/v1/admin/users/${id}/suspend`))
}

export function reinstateUser(id: string) {
  return unwrap<AdminUser>(api.post(`/v1/admin/users/${id}/reinstate`))
}
