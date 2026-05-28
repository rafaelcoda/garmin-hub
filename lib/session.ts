/**
 * lib/session.ts
 * Armazena tokens OAuth em cookies HTTP-only.
 */

import { cookies } from 'next/headers'

const COOKIE_TOKEN        = 'garmin_access_token'
const COOKIE_TOKEN_SECRET = 'garmin_access_token_secret'
const COOKIE_REQ_TOKEN    = 'garmin_request_token'
const COOKIE_REQ_SECRET   = 'garmin_request_secret'

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/',
  maxAge:   60 * 60 * 24 * 30,
}

export async function saveRequestToken(token: string, secret: string) {
  const store = await cookies()
  store.set(COOKIE_REQ_TOKEN,  token,  { ...COOKIE_OPTS, maxAge: 600 })
  store.set(COOKIE_REQ_SECRET, secret, { ...COOKIE_OPTS, maxAge: 600 })
}

export async function getRequestToken() {
  const store = await cookies()
  return {
    token:  store.get(COOKIE_REQ_TOKEN)?.value  ?? '',
    secret: store.get(COOKIE_REQ_SECRET)?.value ?? '',
  }
}

export async function saveAccessToken(token: string, secret: string) {
  const store = await cookies()
  store.set(COOKIE_TOKEN,        token,  COOKIE_OPTS)
  store.set(COOKIE_TOKEN_SECRET, secret, COOKIE_OPTS)
}

export async function getAccessToken() {
  const store = await cookies()
  return {
    token:  store.get(COOKIE_TOKEN)?.value        ?? '',
    secret: store.get(COOKIE_TOKEN_SECRET)?.value ?? '',
  }
}

export async function isAuthenticated() {
  const store = await cookies()
  return !!store.get(COOKIE_TOKEN)?.value
}

export async function clearTokens() {
  const store = await cookies()
  store.delete(COOKIE_TOKEN)
  store.delete(COOKIE_TOKEN_SECRET)
}
