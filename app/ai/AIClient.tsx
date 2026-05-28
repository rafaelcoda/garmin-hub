'use client'

import { useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const QUICK_QUESTIONS = [
  'Como está minha recuperação esta semana?',
  'Meu sono está afetando meu desempenho?',
  'Quando é o melhor momento para treinar hoje?',
  'Analise meu HRV dos últimos 7 dias.',
  'Estou treinando demais?',
]

function MarkdownText({ text }: { text: string }) {
  // Renderização simples de markdown
  const lines = text.split('\n')
  return (
    <div style={{ lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} style={{ margin: '0.75rem 0 0.25rem', fontSize: 14, fontWeight: 600 }}>{line.slice(4)}</h3>
        if (line.startsWith('## '))  return <h2 key={i} style={{ margin: '1rem 0 0.25rem', fontSize: 15, fontWeight: 600 }}>{line.slice(3)}</h2>
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ margin: '0.25rem 0', fontWeight: 600 }}>{line.slice(2,-2)}</p>
        if (line.startsWith('- '))   return <p key={i} style={{ margin: '0.15rem 0', paddingLeft: 12 }}>• {line.slice(2)}</p>
        if (line.trim() === '')       return <br key={i} />
        return <p key={i} style={{ margin: '0.25rem 0' }}>{line}</p>
      })}
    </div>
  )
}

export default function AIClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [metricsLoaded, setMetricsLoaded] = useState(false)
  const [metrics, setMetrics]   = useState<unknown>(null)

  async function loadMetrics() {
    const now   = Math.floor(Date.now() / 1000)
    const start = now - 7 * 86400
    const [dailies, sleeps, hrv] = await Promise.all([
      fetch(`/api/garmin/dailies?start=${start}&end=${now}`).then(r => r.json()),
      fetch(`/api/garmin/sleeps?start=${start}&end=${now}`).then(r => r.json()),
      fetch(`/api/garmin/hrv?start=${start}&end=${now}`).then(r => r.json()),
    ])
    const data = { dailies: dailies.dailies?.slice(-7), sleeps: sleeps.sleeps?.slice(-7), hrv: hrv.hrv?.slice(-7) }
    setMetrics(data)
    setMetricsLoaded(true)
    return data
  }

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return

    const userMsg: Message = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      let m = metrics
      if (!metricsLoaded) m = await loadMetrics()

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: m, question }),
      })

      const data = await res.json()
      const assistantMsg: Message = { role: 'assistant', content: data.analysis ?? 'Erro ao gerar resposta.' }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Falha na conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 760 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Análise com IA ✦
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>
          Coach pessoal baseado nos seus dados Garmin dos últimos 7 dias.
        </p>
      </div>

      {/* Chat messages */}
      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '85%',
                background: msg.role === 'user' ? '#0D1F17' : '#fff',
                color: msg.role === 'user' ? '#fff' : 'var(--text-1)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '0.875rem 1rem',
                fontSize: 14,
              }}>
                {msg.role === 'assistant' ? <MarkdownText text={msg.content} /> : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '16px 16px 16px 4px',
                padding: '0.875rem 1rem', display: 'flex', gap: 6,
              }}>
                {[0.1, 0.2, 0.3].map(delay => (
                  <span key={delay} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--garmin)',
                    animation: `pulse-soft 1.2s ease-in-out ${delay}s infinite`,
                    display: 'inline-block',
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick questions — show only when no messages */}
      {messages.length === 0 && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Perguntas rápidas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 10, padding: '0.75rem 1rem',
                fontSize: 14, cursor: 'pointer', textAlign: 'left',
                color: 'var(--text-1)', fontFamily: 'var(--font-display)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--garmin)'; e.currentTarget.style.background = 'var(--garmin-light)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff' }}
              >
                {q} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8,
        position: 'sticky', bottom: 0,
        background: 'var(--surface)', paddingTop: 8,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Pergunte sobre seus dados de saúde..."
          disabled={loading}
          style={{
            flex: 1, padding: '0.75rem 1rem',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 12, fontSize: 14,
            fontFamily: 'var(--font-display)', color: 'var(--text-1)',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#ccc' : 'var(--garmin)',
            color: '#fff', border: 'none',
            borderRadius: 12, padding: '0 1.25rem',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)',
            transition: 'background 0.15s',
          }}
        >
          {loading ? '...' : 'Enviar →'}
        </button>
      </div>
    </div>
  )
}
