import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionOptions, type SessionData } from '@/lib/session'
import AdminNav from '@/components/admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.user || session.user.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <AdminNav fullName={session.user.full_name} email={session.user.email} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
