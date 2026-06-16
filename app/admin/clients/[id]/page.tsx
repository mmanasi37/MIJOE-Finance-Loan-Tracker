import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoanStatus } from '@/lib/types'
import Link from 'next/link'
import EditClientForm from '@/components/edit-client-form'
import PaymentList from '@/components/payment-list'
import AddPaymentForm from '@/components/add-payment-form'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount)
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'client')
    .single()

  if (!profile) notFound()

  const { data: loan } = await supabase
    .from('loans')
    .select('*')
    .eq('profile_id', id)
    .single()

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('loan_id', loan?.id ?? '')
    .order('recorded_at', { ascending: false })

  const balance = loan ? loan.total_amount - loan.amount_paid : 0
  const progress = loan ? Math.round((loan.amount_paid / loan.total_amount) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to dashboard
        </Link>
        <div className="mt-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">{profile.full_name}</h1>
          <code className="font-heading text-sm text-primary/70 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
            {profile.client_id}
          </code>
        </div>
      </div>

      {/* Loan Summary */}
      {loan && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Loan', value: formatCurrency(loan.total_amount), color: 'text-foreground' },
            { label: 'Paid', value: formatCurrency(loan.amount_paid), color: 'text-emerald-400' },
            { label: 'Balance', value: formatCurrency(balance), color: 'text-primary' },
            { label: 'Progress', value: `${progress}%`, color: progress === 100 ? 'text-emerald-400' : 'text-accent' },
          ].map((item) => (
            <Card key={item.label} className="bg-card border-border shadow-none">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
                <p className={`font-heading text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Loan Status */}
      {loan && (
        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-sm font-semibold text-foreground">Loan Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <EditClientForm loanId={loan.id} currentStatus={loan.status as LoanStatus} email={profile.email} />
          </CardContent>
        </Card>
      )}

      {/* Add Payment */}
      {loan && (
        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-sm font-semibold text-foreground">Record Payment</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <AddPaymentForm loanId={loan.id} monthlyAmount={loan.monthly_payment} />
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card className="bg-card border-border shadow-none">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PaymentList payments={payments ?? []} loanId={loan?.id ?? ''} />
        </CardContent>
      </Card>
    </div>
  )
}
