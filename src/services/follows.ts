import { api, unwrap, type Paginated } from '@/lib/api'

import type { ListParams } from './crud'
import type { DeleteResult, Follow } from './types'

export const followsService = {
  list: (params: ListParams = {}) =>
    unwrap<Paginated<Follow>>(api.get('/v1/admin/follows', { params })),
  remove: (followerId: string, followeeId: string) =>
    unwrap<DeleteResult>(
      api.delete(`/v1/admin/follows/${followerId}/${followeeId}`)
    ),
}
