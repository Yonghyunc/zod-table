import { NextRequest, NextResponse } from 'next/server'
import {
  AUTH_USER_ID_HEADER,
  AUTH_USER_NAME_HEADER,
  authRedirectResponse,
  requireAuth,
} from '@/lib/auth'

const PUBLIC_PATHS = new Set(['/login', '/signup'])

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname)
}

function stripAuthHeaders(headers: Headers): Headers {
  const next = new Headers(headers)
  next.delete(AUTH_USER_ID_HEADER)
  next.delete(AUTH_USER_NAME_HEADER)
  return next
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublic = isPublicPath(pathname)
  const auth = await requireAuth(request)

  if (!auth.payload) {
    if (isPublic) {
      return NextResponse.next({
        request: { headers: stripAuthHeaders(request.headers) },
      })
    }

    return authRedirectResponse(request, auth.reason ?? undefined)
  }

  if (isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const headers = stripAuthHeaders(request.headers)
  headers.set(AUTH_USER_ID_HEADER, auth.payload.userId)
  headers.set(AUTH_USER_NAME_HEADER, auth.payload.name)

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
