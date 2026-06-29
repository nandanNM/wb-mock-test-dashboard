import { createCrudService } from './crud'
import type { Question } from './types'

export interface QuestionOptionInput {
  position: number
  body_en: string
  body_bn: string
  is_correct: boolean
}

export interface QuestionInput {
  chapter_id: number
  prompt_en: string
  prompt_bn: string
  explanation_en?: string
  explanation_bn?: string
  position?: number
  options: QuestionOptionInput[]
}

export const questionsService = createCrudService<
  Question,
  QuestionInput,
  Partial<QuestionInput>
>('/v1/admin/questions')
