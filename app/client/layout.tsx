import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionOptions, type SessionData } from '@/lib/session'
import ClientNav from '@/components/client-nav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.user || session.user.role !== 'client') redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <ClientNav fullName={session.user.full_name} clientId={session.user.client_id ?? ''} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
