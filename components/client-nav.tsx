'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ClientNavProps {
  fullName: string
  clientId: string
}

export default function ClientNav({ fullName, clientId }: ClientNavProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="font-heading font-bold text-sm text-primary">LT</span>
            </div>
            <div>
              <span className="font-heading font-semibold text-sm text-foreground block">MIJOE Finance Loan Tracker</span>
              <span className="font-heading text-xs text-primary/70">{clientId}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all duration-150 cursor-pointer outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-heading font-semibold border border-primary/20">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
              <DropdownMenuLabel className="font-medium text-foreground">{fullName}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
