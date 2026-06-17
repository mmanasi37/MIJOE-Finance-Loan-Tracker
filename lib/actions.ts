'use server'

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { sessionOptions, type SessionData } from './session'
import { getDb } from './db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { generateClientId } from './client-id'

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

export async function loginAction(
  email: string,
  password: string
): Promise<{ error?: string; role?: string }> {
  const db = getDb()
  const user = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email) as {
    id: string; email: string; role: string; full_name: string; client_id: string | null; password_hash: string
  } | undefined

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { error: 'Invalid email or password' }
  }

  const session = await getSession()
  session.user = {
    id: user.id,
    email: user.email,
    role: user.role as 'admin' | 'client',
    full_name: user.full_name,
    client_id: user.client_id,
  }
  await session.save()
  return { role: user.role }
}

export async function logoutAction(): Promise<void> {
  const session = await getSession()
  await session.destroy()
}

export async function createClientAction(data: {
  full_name: string
  email: string
  password: string
  total_amount: number
  monthly_payment: number
  start_date: string
  due_date: string
}): Promise<{ error?: string; clientId?: string }> {
  const db = getDb()

  const existing = db.prepare('SELECT 1 FROM profiles WHERE email = ?').get(data.email)
  if (existing) return { error: 'A client with that email already exists' }

  const clientId = generateClientId()
  const userId = randomUUID()

  db.prepare(
    'INSERT INTO profiles (id, role, full_name, email, password_hash, client_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, 'client', data.full_name, data.email, bcrypt.hashSync(data.password, 10), clientId)

  db.prepare(
    'INSERT INTO loans (id, profile_id, total_amount, monthly_payment, start_date, due_date, amount_paid, status) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
  ).run(randomUUID(), userId, data.total_amount, data.monthly_payment, data.start_date, data.due_date, 'Active')

  revalidatePath('/admin/dashboard')
  return { clientId }
}

export async function updateLoanStatusAction(
  loanId: string,
  status: string
): Promise<{ error?: string }> {
  const db = getDb()
  db.prepare('UPDATE loans SET status = ? WHERE id = ?').run(status, loanId)
  revalidatePath('/admin', 'layout')
  return {}
}

export async function addPaymentAction(
  loanId: string,
  month: string,
  amount: number
): Promise<{ error?: string }> {
  const db = getDb()

  db.prepare(
    'INSERT INTO payments (id, loan_id, month, amount, paid) VALUES (?, ?, ?, ?, 1)'
  ).run(randomUUID(), loanId, month, amount)

  const loan = db.prepare('SELECT amount_paid, total_amount FROM loans WHERE id = ?').get(loanId) as
    | { amount_paid: number; total_amount: number }
    | undefined

  if (loan) {
    const newAmountPaid = loan.amount_paid + amount
    const newStatus = newAmountPaid >= loan.total_amount ? 'Completed' : undefined
    if (newStatus) {
      db.prepare('UPDATE loans SET amount_paid = ?, status = ? WHERE id = ?').run(newAmountPaid, newStatus, loanId)
    } else {
      db.prepare('UPDATE loans SET amount_paid = ? WHERE id = ?').run(newAmountPaid, loanId)
    }
  }

  revalidatePath('/admin', 'layout')
  return {}
}

export async function togglePaymentAction(
  paymentId: string,
  loanId: string,
  newPaid: boolean
): Promise<{ error?: string }> {
  const db = getDb()
  db.prepare('UPDATE payments SET paid = ? WHERE id = ?').run(newPaid ? 1 : 0, paymentId)

  const allPayments = db
    .prepare('SELECT amount, paid FROM payments WHERE loan_id = ?')
    .all(loanId) as { amount: number; paid: number }[]
  const totalPaid = allPayments.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0)

  const loan = db.prepare('SELECT total_amount FROM loans WHERE id = ?').get(loanId) as
    | { total_amount: number }
    | undefined

  if (loan) {
    const newStatus = totalPaid >= loan.total_amount ? 'Completed' : 'Active'
    db.prepare('UPDATE loans SET amount_paid = ?, status = ? WHERE id = ?').run(totalPaid, newStatus, loanId)
  }

  revalidatePath('/admin', 'layout')
  return {}
}
