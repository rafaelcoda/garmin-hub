/**
 * app/api/ai/analyze/route.ts
 * Envia métricas do usuário para Claude e retorna análise em português.
 */

import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/session'

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { metrics, question } = body as { metrics: unknown; question?: string }

  const systemPrompt = `Você é um coach esportivo especializado em dados de wearables Garmin.
Analise as métricas fornecidas e dê insights práticos e personalizados em português brasileiro.
Seja direto, use linguagem acessível, e sempre termine com 1-2 recomendações acionáveis.
Formate a resposta em markdown com seções curtas.`

  const userPrompt = question
    ? `Pergunta: ${question}\n\nDados recentes:\n${JSON.stringify(metrics, null, 2)}`
    : `Analise minhas métricas recentes e identifique tendências, pontos de atenção e oportunidades de melhora:\n\n${JSON.stringify(metrics, null, 2)}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text ?? 'Não foi possível gerar análise.'

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error('[ai/analyze]', error)
    return NextResponse.json({ error: 'Falha na análise IA' }, { status: 500 })
  }
}
