'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientAction } from '@/lib/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    total_amount: '',
    monthly_payment: '',
    start_date: '',
    due_date: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const result = await createClientAction({
      full_name: form.full_name,
      email: form.email,
      password: form.password,
      total_amount: parseFloat(form.total_amount),
      monthly_payment: parseFloat(form.monthly_payment),
      start_date: form.start_date,
      due_date: form.due_date,
    })

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success(`Client created — ID: ${result.clientId}`)
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to dashboard
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground mt-2">Add New Client</h1>
        <p className="text-sm text-muted-foreground mt-1">A unique Client ID will be generated automatically</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Client Information</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">Personal details and portal access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Full Name</Label>
                <Input name="full_name" placeholder="Jane Smith" value={form.full_name} onChange={handleChange} required className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Email Address</Label>
                <Input name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} required className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm">Temporary Password</Label>
              <Input name="password" type="password" placeholder="Share with client securely (min 8 chars)" value={form.password} onChange={handleChange} required minLength={8} className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">Loan Details</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">Repayment terms for this client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Total Loan Amount ($)</Label>
                <Input name="total_amount" type="number" min="1" step="0.01" placeholder="10000.00" value={form.total_amount} onChange={handleChange} required className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-heading" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Monthly Payment ($)</Label>
                <Input name="monthly_payment" type="number" min="1" step="0.01" placeholder="500.00" value={form.monthly_payment} onChange={handleChange} required className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-heading" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Start Date</Label>
                <Input name="start_date" type="date" value={form.start_date} onChange={handleChange} required className="bg-input border-border text-foreground focus:border-primary font-heading" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 text-sm">Due Date (Full Repayment)</Label>
                <Input name="due_date" type="date" value={form.due_date} onChange={handleChange} required className="bg-input border-border text-foreground focus:border-primary font-heading" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/admin/dashboard">
            <Button variant="outline" type="button" className="cursor-pointer border-border text-muted-foreground hover:text-foreground hover:bg-muted">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer glow-gold">
            {loading ? 'Creating…' : 'Create Client'}
          </Button>
        </div>
      </form>
    </div>
  )
}
