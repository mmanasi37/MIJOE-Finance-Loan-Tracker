'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface AddPaymentFormProps {
  loanId: string
  monthlyAmount: number
}

export default function AddPaymentForm({ loanId, monthlyAmount }: AddPaymentFormProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const [amount, setAmount] = useState(monthlyAmount.toString())
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const paymentAmount = parseFloat(amount)

    const { error: paymentError } = await supabase.from('payments').insert({
      loan_id: loanId,
      month,
      amount: paymentAmount,
      paid: true,
    })

    if (paymentError) {
      toast.error('Failed to record payment: ' + paymentError.message)
      setSaving(false)
      return
    }

    const { data: loan } = await supabase
      .from('loans')
      .select('amount_paid, total_amount')
      .eq('id', loanId)
      .single()

    if (loan) {
      const newAmountPaid = loan.amount_paid + paymentAmount
      const newStatus = newAmountPaid >= loan.total_amount ? 'Completed' : undefined

      await supabase
        .from('loans')
        .update({ amount_paid: newAmountPaid, ...(newStatus ? { status: newStatus } : {}) })
        .eq('id', loanId)
    }

    toast.success(`Payment of $${paymentAmount.toFixed(2)} recorded for ${month}`)
    setMonth(currentMonth)
    setAmount(monthlyAmount.toString())
    router.refresh()
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="space-y-2">
        <Label className="text-foreground/80 text-sm">Month</Label>
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
          className="bg-input border-border text-foreground focus:border-primary font-heading w-40"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground/80 text-sm">Amount ($)</Label>
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="bg-input border-border text-foreground focus:border-primary font-heading w-36"
        />
      </div>
      <Button
        type="submit"
        disabled={saving}
        className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold cursor-pointer glow-purple"
      >
        {saving ? 'Recording…' : 'Mark as Received'}
      </Button>
    </form>
  )
}
