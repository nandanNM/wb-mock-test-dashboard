import { api, unwrap, type Paginated } from '@/lib/api'

import type { ListParams } from './crud'
import type { Battle, DeleteResult } from './types'

export const battlesService = {
  list: (params: ListParams = {}) =>
    unwrap<Paginated<Battle>>(api.get('/v1/admin/battles', { params })),
  get: (id: number | string) =>
    unwrap<Battle>(api.get(`/v1/admin/battles/${id}`)),
  finish: (id: number | string) =>
    unwrap<{ status: string; id: number }>(
      api.post(`/v1/admin/battles/${id}/finish`)
    ),
  remove: (id: number | string) =>
    unwrap<DeleteResult>(api.delete(`/v1/admin/battles/${id}`)),
}
