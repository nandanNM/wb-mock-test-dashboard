import { createCrudService } from './crud'
import type { Subject } from './types'

export interface SubjectInput {
  name_en: string
  name_bn: string
  position?: number
}

export const subjectsService = createCrudService<
  Subject,
  SubjectInput,
  Partial<SubjectInput>
>('/v1/admin/subjects')
