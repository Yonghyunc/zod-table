import { NextRequest, NextResponse } from 'next/server'
import { authRedirectResponse, requireAuth } from '@/lib/auth'

const PUBLIC_PATHS = new Set(['/login', '/signup'])

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname)
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublic = isPublicPath(pathname)
  const auth = await requireAuth(request)
  if (!auth.payload) {
    if (isPublic) {
      return NextResponse.next()
    }

    return authRedirectResponse(request, auth.reason ?? undefined)
  }

  if (isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
