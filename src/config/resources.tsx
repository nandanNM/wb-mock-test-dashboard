import {
  BookMarked,
  BookOpen,
  ClipboardList,
  FileText,
  FlaskConical,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Flag,
  Laptop,
  ScrollText,
  Settings as SettingsIcon,
  Shield,
  Swords,
  Target,
  UserPlus,
  Users as UsersIcon,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { ResourceTable } from '@/components/resource/ResourceTable'
import type { ResourceConfig } from '@/components/resource/resource-config'
import { Badge } from '@/components/ui/badge'
import { ApiTesterPage } from '@/pages/ApiTesterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PermissionsPage } from '@/pages/PermissionsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { RolesPage } from '@/pages/RolesPage'
import { SubjectsPage } from '@/pages/SubjectsPage'
import { UsersPage } from '@/pages/UsersPage'
import { formatDate, formatDateTime } from '@/lib/format'
import {
  attemptsService,
  auditService,
  battlesService,
  chaptersService,
  followsService,
  notesService,
  questionsService,
  sessionsService,
  testsService,
  type Attempt,
  type Battle,
  type BattleStatus,
  type Chapter,
  type ChapterInput,
  type Follow,
  type Note,
  type NoteInput,
  type Question,
  type QuestionInput,
  type Session,
  type Test,
  type TestInput,
  type AuditRecord,
} from '@/services'

const BATTLE_STATUS_VARIANT: Record<
  BattleStatus,
  'success' | 'secondary' | 'destructive' | 'outline'
> = {
  lobby: 'secondary',
  active: 'success',
  finished: 'outline',
  abandoned: 'destructive',
}

const chaptersConfig: ResourceConfig<Chapter> = {
  title: 'Chapters',
  description: 'Chapters that belong to each subject.',
  readPerm: 'chapters:read',
  writePerm: 'chapters:manage',
  searchable: true,
  searchPlaceholder: 'Search chapters…',
  initialSort: 'position',
  initialOrder: 'asc',
  columns: [
    { key: 'name_en', header: 'Name (EN)', sortable: true },
    { key: 'name_bn', header: 'Name (BN)' },
    { key: 'subject_id', header: 'Subject ID' },
    { key: 'position', header: 'Position', sortable: true },
  ],
  filters: [
    {
      key: 'subject_id',
      label: 'Subject ID',
      type: 'text',
      width: 'max-w-[140px]',
    },
  ],
  fields: [
    {
      name: 'subject_id',
      label: 'Subject ID',
      type: 'number',
      required: true,
      createOnly: true,
    },
    { name: 'name_en', label: 'Name (English)', type: 'text', required: true },
    { name: 'name_bn', label: 'Name (Bangla)', type: 'text', required: true },
    { name: 'position', label: 'Position', type: 'number' },
  ],
  service: {
    list: chaptersService.list,
    create: (b) => chaptersService.create(b as unknown as ChapterInput),
    update: (id, b) => chaptersService.update(id, b as Partial<ChapterInput>),
    remove: (...args) => chaptersService.remove(args[0]),
  },
}

const notesConfig: ResourceConfig<Note> = {
  title: 'Chapter Notes',
  description: 'PDF notes attached to chapters.',
  readPerm: 'notes:read',
  writePerm: 'notes:manage',
  initialSort: 'created_at',
  initialOrder: 'desc',
  columns: [
    { key: 'title', header: 'Title', sortable: true },
    {
      key: 'language_code',
      header: 'Lang',
      cell: (n) => <Badge variant="secondary">{n.language_code}</Badge>,
    },
    { key: 'chapter_id', header: 'Chapter ID' },
    {
      key: 'pdf_url',
      header: 'PDF',
      cell: (n) => (
        <a
          href={n.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary max-w-[220px] truncate underline underline-offset-2"
        >
          {n.pdf_url}
        </a>
      ),
    },
  ],
  filters: [
    {
      key: 'chapter_id',
      label: 'Chapter ID',
      type: 'text',
      width: 'max-w-[140px]',
    },
  ],
  fields: [
    {
      name: 'chapter_id',
      label: 'Chapter ID',
      type: 'number',
      required: true,
      createOnly: true,
    },
    {
      name: 'language_code',
      label: 'Language',
      type: 'select',
      required: true,
      createOnly: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Bangla', value: 'bn' },
      ],
    },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'pdf_url', label: 'PDF URL', type: 'text', required: true },
    { name: 'page_count', label: 'Page count', type: 'number' },
  ],
  actions: [
    {
      key: 'open-pdf',
      label: 'Open PDF',
      icon: FileText,
      href: (n) => n.pdf_url,
    },
  ],
  service: {
    list: notesService.list,
    create: (b) => notesService.create(b as unknown as NoteInput),
    update: (id, b) => notesService.update(id, b as Partial<NoteInput>),
    remove: (...args) => notesService.remove(args[0]),
  },
}

