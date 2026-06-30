export interface Subject {
  id: number
  name_en: string
  name_bn: string
  position: number
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: number
  subject_id: number
  name_en: string
  name_bn: string
  position: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  chapter_id: number
  language_code: 'en' | 'bn'
  title: string
  pdf_url: string
  page_count?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface QuestionOption {
  id: number
  question_id: number
  position: number
  body_en: string
  body_bn: string
  is_correct: boolean
}

export interface Question {
  id: number
  chapter_id: number
  prompt_en: string
  prompt_bn: string
  explanation_en?: string
  explanation_bn?: string
  position: number
  created_by?: string
  created_at: string
  updated_at: string
  options?: QuestionOption[]
}

export type TestScope = 'chapter' | 'multi_chapter' | 'subject'
export type TestDifficulty = 'easy' | 'medium' | 'hard'

export interface Test {
  id: number
  subject_id: number
  scope_type: TestScope
  title_en: string
  title_bn: string
  test_code: string
  difficulty?: TestDifficulty
  position: number
  is_published: boolean
  created_by?: string
  created_at: string
  updated_at: string
  chapter_ids?: number[]
  question_ids?: number[]
}

export type UserStatus = 'active' | 'suspended' | 'banned'

export interface AdminUser {
  id: string
  name: string
  email: string
  status: UserStatus
  points?: number
  email_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface AdminUserDetail {
  user: AdminUser
  roles: string[]
}

export interface Session {
  id: string
  user_id: string
  user_agent: string
  ip: string
  device_label?: string
  created_at: string
  last_used_at: string
  expires_at: string
  revoked_at?: string | null
  current?: boolean
}

export interface AttemptAnswer {
  id: number
  question_id: number
  selected_option_id?: number
  is_correct: boolean
  answered_at: string
}

export interface Attempt {
  id: number
  user_id: string
  test_id: number
  battle_id?: number
  language_code: string
  score: number
  total_questions: number
  accuracy: number
  points_earned: number
  started_at: string
  completed_at?: string
  answers?: AttemptAnswer[]
}

export type BattleStatus = 'lobby' | 'active' | 'finished' | 'abandoned'

export interface BattleParticipant {
  user_id: string
  role: string
  score?: number
  placement?: number
  joined_at: string
  finished_at?: string
}

export interface Battle {
  id: number
  room_code: string
  host_id: string
  test_id: number
  status: BattleStatus
  max_players: number
  started_at?: string
  finished_at?: string
  created_at: string
  updated_at: string
  participants?: BattleParticipant[]
}

export interface Follow {
  follower_id: string
  followee_id: string
  created_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
}

export interface Permission {
  id: string
  name: string
  description?: string
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}

export interface AuditRecord {
  id: number
  occurred_at: string
  event_type: string
  user_id?: string
  session_id?: string
  ip: string
  user_agent: string
  request_id: string
  detail: Record<string, unknown>
}

export interface DeleteResult {
  status: string
  id?: number | string
}
