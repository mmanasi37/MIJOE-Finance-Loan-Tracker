'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateLoanStatusAction } from '@/lib/actions'
import { LoanStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const STATUSES: LoanStatus[] = ['Active', 'Overdue', 'Completed']

interface EditClientFormProps {
  loanId: string
  currentStatus: LoanStatus
  email: string
}

export default function EditClientForm({ loanId, currentStatus, email }: EditClientFormProps) {
  const [status, setStatus] = useState<LoanStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    const result = await updateLoanStatusAction(loanId, status)
    if (result.error) {
      toast.error('Failed to update status: ' + result.error)
    } else {
      toast.success('Loan status updated')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="space-y-2 w-full sm:w-48">
        <Label className="text-foreground/80 text-sm">Loan Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as LoanStatus)}>
          <SelectTrigger className="bg-input border-border text-foreground cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-foreground cursor-pointer focus:bg-muted focus:text-foreground">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="text-xs text-muted-foreground pb-2">
        Client: <span className="text-foreground/70 font-heading">{email}</span>
      </div>
      <Button
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer glow-gold sm:ml-auto"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  )
}
