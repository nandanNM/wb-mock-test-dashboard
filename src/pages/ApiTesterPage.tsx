import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { env } from '@/config/env'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface EndpointDef {
  m: Method
  p: string
  note?: string
  body?: unknown
}

const GROUPS: [string, EndpointDef[]][] = [
  [
    'Auth',
    [
      { m: 'GET', p: '/v1/me', note: 'Current user + roles + permissions.' },
      { m: 'GET', p: '/v1/auth/sessions', note: 'Your own devices.' },
      { m: 'POST', p: '/v1/auth/logout' },
    ],
  ],
  [
    'Admin · subjects',
    [
      {
        m: 'GET',
        p: '/v1/admin/subjects?page=1&limit=20&sort=position&order=asc',
      },
      {
        m: 'POST',
        p: '/v1/admin/subjects',
        body: { name_en: 'Math', name_bn: 'গণিত', position: 1 },
      },
      { m: 'GET', p: '/v1/admin/subjects/{id}' },
      { m: 'PATCH', p: '/v1/admin/subjects/{id}', body: { position: 2 } },
      { m: 'DELETE', p: '/v1/admin/subjects/{id}' },
    ],
  ],
  [
    'Admin · chapters / notes',
    [
      { m: 'GET', p: '/v1/admin/chapters?page=1&limit=20&subject_id=' },
      {
        m: 'POST',
        p: '/v1/admin/chapters',
        body: {
          subject_id: 0,
          name_en: 'Algebra',
          name_bn: 'বীজগণিত',
          position: 1,
        },
      },
      { m: 'GET', p: '/v1/admin/notes?chapter_id=' },
      {
        m: 'POST',
        p: '/v1/admin/notes',
        body: {
          chapter_id: 0,
          language_code: 'en',
          title: 'Notes',
          pdf_url: 'https://x/y.pdf',
          page_count: 12,
        },
      },
    ],
  ],
  [
    'Admin · questions / tests',
    [
      { m: 'GET', p: '/v1/admin/questions?chapter_id=&page=1&limit=20' },
      { m: 'GET', p: '/v1/admin/questions/{id}', note: 'Includes options.' },
      {
        m: 'POST',
        p: '/v1/admin/questions',
        body: {
          chapter_id: 0,
          prompt_en: '2+2?',
          prompt_bn: '২+২?',
          position: 0,
          options: [
            { position: 0, body_en: '3', body_bn: '৩', is_correct: false },
            { position: 1, body_en: '4', body_bn: '৪', is_correct: true },
          ],
        },
      },
      { m: 'GET', p: '/v1/admin/tests?page=1&limit=20&subject_id=&published=' },
      {
        m: 'GET',
        p: '/v1/admin/tests/{id}',
        note: 'Includes chapter_ids + question_ids.',
      },
      {
        m: 'PATCH',
        p: '/v1/admin/tests/{id}',
        body: { is_published: true },
        note: 'Publish / unpublish.',
      },
    ],
  ],
  [
    'Admin · users & moderation',
    [
      { m: 'GET', p: '/v1/admin/users?page=1&limit=20&status=&search=' },
      { m: 'GET', p: '/v1/admin/users/{id}', note: 'Returns { user, roles }.' },
      { m: 'POST', p: '/v1/admin/users/{id}/ban', body: { reason: 'spam' } },
      {
        m: 'POST',
        p: '/v1/admin/users/{id}/suspend',
        body: { reason: 'review' },
      },
      { m: 'POST', p: '/v1/admin/users/{id}/reinstate' },
      { m: 'DELETE', p: '/v1/admin/users/{id}', note: 'super_admin only.' },
    ],
  ],
  [
    'Admin · sessions / attempts / battles / follows / audit',
    [
      { m: 'GET', p: '/v1/admin/sessions?user_id=' },
      { m: 'DELETE', p: '/v1/admin/sessions/{id}' },
      { m: 'GET', p: '/v1/admin/attempts?user_id=&test_id=' },
      { m: 'GET', p: '/v1/admin/attempts/{id}', note: 'Includes answers.' },
      { m: 'GET', p: '/v1/admin/battles?status=' },
      { m: 'GET', p: '/v1/admin/battles/{id}', note: 'Includes participants.' },
      { m: 'POST', p: '/v1/admin/battles/{id}/finish' },
      { m: 'GET', p: '/v1/admin/follows?follower_id=&followee_id=' },
      { m: 'DELETE', p: '/v1/admin/follows/{follower}/{followee}' },
      { m: 'GET', p: '/v1/admin/audit?user_id=&limit=50' },
    ],
  ],
  [
    'Super admin · RBAC',
    [
      { m: 'GET', p: '/v1/admin/permissions' },
      {
        m: 'POST',
        p: '/v1/admin/permissions',
        body: { name: 'reports:read', description: 'View reports' },
      },
      {
        m: 'PATCH',
        p: '/v1/admin/permissions/{id}',
        body: { description: 'Updated' },
      },
      { m: 'DELETE', p: '/v1/admin/permissions/{id}' },
      { m: 'GET', p: '/v1/admin/roles' },
      { m: 'GET', p: '/v1/admin/roles/{id}', note: 'Includes permissions.' },
      {
        m: 'POST',
        p: '/v1/admin/roles',
        body: { name: 'analyst', description: 'Reports analyst' },
      },
      {
        m: 'PUT',
        p: '/v1/admin/roles/{id}/permissions',
        body: { permission_ids: ['<perm-uuid>'] },
      },
      { m: 'POST', p: '/v1/admin/users/{id}/roles', body: { role: 'admin' } },
      { m: 'DELETE', p: '/v1/admin/users/{id}/roles/{role}' },
      {
        m: 'PUT',
        p: '/v1/admin/users/{id}/roles',
        body: { roles: ['admin', 'teacher'] },
      },
    ],
  ],
]

