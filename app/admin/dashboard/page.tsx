import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoanStatus } from '@/lib/types'
import Link from 'next/link'
import AdminSearch from '@/components/admin-search'

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  )
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q, status } = await searchParams
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, client_id, email, created_at, loans(id, total_amount, amount_paid, status, due_date)')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  let filtered = clients ?? []

  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.full_name.toLowerCase().includes(lower) ||
        (c.client_id ?? '').toLowerCase().includes(lower)
    )
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => {
      const loan = Array.isArray(c.loans) ? c.loans[0] : c.loans
      return loan?.status === status
    })
  }

  const all = clients ?? []
  const activeCount = all.filter((c) => { const l = Array.isArray(c.loans) ? c.loans[0] : c.loans; return l?.status === 'Active' }).length
  const overdueCount = all.filter((c) => { const l = Array.isArray(c.loans) ? c.loans[0] : c.loans; return l?.status === 'Overdue' }).length
  const completedCount = all.filter((c) => { const l = Array.isArray(c.loans) ? c.loans[0] : c.loans; return l?.status === 'Completed' }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Client Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">{all.length} total clients</p>
        </div>
        <Link href="/admin/clients/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer glow-gold">
            + Add New Client
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: all.length, color: 'text-foreground' },
          { label: 'Active', value: activeCount, color: 'text-emerald-400' },
          { label: 'Overdue', value: overdueCount, color: 'text-red-400' },
          { label: 'Completed', value: completedCount, color: 'text-muted-foreground' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border shadow-none">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-heading font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <AdminSearch defaultQuery={q} defaultStatus={status} />

      {/* Table */}
      <Card className="bg-card border-border shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">All Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No clients found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground">Client</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Client ID</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs text-muted-foreground text-right">Balance</TableHead>
                    <TableHead className="text-xs text-muted-foreground text-right">Loan Total</TableHead>
                    <TableHead className="text-xs text-muted-foreground">Due Date</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((client) => {
                    const loan = Array.isArray(client.loans) ? client.loans[0] : client.loans
                    const balance = loan ? loan.total_amount - loan.amount_paid : null

                    return (
                      <TableRow key={client.id} className="border-border hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">{client.full_name}</p>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="font-heading text-xs bg-muted px-2 py-0.5 rounded text-primary/80 border border-border">
                            {client.client_id ?? '—'}
                          </code>
                        </TableCell>
                        <TableCell>
                          {loan ? <StatusBadge status={loan.status as LoanStatus} /> : <span className="text-xs text-muted-foreground">No loan</span>}
                        </TableCell>
                        <TableCell className="text-right text-sm font-heading font-medium text-foreground">
                          {balance !== null ? formatCurrency(balance) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground font-heading">
                          {loan ? formatCurrency(loan.total_amount) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-heading">
                          {loan?.due_date ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/clients/${client.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                            >
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
