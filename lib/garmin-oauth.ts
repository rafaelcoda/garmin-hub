/**
 * lib/garmin-oauth.ts
 * Cliente OAuth 1.0a para a Garmin Health API — apenas server-side.
 * Nunca importe este arquivo em componentes client ("use client").
 */

import OAuth from 'oauth-1.0a'
import CryptoJS from 'crypto-js'
import axios, { AxiosRequestConfig } from 'axios'

const GARMIN_OAUTH_BASE   = process.env.GARMIN_OAUTH_BASE   ?? 'https://connectapi.garmin.com'
const GARMIN_HEALTH_BASE  = process.env.GARMIN_HEALTH_API_BASE ?? 'https://healthapi.garmin.com/wellness-api/rest'

// ─── Fábrica OAuth ────────────────────────────────────────────────────────────

function buildOAuth(consumerKey: string, consumerSecret: string) {
  return new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString: string, key: string) {
      return CryptoJS.HmacSHA1(baseString, key).toString(CryptoJS.enc.Base64)
    },
  })
}

// ─── Passo 1: Request Token ───────────────────────────────────────────────────

export async function fetchRequestToken(callbackUrl: string) {
  const key    = process.env.GARMIN_CONSUMER_KEY!
  const secret = process.env.GARMIN_CONSUMER_SECRET!
  const oauth  = buildOAuth(key, secret)

  const url         = `${GARMIN_OAUTH_BASE}/oauth-service/oauth/request_token`
  const requestData = { url, method: 'POST' }
  const headers     = oauth.toHeader(oauth.authorize(requestData))

  const res = await axios.post(url, null, {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    params:  { oauth_callback: callbackUrl },
  })

  const params            = new URLSearchParams(res.data as string)
  const oauth_token       = params.get('oauth_token')!
  const oauth_token_secret = params.get('oauth_token_secret')!

  return { oauth_token, oauth_token_secret }
}

// ─── Passo 2: URL de autorização ──────────────────────────────────────────────

export function buildAuthorizationUrl(oauthToken: string) {
  return `https://connect.garmin.com/oauthConfirm?oauth_token=${oauthToken}`
}

// ─── Passo 3: Access Token ────────────────────────────────────────────────────

export async function fetchAccessToken(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string,
) {
  const key    = process.env.GARMIN_CONSUMER_KEY!
  const secret = process.env.GARMIN_CONSUMER_SECRET!
  const oauth  = buildOAuth(key, secret)

  const url         = `${GARMIN_OAUTH_BASE}/oauth-service/oauth/access_token`
  const token       = { key: oauthToken, secret: oauthTokenSecret }
  const requestData = { url, method: 'POST' }
  const headers     = oauth.toHeader(oauth.authorize(requestData, token))

  const res = await axios.post(url, null, {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    params:  { oauth_verifier: oauthVerifier },
  })

  const params             = new URLSearchParams(res.data as string)
  const access_token       = params.get('oauth_token')!
  const access_token_secret = params.get('oauth_token_secret')!

  return { access_token, access_token_secret }
}

// ─── Cliente autenticado ──────────────────────────────────────────────────────

export function createGarminClient(accessToken: string, accessTokenSecret: string) {
  const key    = process.env.GARMIN_CONSUMER_KEY!
  const secret = process.env.GARMIN_CONSUMER_SECRET!
  const oauth  = buildOAuth(key, secret)
  const token  = { key: accessToken, secret: accessTokenSecret }

  async function get<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    const url         = `${GARMIN_HEALTH_BASE}${path}`
    const requestData = { url, method: 'GET' }
    const headers     = oauth.toHeader(oauth.authorize(requestData, token))

    const config: AxiosRequestConfig = { headers, params }
    const res = await axios.get<T>(url, config)
    return res.data
  }

  const rangeParams = (start: number, end: number) => ({
    uploadStartTimeInSeconds: start,
    uploadEndTimeInSeconds:   end,
  })

  return {
    dailies:    (s: number, e: number) => get('/dailies',    rangeParams(s, e)),
    activities: (s: number, e: number) => get('/activities', rangeParams(s, e)),
    sleeps:     (s: number, e: number) => get('/sleeps',     rangeParams(s, e)),
    hrv:        (s: number, e: number) => get('/hrv',        rangeParams(s, e)),
    epochs:     (s: number, e: number) => get('/epochs',     rangeParams(s, e)),
    bodyComps:  (s: number, e: number) => get('/bodyComps',  rangeParams(s, e)),
    userMetrics:(s: number, e: number) => get('/userMetrics',rangeParams(s, e)),
  }
}

// ─── Helper: tokens da sessão ─────────────────────────────────────────────────

export function getTokensFromEnv() {
  return {
    accessToken:       process.env.GARMIN_ACCESS_TOKEN ?? '',
    accessTokenSecret: process.env.GARMIN_ACCESS_TOKEN_SECRET ?? '',
  }
}

export function hasTokens() {
  return !!process.env.GARMIN_ACCESS_TOKEN && !!process.env.GARMIN_ACCESS_TOKEN_SECRET
}
