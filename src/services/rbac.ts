import { api, unwrap } from '@/lib/api'

import type { Permission, Role, RoleWithPermissions } from './types'

export interface PermissionInput {
  name: string
  description?: string
}

export interface RoleInput {
  name: string
  description?: string
}

export const rbacService = {
  // Permissions
  listPermissions: () => unwrap<Permission[]>(api.get('/v1/admin/permissions')),
  createPermission: (body: PermissionInput) =>
    unwrap<Permission>(api.post('/v1/admin/permissions', body)),
  updatePermission: (id: string, body: Partial<PermissionInput>) =>
    unwrap<Permission>(api.patch(`/v1/admin/permissions/${id}`, body)),
  deletePermission: (id: string) =>
    unwrap<{ status: string }>(api.delete(`/v1/admin/permissions/${id}`)),

  // Roles
  listRoles: () => unwrap<Role[]>(api.get('/v1/admin/roles')),
  getRole: (id: string) =>
    unwrap<RoleWithPermissions>(api.get(`/v1/admin/roles/${id}`)),
  createRole: (body: RoleInput) =>
    unwrap<Role>(api.post('/v1/admin/roles', body)),
  updateRole: (id: string, body: Partial<RoleInput>) =>
    unwrap<Role>(api.patch(`/v1/admin/roles/${id}`, body)),
  deleteRole: (id: string) =>
    unwrap<{ status: string }>(api.delete(`/v1/admin/roles/${id}`)),
  setRolePermissions: (id: string, permissionIds: string[]) =>
    unwrap<RoleWithPermissions>(
      api.put(`/v1/admin/roles/${id}/permissions`, {
        permission_ids: permissionIds,
      })
    ),
}
