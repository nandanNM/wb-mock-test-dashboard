import { Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { env } from '@/config/env'

export function AuthLayout() {
  return (
    <div className="bg-muted/30 relative flex min-h-svh flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md text-lg font-semibold">
            A
          </div>
          <span className="text-xl font-semibold">{env.appName}</span>
        </div>

        <Outlet />

        <p className="text-muted-foreground mt-8 text-xs">
          &copy; {env.appName}. All rights reserved.
        </p>
      </div>
    </div>
  )
}
