import { NextResponse } from 'next/server'
import { fetchAccessToken } from '@/lib/garmin-oauth'
import { getRequestToken, saveAccessToken } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const oauthToken    = searchParams.get('oauth_token')    ?? ''
    const oauthVerifier = searchParams.get('oauth_verifier') ?? ''
    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(new URL('/?error=missing_params', request.url))
    }
    const { secret: requestTokenSecret } = await getRequestToken()
    const { access_token, access_token_secret } = await fetchAccessToken(
      oauthToken, requestTokenSecret, oauthVerifier,
    )
    await saveAccessToken(access_token, access_token_secret)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('[auth/callback]', error)
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url))
  }
}
