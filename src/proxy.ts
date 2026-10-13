import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Redirect optimista por cookie: NO es seguridad. La sesión se valida de verdad en el layout del
// panel y en cada Server Action (requireUser en src/lib/session.ts).
export async function proxy(request: NextRequest) {
  const hasSession = !!getSessionCookie(request)

  const path = request.nextUrl.pathname
  const isLogin = path === '/dashboard/login'
  const isSetPassword = path === '/dashboard/set-password'
  const isForgotPassword = path === '/dashboard/forgot-password'

  if (!isLogin && !isSetPassword && !isForgotPassword && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (isLogin && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
