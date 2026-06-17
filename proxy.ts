import { getIronSession } from 'iron-session'
import { NextResponse, type NextRequest } from 'next/server'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  const { pathname } = request.nextUrl
  const user = session.user

  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(
      new URL(user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard', request.url)
    )
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
