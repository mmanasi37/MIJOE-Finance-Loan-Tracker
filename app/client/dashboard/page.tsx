import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getDb } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { LoanStatus } from '@/lib/types'
import PaymentChart from '@/components/payment-chart'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount)
}

function StatusBadge({ status }: { status: LoanStatus }) {
  const styles: Record<LoanStatus, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
    Completed: 'bg-muted text-muted-foreground border-border',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  )
}

export default async function ClientDashboard() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.user) redirect('/login')

  const db = getDb()
  const loan = db.prepare('SELECT * FROM loans WHERE profile_id = ?').get(session.user.id) as {
    id: string; total_amount: number; amount_paid: number; monthly_payment: number;
    start_date: string; due_date: string; status: string;
  } | undefined

  const payments = loan
    ? (db.prepare('SELECT * FROM payments WHERE loan_id = ? ORDER BY month ASC').all(loan.id) as {
        id: string; month: string; amount: number; paid: number;
      }[])
    : []

  const balance = loan ? loan.total_amount - loan.amount_paid : 0
  const progress = loan ? Math.min(Math.round((loan.amount_paid / loan.total_amount) * 100), 100) : 0

  const chartData = payments.map((p) => ({
    month: p.month,
    amount: p.paid ? p.amount : 0,
    paid: Boolean(p.paid),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Loan Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {session.user.full_name}</p>
        </div>
        {loan && <StatusBadge status={loan.status as LoanStatus} />}
      </div>

      {loan ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Loan', value: formatCurrency(loan.total_amount), color: 'text-foreground' },
            { label: 'Amount Paid', value: formatCurrency(loan.amount_paid), color: 'text-emerald-400' },
            { label: 'Balance Remaining', value: formatCurrency(balance), color: balance > 0 ? 'text-primary' : 'text-emerald-400' },
            { label: 'Monthly Payment', value: formatCurrency(loan.monthly_payment), color: 'text-muted-foreground' },
          ].map((item) => (
            <Card key={item.label} className="bg-card border-border shadow-none">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide leading-tight">{item.label}</p>
                <p className={`font-heading text-xl font-bold mt-1.5 ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border shadow-none">
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No loan information available. Please contact your administrator.
          </CardContent>
        </Card>
      )}

      {loan && (
        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Repayment Progress</CardTitle>
              <span className="font-heading text-2xl font-bold text-primary">{progress}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} className="h-2.5 bg-muted" />
            <div className="flex justify-between text-xs text-muted-foreground font-heading">
              <span>Start: {loan.start_date}</span>
              <span>Due: {loan.due_date}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentChart data={chartData} />
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">Payment Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No payment records yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground">Month</TableHead>
                    <TableHead className="text-xs text-muted-foreground text-right">Amount</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...payments].reverse().map((payment) => (
                    <TableRow key={payment.id} className="border-border hover:bg-muted/40 transition-colors">
                      <TableCell className="font-heading font-medium text-sm text-foreground">{payment.month}</TableCell>
                      <TableCell className="text-right font-heading text-sm text-foreground">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          payment.paid
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {payment.paid ? 'Paid' : 'Pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
