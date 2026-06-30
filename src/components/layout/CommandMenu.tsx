import { Monitor, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useTheme } from '@/components/theme/useTheme'
import { NAV_GROUPS, NAV_ENTRIES } from '@/config/resources'
import { useAuth } from '@/features/auth'

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { can } = useAuth()
  const { setTheme } = useTheme()

  const visible = NAV_ENTRIES.filter(
    (item) => !item.readPerm || can(item.readPerm)
  )

  function go(path: string) {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {NAV_GROUPS.map((group) => {
          const items = visible.filter((item) => item.group === group)
          if (!items.length) return null
          return (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.path}
                  value={`${item.label} ${item.path}`}
                  onSelect={() => go(item.path)}
                >
                  <item.icon />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            value="theme light"
            onSelect={() => {
              setTheme('light')
              onOpenChange(false)
            }}
          >
            <Sun />
            Light
          </CommandItem>
          <CommandItem
            value="theme dark"
            onSelect={() => {
              setTheme('dark')
              onOpenChange(false)
            }}
          >
            <Moon />
            Dark
          </CommandItem>
          <CommandItem
            value="theme system"
            onSelect={() => {
              setTheme('system')
              onOpenChange(false)
            }}
          >
            <Monitor />
            System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
