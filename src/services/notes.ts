import { createCrudService } from './crud'
import type { Note } from './types'

export interface NoteInput {
  chapter_id: number
  language_code: 'en' | 'bn'
  title: string
  pdf_url: string
  page_count?: number
}

export const notesService = createCrudService<
  Note,
  NoteInput,
  Partial<Pick<NoteInput, 'title' | 'pdf_url' | 'page_count'>>
>('/v1/admin/notes')
