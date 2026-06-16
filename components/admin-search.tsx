'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AdminSearchProps {
  defaultQuery?: string
  defaultStatus?: string
}

const STATUS_OPTIONS = ['all', 'Active', 'Overdue', 'Completed']

export default function AdminSearch({ defaultQuery = '', defaultStatus = 'all' }: AdminSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') params.set(key, value)
        else params.delete(key)
      })
      return params.toString()
    },
    [searchParams]
  )

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const qs = createQueryString({ q: e.target.value })
    router.replace(`${pathname}?${qs}`)
  }

  function handleStatus(status: string) {
    const qs = createQueryString({ status })
    router.replace(`${pathname}?${qs}`)
  }

  const activeStatus = defaultStatus || 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Search by name or Client ID…"
        defaultValue={defaultQuery}
        onChange={handleSearch}
        className="sm:max-w-xs bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
      />
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((s) => {
          const isActive = activeStatus === s
          return (
            <Button
              key={s}
              size="sm"
              onClick={() => handleStatus(s)}
              className={`cursor-pointer text-xs capitalize transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 glow-gold'
                  : 'bg-transparent border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
