import { api, unwrap } from '@/lib/api'

import type { AuditRecord } from './types'

export interface AuditParams {
  user_id?: string
  limit?: number
}

export const auditService = {
  list: (params: AuditParams = {}) =>
    unwrap<AuditRecord[]>(api.get('/v1/admin/audit', { params })),
}
