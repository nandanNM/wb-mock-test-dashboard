import { createCrudService } from './crud'
import type { Chapter } from './types'

export interface ChapterInput {
  subject_id: number
  name_en: string
  name_bn: string
  position?: number
}

export const chaptersService = createCrudService<
  Chapter,
  ChapterInput,
  Partial<Omit<ChapterInput, 'subject_id'>>
>('/v1/admin/chapters')
