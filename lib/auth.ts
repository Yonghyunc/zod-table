import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

export const AUTH_COOKIE_NAME = 'auth_token'
export const AUTH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const JWT_ALGORITHM = 'HS256'

export interface AuthTokenPayload extends JWTPayload {
  sub: string
  userId: string
  name: string
}

export type AuthFailureReason = 'missing_secret' | 'missing_token' | 'invalid_token'

export interface AuthResult {
  payload: AuthTokenPayload | null
  reason: AuthFailureReason | null
}

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return new TextEncoder().encode(secret)
}

export async function createAuthToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecretKey())
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: [JWT_ALGORITHM],
    })

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.userId !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.exp !== 'number'
    ) {
      return null
    }

    return payload as AuthTokenPayload
  } catch {
    return null
  }
}

export function getAuthTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value
}

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  if (!process.env.JWT_SECRET) {
    return { payload: null, reason: 'missing_secret' }
  }

  const token = getAuthTokenFromRequest(request)
  if (!token) {
    return { payload: null, reason: 'missing_token' }
  }

  const payload = await verifyAuthToken(token)
  if (!payload) {
    return { payload: null, reason: 'invalid_token' }
  }

  return { payload, reason: null }
}

export function unauthorizedResponse(reason?: AuthFailureReason) {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      reason: reason ?? 'invalid_token',
    },
    { status: 401 }
  )
}

export function authRedirectResponse(request: NextRequest, reason?: AuthFailureReason) {
  const response = NextResponse.redirect(new URL('/login', request.url))

  if ((reason ?? 'invalid_token') === 'invalid_token') {
    response.cookies.delete(AUTH_COOKIE_NAME)
  }

  return response
}
