import { api, unwrap, type Paginated } from '@/lib/api'

import type { DeleteResult } from './types'

export interface ListParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  [key: string]: unknown
}

/**
 * Builds the standard admin CRUD client for a resource that follows the
 * documented shape: list (paginated), get/{id}, create, patch/{id}, delete/{id}.
 */
export function createCrudService<
  TItem,
  TCreate = Partial<TItem>,
  TUpdate = Partial<TItem>,
  TDetail = TItem,
>(basePath: string) {
  return {
    list: (params: ListParams = {}) =>
      unwrap<Paginated<TItem>>(api.get(basePath, { params })),
    get: (id: number | string) => unwrap<TDetail>(api.get(`${basePath}/${id}`)),
    create: (body: TCreate) => unwrap<TItem>(api.post(basePath, body)),
    update: (id: number | string, body: TUpdate) =>
      unwrap<TItem>(api.patch(`${basePath}/${id}`, body)),
    remove: (id: number | string) =>
      unwrap<DeleteResult>(api.delete(`${basePath}/${id}`)),
  }
}
