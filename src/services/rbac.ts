import { api, unwrap } from '@/lib/api'

import type { Permission, Role } from './types'

export const rbacService = {
  listRoles: () => unwrap<Role[]>(api.get('/v1/admin/roles')),
  listPermissions: () => unwrap<Permission[]>(api.get('/v1/admin/permissions')),
}