const questionsConfig: ResourceConfig<Question> = {
  title: 'Questions',
  description: 'MCQ questions grouped by chapter.',
  readPerm: 'questions:read',
  writePerm: 'questions:manage',
  searchable: true,
  searchPlaceholder: 'Search prompts…',
  initialSort: 'position',
  initialOrder: 'asc',
  columns: [
    {
      key: 'prompt_en',
      header: 'Prompt (EN)',
      cell: (q) => <span className="line-clamp-2 max-w-md">{q.prompt_en}</span>,
    },
    { key: 'chapter_id', header: 'Chapter ID' },
    { key: 'position', header: 'Position', sortable: true },
  ],
  filters: [
    {
      key: 'chapter_id',
      label: 'Chapter ID',
      type: 'text',
      width: 'max-w-[140px]',
    },
  ],
  fields: [
    { name: 'chapter_id', label: 'Chapter ID', type: 'number', required: true },
    {
      name: 'prompt_en',
      label: 'Prompt (English)',
      type: 'textarea',
      required: true,
    },
    {
      name: 'prompt_bn',
      label: 'Prompt (Bangla)',
      type: 'textarea',
      required: true,
    },
    {
      name: 'explanation_en',
      label: 'Explanation (English)',
      type: 'textarea',
    },
    { name: 'explanation_bn', label: 'Explanation (Bangla)', type: 'textarea' },
    { name: 'position', label: 'Position', type: 'number' },
    { name: 'options', label: 'Options', type: 'options' },
  ],
  fetchOnEdit: (q) => questionsService.get(q.id),
  detail: {
    title: (q) => `Question #${q.id}`,
    fetch: (q) => questionsService.get(q.id),
    render: (q) => (
      <div className="space-y-3 text-sm">
        <p className="font-medium">{q.prompt_en}</p>
        <ul className="space-y-1">
          {(q.options ?? []).map((o) => (
            <li
              key={o.id}
              className={o.is_correct ? 'font-medium text-emerald-600' : ''}
            >
              {o.is_correct ? '✓ ' : '• '}
              {o.body_en} / {o.body_bn}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  service: {
    list: questionsService.list,
    create: (b) => questionsService.create(b as unknown as QuestionInput),
    update: (id, b) => questionsService.update(id, b as Partial<QuestionInput>),
    remove: (...args) => questionsService.remove(args[0]),
  },
}

const testsConfig: ResourceConfig<Test> = {
  title: 'Tests',
  description: 'Quizzes and exams built from chapters and questions.',
  readPerm: 'tests:read',
  writePerm: 'tests:manage',
  searchable: true,
  searchPlaceholder: 'Search title or code…',
  initialSort: 'position',
  initialOrder: 'asc',
  columns: [
    { key: 'title_en', header: 'Title (EN)' },
    { key: 'test_code', header: 'Code' },
    { key: 'scope_type', header: 'Scope' },
    {
      key: 'difficulty',
      header: 'Difficulty',
      cell: (t) =>
        t.difficulty ? <Badge variant="outline">{t.difficulty}</Badge> : '—',
    },
    {
      key: 'is_published',
      header: 'Status',
      cell: (t) =>
        t.is_published ? (
          <Badge variant="success">Published</Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        ),
    },
  ],
  filters: [
    {
      key: 'subject_id',
      label: 'Subject ID',
      type: 'text',
      width: 'max-w-[140px]',
    },
    {
      key: 'published',
      label: 'Status',
      type: 'faceted',
      options: [
        { label: 'Published', value: 'true' },
        { label: 'Draft', value: 'false' },
      ],
    },
  ],
  fields: [
    { name: 'subject_id', label: 'Subject ID', type: 'number', required: true },
    {
      name: 'scope_type',
      label: 'Scope',
      type: 'select',
      required: true,
      options: [
        { label: 'Chapter', value: 'chapter' },
        { label: 'Multi-chapter', value: 'multi_chapter' },
        { label: 'Subject', value: 'subject' },
      ],
    },
    {
      name: 'title_en',
      label: 'Title (English)',
      type: 'text',
      required: true,
    },
    { name: 'title_bn', label: 'Title (Bangla)', type: 'text', required: true },
    { name: 'test_code', label: 'Test code', type: 'text', required: true },
    {
      name: 'difficulty',
      label: 'Difficulty',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
    },
    { name: 'position', label: 'Position', type: 'number' },
    { name: 'is_published', label: 'Published', type: 'checkbox' },
    {
      name: 'chapter_ids',
      label: 'Chapter IDs',
      type: 'number-csv',
      description: 'Comma-separated; replaces the existing set when saved.',
    },
    {
      name: 'question_ids',
      label: 'Question IDs',
      type: 'number-csv',
      description: 'Comma-separated; replaces the existing set when saved.',
    },
  ],
  fetchOnEdit: (t) => testsService.get(t.id),
  actions: [
    {
      key: 'publish',
      label: (t) => (t.is_published ? 'Unpublish' : 'Publish'),
      icon: ClipboardList,
      perm: 'tests:manage',
      run: (t) => testsService.setPublished(t.id, !t.is_published),
      successMessage: (t) => (t.is_published ? 'Unpublished' : 'Published'),
    },
  ],
  service: {
    list: testsService.list,
    create: (b) => testsService.create(b as unknown as TestInput),
    update: (id, b) => testsService.update(id, b as Partial<TestInput>),
    remove: (...args) => testsService.remove(args[0]),
  },
}

const sessionsConfig: ResourceConfig<Session> = {
  title: 'Sessions',
  description: 'Active and revoked login sessions.',
  readPerm: 'sessions:read',
  writePerm: 'sessions:revoke',
  removeLabel: 'Revoke',
  initialSort: 'last_used_at',
  initialOrder: 'desc',
  columns: [
    { key: 'user_id', header: 'User ID' },
    { key: 'ip', header: 'IP' },
    {
      key: 'user_agent',
      header: 'User agent',
      cell: (s) => (
        <span className="line-clamp-1 max-w-xs">{s.user_agent}</span>
      ),
    },
    {
      key: 'last_used_at',
      header: 'Last used',
      sortable: true,
      cell: (s) => formatDateTime(s.last_used_at),
    },
    {
      key: 'revoked_at',
      header: 'State',
      cell: (s) =>
        s.revoked_at ? (
          <Badge variant="destructive">revoked</Badge>
        ) : (
          <Badge variant="success">active</Badge>
        ),
    },
  ],
  filters: [
    { key: 'user_id', label: 'User ID', type: 'text', width: 'max-w-xs' },
  ],
  service: {
    list: sessionsService.list,
    remove: (...args) => sessionsService.revoke(String(args[0])),
  },
}

const attemptsConfig: ResourceConfig<Attempt> = {
  title: 'Attempts',
  description: 'Test attempts submitted by users.',
  readPerm: 'attempts:read',
  writePerm: 'attempts:delete',
  initialSort: 'started_at',
  initialOrder: 'desc',
  columns: [
    { key: 'user_id', header: 'User ID' },
    { key: 'test_id', header: 'Test ID' },
    { key: 'score', header: 'Score', sortable: true },
    {
      key: 'accuracy',
      header: 'Accuracy',
      sortable: true,
      cell: (a) => `${Math.round(a.accuracy * 100)}%`,
    },
    {
      key: 'completed_at',
      header: 'Completed',
      sortable: true,
      cell: (a) => formatDateTime(a.completed_at),
    },
  ],
  filters: [
    { key: 'user_id', label: 'User ID', type: 'text', width: 'max-w-xs' },
    { key: 'test_id', label: 'Test ID', type: 'text', width: 'max-w-[140px]' },
  ],
  detail: {
    title: (a) => `Attempt #${a.id}`,
    fetch: (a) => attemptsService.get(a.id),
    render: (a) => (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Score</span>
          <span>
            {a.score} / {a.total_questions}
          </span>
          <span className="text-muted-foreground">Accuracy</span>
          <span>{Math.round(a.accuracy * 100)}%</span>
          <span className="text-muted-foreground">Points</span>
          <span>{a.points_earned}</span>
        </div>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="p-2 text-left">Question</th>
                <th className="p-2 text-left">Selected</th>
                <th className="p-2 text-left">Correct</th>
              </tr>
            </thead>
            <tbody>
              {(a.answers ?? []).map((ans) => (
                <tr key={ans.id} className="border-b last:border-0">
                  <td className="p-2">{ans.question_id}</td>
                  <td className="p-2">{ans.selected_option_id ?? '—'}</td>
                  <td className="p-2">{ans.is_correct ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  service: {
    list: attemptsService.list,
    remove: (...args) => attemptsService.remove(args[0]),
  },
}

const battlesConfig: ResourceConfig<Battle> = {
  title: 'Battles',
  description: 'Multiplayer quiz battles.',
  readPerm: 'battles:read',
  writePerm: 'battles:manage',
  initialSort: 'created_at',
  initialOrder: 'desc',
  columns: [
    { key: 'room_code', header: 'Room' },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => (
        <Badge variant={BATTLE_STATUS_VARIANT[b.status]}>{b.status}</Badge>
      ),
    },
    { key: 'host_id', header: 'Host ID' },
    { key: 'max_players', header: 'Max players' },
  ],
  filters: [
    {
      key: 'status',
      label: 'Status',
      type: 'faceted',
      options: [
        { label: 'Lobby', value: 'lobby' },
        { label: 'Active', value: 'active' },
        { label: 'Finished', value: 'finished' },
        { label: 'Abandoned', value: 'abandoned' },
      ],
    },
  ],
  actions: [
    {
      key: 'finish',
      label: 'Finish',
      icon: Flag,
      perm: 'battles:manage',
      hidden: (b) => b.status === 'finished' || b.status === 'abandoned',
      confirmTitle: 'Finish this battle?',
      run: (b) => battlesService.finish(b.id),
      successMessage: 'Battle finished',
    },
  ],
  detail: {
    title: (b) => `Battle ${b.room_code}`,
    fetch: (b) => battlesService.get(b.id),
    render: (b) => (
      <div className="space-y-3 text-sm">
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Score</th>
                <th className="p-2 text-left">Placement</th>
              </tr>
            </thead>
            <tbody>
              {(b.participants ?? []).map((p) => (
                <tr key={p.user_id} className="border-b last:border-0">
                  <td className="p-2">{p.user_id}</td>
                  <td className="p-2">{p.role}</td>
                  <td className="p-2">{p.score ?? '—'}</td>
                  <td className="p-2">{p.placement ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  service: {
    list: battlesService.list,
    remove: (...args) => battlesService.remove(args[0]),
  },
}

const followsConfig: ResourceConfig<Follow> = {
  title: 'Follows',
  description: 'Follower / followee relationships.',
  selectable: false,
  readPerm: 'follows:read',
  writePerm: 'follows:read',
  initialSort: 'created_at',
  initialOrder: 'desc',
  columns: [
    { key: 'follower_id', header: 'Follower ID' },
    { key: 'followee_id', header: 'Followee ID' },
    {
      key: 'created_at',
      header: 'Since',
      sortable: true,
      cell: (f) => formatDate(f.created_at),
    },
  ],
  filters: [
    {
      key: 'follower_id',
      label: 'Follower ID',
      type: 'text',
      width: 'max-w-xs',
    },
    {
      key: 'followee_id',
      label: 'Followee ID',
      type: 'text',
      width: 'max-w-xs',
    },
  ],
  removeArgs: (f) => [f.follower_id, f.followee_id],
  service: {
    list: followsService.list,
    remove: (...args) =>
      followsService.remove(String(args[0]), String(args[1])),
  },
}

const auditConfig: ResourceConfig<AuditRecord> = {
  title: 'Audit Log',
  description: 'Security and admin activity events.',
  mode: 'bare',
  readPerm: 'audit:read',
  columns: [
    {
      key: 'occurred_at',
      header: 'When',
      cell: (r) => formatDateTime(r.occurred_at),
    },
    {
      key: 'event_type',
      header: 'Event',
      cell: (r) => <Badge variant="outline">{r.event_type}</Badge>,
    },
    { key: 'user_id', header: 'User ID' },
    { key: 'ip', header: 'IP' },
  ],
  filters: [{ key: 'user_id', label: 'Filter by user ID', type: 'text' }],
  bareFetch: (params) => auditService.list(params),
  service: { list: () => Promise.reject(new Error('bare')) },
}

export interface NavEntry {
  path: string
  label: string
  icon: LucideIcon
  group: string
  readPerm?: string
  /** Restrict to a role (e.g. super_admin). Backend enforces regardless. */
  requireRole?: string
  element: ReactNode
}

/** Order in which sidebar groups are rendered. */
export const NAV_GROUPS = [
  'Overview',
  'Content',
  'Community',
  'Access & Audit',
  'System',
] as const

export const NAV_ENTRIES: NavEntry[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'Overview',
    element: <DashboardPage />,
  },
  {
    path: '/subjects',
    label: 'Subjects',
    icon: BookOpen,
    group: 'Content',
    readPerm: 'subjects:read',
    element: <SubjectsPage />,
  },
  {
    path: '/chapters',
    label: 'Chapters',
    icon: BookMarked,
    group: 'Content',
    readPerm: 'chapters:read',
    element: <ResourceTable config={chaptersConfig} />,
  },
  {
    path: '/notes',
    label: 'Chapter Notes',
    icon: FileText,
    group: 'Content',
    readPerm: 'notes:read',
    element: <ResourceTable config={notesConfig} />,
  },
  {
    path: '/questions',
    label: 'Questions',
    icon: ListChecks,
    group: 'Content',
    readPerm: 'questions:read',
    element: <ResourceTable config={questionsConfig} />,
  },
  {
    path: '/tests',
    label: 'Tests',
    icon: ClipboardList,
    group: 'Content',
    readPerm: 'tests:read',
    element: <ResourceTable config={testsConfig} />,
  },
  {
    path: '/users',
    label: 'Users',
    icon: UsersIcon,
    group: 'Community',
    readPerm: 'users:read',
    element: <UsersPage />,
  },
  {
    path: '/battles',
    label: 'Battles',
    icon: Swords,
    group: 'Community',
    readPerm: 'battles:read',
    element: <ResourceTable config={battlesConfig} />,
  },
  {
    path: '/attempts',
    label: 'Attempts',
    icon: Target,
    group: 'Community',
    readPerm: 'attempts:read',
    element: <ResourceTable config={attemptsConfig} />,
  },
  {
    path: '/follows',
    label: 'Follows',
    icon: UserPlus,
    group: 'Community',
    readPerm: 'follows:read',
    element: <ResourceTable config={followsConfig} />,
  },
  {
    path: '/sessions',
    label: 'Sessions',
    icon: Laptop,
    group: 'Access & Audit',
    readPerm: 'sessions:read',
    element: <ResourceTable config={sessionsConfig} />,
  },
  {
    path: '/roles',
    label: 'Roles',
    icon: Shield,
    group: 'Access & Audit',
    requireRole: 'super_admin',
    element: <RolesPage />,
  },
  {
    path: '/permissions',
    label: 'Permissions',
    icon: KeyRound,
    group: 'Access & Audit',
    requireRole: 'super_admin',
    element: <PermissionsPage />,
  },
  {
    path: '/audit',
    label: 'Audit Log',
    icon: ScrollText,
    group: 'Access & Audit',
    readPerm: 'audit:read',
    element: <ResourceTable config={auditConfig} />,
  },
  {
    path: '/api-tester',
    label: 'API Tester',
    icon: FlaskConical,
    group: 'System',
    requireRole: 'super_admin',
    element: <ApiTesterPage />,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: SettingsIcon,
    group: 'System',
    element: <PlaceholderPage title="Settings" />,
  },
]
