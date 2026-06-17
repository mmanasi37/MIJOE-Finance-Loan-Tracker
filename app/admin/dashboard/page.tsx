import { getDb } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
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
  const db = getDb()

  const clients = db.prepare(`
    SELECT p.id, p.full_name, p.client_id, p.email, p.created_at,
           l.id as loan_id, l.total_amount, l.amount_paid, l.status as loan_status, l.due_date
    FROM profiles p
    LEFT JOIN loans l ON l.profile_id = p.id
    WHERE p.role = 'client'
    ORDER BY p.created_at DESC
  `).all() as {
    id: string; full_name: string; client_id: string | null; email: string; created_at: string;
    loan_id: string | null; total_amount: number | null; amount_paid: number | null;
    loan_status: string | null; due_date: string | null;
  }[]

  let filtered = clients

  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter(
      (c) => c.full_name.toLowerCase().includes(lower) || (c.client_id ?? '').toLowerCase().includes(lower)
    )
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.loan_status === status)
  }

  const activeCount = clients.filter((c) => c.loan_status === 'Active').length
  const overdueCount = clients.filter((c) => c.loan_status === 'Overdue').length
  const completedCount = clients.filter((c) => c.loan_status === 'Completed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Client Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} total clients</p>
        </div>
        <Link href="/admin/clients/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer glow-gold">
            + Add New Client
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: clients.length, color: 'text-foreground' },
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

      <AdminSearch defaultQuery={q} defaultStatus={status} />

      <Card className="bg-card border-border shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">All Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">No clients found</div>
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
                    const balance = client.total_amount != null && client.amount_paid != null
                      ? client.total_amount - client.amount_paid
                      : null
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
                          {client.loan_status
                            ? <StatusBadge status={client.loan_status as LoanStatus} />
                            : <span className="text-xs text-muted-foreground">No loan</span>}
                        </TableCell>
                        <TableCell className="text-right text-sm font-heading font-medium text-foreground">
                          {balance !== null ? formatCurrency(balance) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground font-heading">
                          {client.total_amount != null ? formatCurrency(client.total_amount) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-heading">
                          {client.due_date ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/clients/${client.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer">
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
