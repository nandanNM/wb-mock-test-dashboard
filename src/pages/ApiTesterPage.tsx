import { Check, Copy, Loader2, Send, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  PATCH: 'bg-amber-500 text-white',
  PUT: 'bg-violet-600 text-white',
  DELETE: 'bg-red-600 text-white',
}

interface Result {
  status: number
  statusText: string
  ms: number
  size: number
  text: string
}

function statusBadgeClass(status: number) {
  if (status >= 200 && status < 300) return 'bg-emerald-600 text-white'
  if (status >= 400 && status < 500) return 'bg-amber-500 text-white'
  return 'bg-red-600 text-white'
}

function formatSize(n: number) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`
}

function ResponsePanel({ res, onClear }: { res: Result; onClear: () => void }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(res.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="bg-muted/60 flex items-center gap-2 border-b px-2 py-1.5">
        <Badge className={cn('rounded-sm', statusBadgeClass(res.status))}>
          {res.status || 'ERR'}
          {res.statusText ? ` ${res.statusText}` : ''}
        </Badge>
        <span className="text-muted-foreground text-xs">
          {res.ms} ms · {formatSize(res.size)}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={copy}
            aria-label="Copy response"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClear}
            aria-label="Clear response"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto p-3 font-mono text-xs whitespace-pre-wrap">
        {res.text}
      </pre>
    </div>
  )
}

function EndpointCard({ ep }: { ep: EndpointDef }) {
  const [path, setPath] = useState(ep.p)
  const [body, setBody] = useState(
    ep.body ? JSON.stringify(ep.body, null, 2) : ''
  )
  const [res, setRes] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isDestructive = ep.m === 'DELETE'

  async function send() {
    setBusy(true)
    setRes(null)
    const started = performance.now()
    let data: unknown
    if (ep.m !== 'GET' && body.trim()) {
      try {
        data = JSON.parse(body)
      } catch {
        setRes({
          status: 0,
          statusText: '',
          ms: 0,
          size: 0,
          text: 'Invalid JSON body.',
        })
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
      const text = JSON.stringify(r.data, null, 2)
      setRes({
        status: r.status,
        statusText: r.statusText ?? '',
        ms: Math.round(performance.now() - started),
        size: new Blob([text]).size,
        text,
      })
    } catch (err) {
      setRes({
        status: 0,
        statusText: '',
        ms: Math.round(performance.now() - started),
        size: 0,
        text: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusy(false)
    }
  }

  function trigger() {
    if (isDestructive) setConfirmOpen(true)
    else void send()
  }

  return (
    <Card className="py-0">
      <CardContent className="space-y-2 p-3">
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              'w-16 justify-center rounded-sm font-mono',
              METHOD_CLASS[ep.m]
            )}
          >
            {ep.m}
          </Badge>
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') trigger()
            }}
            spellCheck={false}
            className="h-9 font-mono text-xs"
          />
          <Button
            onClick={trigger}
            disabled={busy}
            size="sm"
            className="h-9 shrink-0"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send
          </Button>
        </div>
        {ep.note && <p className="text-muted-foreground text-xs">{ep.note}</p>}
        {ep.body !== undefined && ep.m !== 'GET' && (
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck={false}
            className="font-mono text-xs"
            rows={5}
          />
        )}
        {res && <ResponsePanel res={res} onClear={() => setRes(null)} />}
      </CardContent>

      {isDestructive && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Run this DELETE request?</AlertDialogTitle>
              <AlertDialogDescription>
                This sends a real{' '}
                <span className="text-foreground font-mono">DELETE {path}</span>{' '}
                to the live API and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  setConfirmOpen(false)
                  void send()
                }}
              >
                Send DELETE
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
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

  const total = useMemo(
    () => groups.reduce((n, [, eps]) => n + eps.length, 0),
    [groups]
  )

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">API Tester</h2>
          <Badge variant="secondary" className="font-mono">
            {env.apiUrl}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Requests run through your authenticated session — the access token,
          CSRF, and cookies are attached automatically. Fill{' '}
          <code className="text-foreground font-mono">{'{id}'}</code>{' '}
          placeholders in the path before sending. These hit the live API.
        </p>
      </div>

      <div className="bg-background/80 sticky top-16 z-10 flex items-center gap-3 py-1 backdrop-blur">
        <Input
          placeholder="Filter endpoints…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-muted-foreground text-xs">
          {total} endpoint{total === 1 ? '' : 's'}
        </span>
      </div>

      {groups.map(([name, eps]) => (
        <section key={name} className="space-y-2">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {name}
          </h3>
          {eps.map((ep, i) => (
            <EndpointCard key={name + i} ep={ep} />
          ))}
        </section>
      ))}

      {total === 0 && (
        <p className="text-muted-foreground py-10 text-center text-sm">
          No endpoints match “{filter}”.
        </p>
      )}
    </div>
  )
}
