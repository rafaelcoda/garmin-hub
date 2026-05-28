'use client'

import { useState } from 'react'
import { garminApi } from '@/lib/api'

type Message = { role: 'user' | 'assistant'; content: string }

const QUICK_QUESTIONS = [
  'Como está minha recuperação esta semana?',
  'Meu sono está afetando meu desempenho?',
  'Quando é o melhor momento para treinar hoje?',
  'Analise meu HRV dos últimos 7 dias.',
  'Estou treinando demais?',
]

function MarkdownText({ text }: { text: string }) {
  return (
    <div style={{ lineHeight: 1.7, fontSize: 14 }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} style={{ margin: '0.75rem 0 0.25rem', fontSize: 14, fontWeight: 600 }}>{line.slice(4)}</h3>
        if (line.startsWith('## '))  return <h2 key={i} style={{ margin: '1rem 0 0.25rem', fontSize: 15, fontWeight: 600 }}>{line.slice(3)}</h2>
        if (line.startsWith('- '))   return <p key={i} style={{ margin: '0.15rem 0', paddingLeft: 12 }}>• {line.slice(2)}</p>
        if (line.trim() === '')      return <br key={i} />
        return <p key={i} style={{ margin: '0.25rem 0' }}>{line}</p>
      })}
    </div>
  )
}

export default function AIClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const [dailies, sleeps, hrv] = await Promise.all([
        garminApi.dailies(7), garminApi.sleep(7), garminApi.hrv(7)
      ])
      const metrics = { dailies, sleeps, hrv }

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, question }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.analysis ?? 'Erro ao gerar resposta.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Falha na conexão. Verifique se o backend está rodando.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 760 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Análise com IA ✦</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>Coach pessoal baseado nos seus dados Garmin dos últimos 7 dias.</p>
      </div>

      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                background: msg.role === 'user' ? '#0D1F17' : '#fff',
                color: msg.role === 'user' ? '#fff' : 'var(--text-1)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '0.875rem 1rem',
              }}>
                {msg.role === 'assistant' ? <MarkdownText text={msg.content} /> : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '0.875rem 1rem', display: 'flex', gap: 6 }}>
                {[0.1, 0.2, 0.3].map(d => <span key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--garmin)', animation: `pulse-soft 1.2s ease-in-out ${d}s infinite`, display: 'inline-block' }} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {messages.length === 0 && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Perguntas rápidas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: 14, cursor: 'pointer', textAlign: 'left', color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>
                {q} →
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 0, background: 'var(--surface)', paddingTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Pergunte sobre seus dados de saúde..." disabled={loading}
          style={{ flex: 1, padding: '0.75rem 1rem', background: '#fff', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text-1)', outline: 'none' }} />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
          style={{ background: loading || !input.trim() ? '#ccc' : 'var(--garmin)', color: '#fff', border: 'none', borderRadius: 12, padding: '0 1.25rem', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)' }}>
          {loading ? '...' : 'Enviar →'}
        </button>
      </div>
    </div>
  )
}
