import { ShieldAlert } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth'

export function RequireRole({
  role,
  children,
}: {
  role: string
  children: React.ReactNode
}) {
  const { hasRole } = useAuth()

  if (!hasRole(role)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="text-destructive size-5" />
            403 — Access denied
          </CardTitle>
          <CardDescription>
            This area is restricted to the{' '}
            <code className="text-foreground font-mono">{role}</code> role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Ask a super admin if you need access.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
