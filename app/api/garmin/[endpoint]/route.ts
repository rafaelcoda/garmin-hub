import { NextResponse } from 'next/server'
import { createGarminClient } from '@/lib/garmin-oauth'
import { getAccessToken, isAuthenticated } from '@/lib/session'

const VALID_ENDPOINTS = new Set([
  'dailies', 'activities', 'sleeps', 'hrv', 'epochs', 'bodyComps', 'userMetrics',
])

export async function GET(
  request: Request,
  { params }: { params: { endpoint: string } },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  const { endpoint } = params
  if (!VALID_ENDPOINTS.has(endpoint)) {
    return NextResponse.json({ error: 'Endpoint inválido' }, { status: 400 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const now   = Math.floor(Date.now() / 1000)
    const start = parseInt(searchParams.get('start') ?? String(now - 7 * 86400))
    const end   = parseInt(searchParams.get('end')   ?? String(now))
    const { token, secret } = await getAccessToken()
    const client = createGarminClient(token, secret)
    if (!(endpoint in client)) {
      return NextResponse.json({ error: 'Endpoint inválido' }, { status: 400 })
    }
    const handler = client[endpoint as keyof typeof client]
    const data = await handler(start, end)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error(`[garmin/${params.endpoint}]`, error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
