import type { SessionOptions } from 'iron-session'

export interface SessionUser {
  id: string
  email: string
  role: 'admin' | 'client'
  full_name: string
  client_id: string | null
}

export interface SessionData {
  user?: SessionUser
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'mijoe-loan-tracker-dev-secret-key-2026-x',
  cookieName: 'lt-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  },
}
