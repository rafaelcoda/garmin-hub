import { NextResponse } from 'next/server'
import { clearTokens } from '@/lib/session'

export async function POST(request: Request) {
  clearTokens()
  return NextResponse.redirect(new URL('/', request.url))
}
