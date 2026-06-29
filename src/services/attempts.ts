import { api, unwrap, type Paginated } from '@/lib/api'

import type { ListParams } from './crud'
import type { Attempt, DeleteResult } from './types'

export const attemptsService = {
  list: (params: ListParams = {}) =>
    unwrap<Paginated<Attempt>>(api.get('/v1/admin/attempts', { params })),
  get: (id: number | string) =>
    unwrap<Attempt>(api.get(`/v1/admin/attempts/${id}`)),
  remove: (id: number | string) =>
    unwrap<DeleteResult>(api.delete(`/v1/admin/attempts/${id}`)),
}
