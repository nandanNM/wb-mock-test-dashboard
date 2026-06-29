import { api, unwrap, type Paginated } from '@/lib/api'

import type { ListParams } from './crud'
import type { AdminUser, AdminUserDetail, DeleteResult } from './types'

export const usersService = {
  list: (params: ListParams = {}) =>
    unwrap<Paginated<AdminUser>>(api.get('/v1/admin/users', { params })),

  get: (id: string) =>
    unwrap<AdminUserDetail>(api.get(`/v1/admin/users/${id}`)),

  remove: (id: string) =>
    unwrap<DeleteResult>(api.delete(`/v1/admin/users/${id}`)),

  ban: (id: string, reason: string) =>
    unwrap<{ status: string; user_id: string }>(
      api.post(`/v1/admin/users/${id}/ban`, { reason })
    ),

  suspend: (id: string, reason: string) =>
    unwrap<{ status: string; user_id: string }>(
      api.post(`/v1/admin/users/${id}/suspend`, { reason })
    ),

  reinstate: (id: string) =>
    unwrap<{ status: string; user_id: string }>(
      api.post(`/v1/admin/users/${id}/reinstate`)
    ),

  grantRole: (id: string, role: string) =>
    unwrap<{ status: string }>(
      api.post(`/v1/admin/users/${id}/roles`, { role })
    ),

  revokeRole: (id: string, role: string) =>
    unwrap<{ status: string }>(
      api.delete(`/v1/admin/users/${id}/roles/${role}`)
    ),
}
