export type Role = 'admin' | 'client'

export type LoanStatus = 'Active' | 'Overdue' | 'Completed'

export interface Profile {
  id: string
  role: Role
  full_name: string
  client_id: string | null
  email: string
  created_at: string
}

export interface Loan {
  id: string
  profile_id: string
  total_amount: number
  amount_paid: number
  monthly_payment: number
  start_date: string
  due_date: string
  status: LoanStatus
  created_at: string
}

export interface Payment {
  id: string
  loan_id: string
  month: string
  amount: number
  paid: boolean
  recorded_at: string
}

export interface ClientWithLoan extends Profile {
  loan: Loan | null
}
