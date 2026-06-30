import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { Paginated } from '@/lib/api'
import type { ListParams } from '@/services'

export interface SelectOption {
  label: string
  value: string
}

export interface ResColumn<T> {
  key: string
  header: string
  sortable?: boolean
  cell?: (row: T) => ReactNode
}

export interface ResFilter {
  key: string
  label: string
  type: 'text' | 'select' | 'faceted'
  options?: SelectOption[]
  width?: string
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'number-csv'
  | 'options'

export interface ResField {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: SelectOption[]
  placeholder?: string
  description?: string
  /** Only sent/shown when creating (e.g. a parent id that can't change). */
  createOnly?: boolean
}

export interface ResAction<T> {
  key: string
  label: string | ((row: T) => string)
  icon?: LucideIcon
  perm?: string
  destructive?: boolean
  hidden?: (row: T) => boolean
  /** Opens a URL in a new tab instead of running a request. */
  href?: (row: T) => string
  run?: (row: T) => Promise<unknown>
  confirmTitle?: string
  successMessage?: string | ((row: T) => string)
}

export interface ResDetail<T> {
  title: (row: T) => string
  fetch: (row: T) => Promise<T>
  render: (full: T) => ReactNode
}

export interface ResourceService<T> {
  list: (params: ListParams) => Promise<Paginated<T>>
  create?: (body: Record<string, unknown>) => Promise<T>
  update?: (id: number | string, body: Record<string, unknown>) => Promise<T>
  remove?: (...args: (number | string)[]) => Promise<unknown>
}

export interface ResourceConfig<T> {
  title: string
  description?: string
  mode?: 'paginated' | 'bare'
  readPerm: string
  writePerm?: string
  idKey?: keyof T
  columns: ResColumn<T>[]
  filters?: ResFilter[]
  searchable?: boolean
  searchPlaceholder?: string
  /** Show row-selection checkboxes. */
  selectable?: boolean
  initialSort?: string
  initialOrder?: 'asc' | 'desc'
  fields?: ResField[]
  /** Fetch the full record before opening the edit form (e.g. to load nested
   *  options / ids that the list endpoint omits). */
  fetchOnEdit?: (row: T) => Promise<T>
  actions?: ResAction<T>[]
  detail?: ResDetail<T>
  /** Maps a row to the arguments passed to service.remove (default: [id]). */
  removeArgs?: (row: T) => (number | string)[]
  removeLabel?: string
  service: ResourceService<T>
  /** Bare (non-paginated) fetch — used when mode === 'bare'. */
  bareFetch?: (params: Record<string, unknown>) => Promise<T[]>
}
