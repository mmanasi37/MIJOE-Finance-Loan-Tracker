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
import Link from 'next/link'

interface AdminNavProps {
  fullName: string
  email: string
}

export default function AdminNav({ fullName, email }: AdminNavProps) {
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
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:glow-gold transition-all duration-200">
                <span className="font-heading font-bold text-sm text-primary">LT</span>
              </div>
              <span className="font-heading font-semibold text-sm text-foreground hidden sm:block">MIJOE Finance Loan Tracker</span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/admin/dashboard"
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/clients/new"
                className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              >
                Add Client
              </Link>
            </nav>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all duration-150 cursor-pointer outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-heading font-semibold border border-primary/20">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <DropdownMenuLabel>
                <div className="font-medium text-foreground">{fullName}</div>
                <div className="text-xs text-muted-foreground font-normal">{email}</div>
              </DropdownMenuLabel>
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
