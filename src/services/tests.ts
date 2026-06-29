import { api, unwrap } from '@/lib/api'

import { createCrudService } from './crud'
import type { Test, TestDifficulty, TestScope } from './types'

export interface TestInput {
  subject_id: number
  scope_type: TestScope
  title_en: string
  title_bn: string
  test_code: string
  difficulty?: TestDifficulty
  position?: number
  is_published?: boolean
  chapter_ids?: number[]
  question_ids?: number[]
}

const base = createCrudService<Test, TestInput, Partial<TestInput>>(
  '/v1/admin/tests'
)

export const testsService = {
  ...base,
  setPublished: (id: number | string, isPublished: boolean) =>
    unwrap<Test>(
      api.patch(`/v1/admin/tests/${id}`, { is_published: isPublished })
    ),
}
