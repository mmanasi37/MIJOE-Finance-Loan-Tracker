import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientNav from '@/components/client-nav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, client_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'client') redirect('/admin/dashboard')

  return (
    <div className="min-h-screen bg-background">
      <ClientNav fullName={profile.full_name} clientId={profile.client_id ?? ''} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
