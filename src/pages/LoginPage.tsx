import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoCredentials, useAuth } from '@/features/auth'
import { ApiError } from '@/lib/api'
import { ROUTES } from '@/routes/paths'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(demoCredentials.email)
  const [password, setPassword] = useState(demoCredentials.password)
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = status === 'authenticating'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      await login({ email, password })
      const from = (location.state as LocationState | null)?.from?.pathname
      toast.success('Welcome back!')
      navigate(from ?? ROUTES.dashboard, { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to sign in.'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs"
                onClick={() =>
                  toast.info('Password reset is not wired up yet.')
                }
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="bg-muted/50 text-muted-foreground mt-6 rounded-md p-3 text-xs">
          <p className="text-foreground mb-1 font-medium">Demo credentials</p>
          <p>Email: {demoCredentials.email}</p>
          <p>Password: {demoCredentials.password}</p>
        </div>
      </CardContent>
    </Card>
  )
}
