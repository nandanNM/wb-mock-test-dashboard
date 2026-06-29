import { Construction } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="text-muted-foreground size-5" />
          {title}
        </CardTitle>
        <CardDescription>
          This page is a placeholder, ready for future development.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Build out the {title.toLowerCase()} experience here.
        </p>
      </CardContent>
    </Card>
  )
}
