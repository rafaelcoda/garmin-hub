import { NextResponse } from 'next/server'
import { fetchRequestToken, buildAuthorizationUrl } from '@/lib/garmin-oauth'
import { saveRequestToken } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const baseUrl     = new URL(request.url).origin
    const callbackUrl = `${baseUrl}/api/auth/callback`
    const { oauth_token, oauth_token_secret } = await fetchRequestToken(callbackUrl)
    await saveRequestToken(oauth_token, oauth_token_secret)
    const authUrl = buildAuthorizationUrl(oauth_token)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('[auth/login]', error)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}
