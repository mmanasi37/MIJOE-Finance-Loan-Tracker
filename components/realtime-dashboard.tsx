'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeDashboard({ loanId }: { loanId: string }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`loan-${loanId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans', filter: `id=eq.${loanId}` },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `loan_id=eq.${loanId}` },
        () => router.refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loanId, router, supabase])

  return null
}
