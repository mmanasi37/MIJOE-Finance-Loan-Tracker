'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Payment } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

interface PaymentListProps {
  payments: Payment[]
  loanId: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount)
}

export default function PaymentList({ payments, loanId }: PaymentListProps) {
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function togglePaid(payment: Payment) {
    setToggling(payment.id)
    const newPaid = !payment.paid

    const { error } = await supabase.from('payments').update({ paid: newPaid }).eq('id', payment.id)

    if (error) {
      toast.error('Failed to update: ' + error.message)
    } else {
      const { data: allPayments } = await supabase
        .from('payments')
        .select('id, amount, paid')
        .eq('loan_id', loanId)

      if (allPayments) {
        const totalPaid = allPayments
          .map((p) => (p.id === payment.id ? { ...p, paid: newPaid } : p))
          .filter((p) => p.paid)
          .reduce((sum, p) => sum + p.amount, 0)

        const { data: loan } = await supabase.from('loans').select('total_amount').eq('id', loanId).single()

        await supabase
          .from('loans')
          .update({ amount_paid: totalPaid, ...(loan && totalPaid >= loan.total_amount ? { status: 'Completed' } : {}) })
          .eq('id', loanId)
      }

      toast.success(newPaid ? 'Marked as paid' : 'Marked as unpaid')
      router.refresh()
    }
    setToggling(null)
  }

  if (payments.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        No payments recorded yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs text-muted-foreground">Month</TableHead>
            <TableHead className="text-xs text-muted-foreground text-right">Amount</TableHead>
            <TableHead className="text-xs text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs text-muted-foreground">Recorded</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="border-border hover:bg-muted/40 transition-colors">
              <TableCell className="font-heading font-medium text-sm text-foreground">{payment.month}</TableCell>
              <TableCell className="text-right font-heading text-sm text-foreground">{formatCurrency(payment.amount)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  payment.paid
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {payment.paid ? 'Paid' : 'Unpaid'}
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-heading">
                {new Date(payment.recorded_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={toggling === payment.id}
                  onClick={() => togglePaid(payment)}
                  className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                >
                  {toggling === payment.id ? '…' : payment.paid ? 'Undo' : 'Mark Paid'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
