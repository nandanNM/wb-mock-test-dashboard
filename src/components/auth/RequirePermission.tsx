import { ShieldAlert } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/features/auth'

export function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: React.ReactNode
}) {
  const { can } = useAuth()

  if (!can(permission)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="text-destructive size-5" />
            403 — Access denied
          </CardTitle>
          <CardDescription>
            You don&apos;t have permission to view this resource.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Required permission:{' '}
            <code className="text-foreground font-mono">{permission}</code>
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
