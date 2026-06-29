import { api, unwrap, type Paginated } from '@/lib/api'

import type { ListParams } from './crud'
import type { DeleteResult, Session } from './types'

export const sessionsService = {
  list: (params: ListParams = {}) =>
    unwrap<Paginated<Session>>(api.get('/v1/admin/sessions', { params })),
  revoke: (id: string) =>
    unwrap<DeleteResult>(api.delete(`/v1/admin/sessions/${id}`)),
}

export const mySessionsService = {
  list: () => unwrap<Session[]>(api.get('/v1/auth/sessions')),
  revoke: (id: string) =>
    unwrap<{ status: string }>(api.delete(`/v1/auth/sessions/${id}`)),
}