const METHOD_CLASS: Record<Method, string> = {
  GET: 'bg-sky-600 text-white',
  POST: 'bg-emerald-600 text-white',
  PATCH: 'bg-amber-600 text-white',
  PUT: 'bg-violet-600 text-white',
  DELETE: 'bg-destructive text-white',
}

interface Result {
  status: number
  ms: number
  text: string
}

function statusClass(status: number) {
  if (status >= 200 && status < 300) return 'text-emerald-600'
  if (status === 0) return 'text-destructive'
  return 'text-destructive'
}

function EndpointCard({ ep }: { ep: EndpointDef }) {
  const [path, setPath] = useState(ep.p)
  const [body, setBody] = useState(
    ep.body ? JSON.stringify(ep.body, null, 2) : ''
  )
  const [res, setRes] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)

  async function send() {
    setBusy(true)
    setRes(null)
    const started = performance.now()
    let data: unknown
    if (ep.m !== 'GET' && body.trim()) {
      try {
        data = JSON.parse(body)
      } catch {
        setRes({ status: 0, ms: 0, text: 'Invalid JSON body.' })
        setBusy(false)
        return
      }
    }
    try {
      const r = await api.request({
        url: path,
        method: ep.m,
        data,
        validateStatus: () => true,
      })
      setRes({
        status: r.status,
        ms: Math.round(performance.now() - started),
        text: JSON.stringify(r.data, null, 2),
      })
    } catch (err) {
      setRes({
        status: 0,
        ms: Math.round(performance.now() - started),
        text: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge
            className={cn('min-w-[62px] justify-center', METHOD_CLASS[ep.m])}
          >
            {ep.m}
          </Badge>
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="font-mono text-xs"
          />
          <Button onClick={() => void send()} disabled={busy} size="sm">
            {busy ? '…' : 'Send'}
          </Button>
        </div>
        {ep.note && <p className="text-muted-foreground text-xs">{ep.note}</p>}
        {ep.body !== undefined && ep.m !== 'GET' && (
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="font-mono text-xs"
            rows={5}
          />
        )}
        {res && (
          <pre className="bg-muted max-h-80 overflow-auto rounded-md p-3 text-xs">
            <span className={cn('font-bold', statusClass(res.status))}>
              {res.status || 'ERR'}
            </span>
            <span className="text-muted-foreground">{`  ${res.ms} ms`}</span>
            {'\n' + res.text}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}

export function ApiTesterPage() {
  const [filter, setFilter] = useState('')

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return GROUPS
    return GROUPS.map(
      ([name, eps]) =>
        [
          name,
          eps.filter((e) => `${e.p} ${name}`.toLowerCase().includes(q)),
        ] as [string, EndpointDef[]]
    ).filter(([, eps]) => eps.length)
  }, [filter])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">API Tester</h2>
        <p className="text-muted-foreground text-sm">
          Requests run through your authenticated session ({env.apiUrl}) — the
          access token, CSRF, and cookies are attached automatically. Fill{' '}
          <code className="text-foreground font-mono">{'{id}'}</code>{' '}
          placeholders in the path before sending.
        </p>
      </div>

      <Input
        placeholder="Filter endpoints…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-xs"
      />

      {groups.map(([name, eps]) => (
        <div key={name} className="space-y-2">
          <h3 className="text-muted-foreground pt-2 text-xs font-semibold tracking-wide uppercase">
            {name}
          </h3>
          {eps.map((ep, i) => (
            <EndpointCard key={name + i} ep={ep} />
          ))}
        </div>
      ))}
    </div>
  )
}
