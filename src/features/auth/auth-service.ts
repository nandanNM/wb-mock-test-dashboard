import { api, unwrap } from '@/lib/api'

import type { Me } from './types'

export function getMe(): Promise<Me> {
  return unwrap<Me>(api.get('/v1/me'))
}
