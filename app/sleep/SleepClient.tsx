'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type SleepEntry = {
  calendarDate: string
  durationInSeconds: number
  averageSpO2?: number
  averageRespiration?: number
  overallSleepScore?: { value: number; qualifier: string }
  hrv?: { weeklyAverage: number; lastNight: number }
}

function scoreColor(score: number) {
  if (score >= 80) return '#1D9E75'
  if (score >= 60) return '#EF9F27'
  return '#E24B4A'
}

export default function SleepClient() {
  const [sleeps, setSleeps] = useState<SleepEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now   = Math.floor(Date.now() / 1000)
    const start = now - 14 * 86400

    Promise.all([
      fetch(`/api/garmin/sleeps?start=${start}&end=${now}`).then(r => r.json()),
    ]).then(([sd]) => {
      setSleeps(sd.sleeps ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const chartData = sleeps.map(s => ({
    date:   format(new Date(s.calendarDate), 'dd/MM', { locale: ptBR }),
    horas:  parseFloat((s.durationInSeconds / 3600).toFixed(1)),
    score:  s.overallSleepScore?.value ?? 0,
    hrv:    s.hrv?.lastNight ?? 0,
    spo2:   s.averageSpO2 ?? 0,
  }))

  const latest = sleeps[sleeps.length - 1]

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ height: 120, background: '#e8ede9', borderRadius: 14 }} className="pulse" />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Sono & HRV
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>Últimas 2 semanas</p>
      </div>

      {/* Latest night summary */}
      {latest && (
        <div style={{
          background: '#0D1F17', borderRadius: 16, padding: '1.5rem',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16,
        }} className="fade-up">
          {[
            { label: 'Ontem', value: `${(latest.durationInSeconds/3600).toFixed(1)}h`, sub: 'duração' },
            { label: 'Score', value: latest.overallSleepScore?.value ?? '—', sub: latest.overallSleepScore?.qualifier ?? '' },
            { label: 'HRV', value: latest.hrv?.lastNight ? `${latest.hrv.lastNight} ms` : '—', sub: 'última noite' },
            { label: 'SpO₂', value: latest.averageSpO2 ? `${latest.averageSpO2.toFixed(1)}%` : '—', sub: 'saturação' },
            { label: 'Resp.', value: latest.averageRespiration ? `${latest.averageRespiration.toFixed(0)}` : '—', sub: 'rpm' },
          ].map(({ label, value, sub }) => (
            <div key={label}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                {String(value)}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Duration chart */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
          Horas de sono
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8FA89E' }} />
            <YAxis tick={{ fontSize: 11, fill: '#8FA89E' }} domain={[0, 10]} unit="h" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}h`, 'Sono']} />
            <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.horas >= 7 ? '#1D9E75' : entry.horas >= 6 ? '#EF9F27' : '#E24B4A'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* HRV chart */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>
          HRV noturno (ms)
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8FA89E' }} />
            <YAxis tick={{ fontSize: 11, fill: '#8FA89E' }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v} ms`, 'HRV']} />
            <Line type="monotone" dataKey="hrv" stroke="#534AB7" strokeWidth={2}
              dot={{ r: 3, fill: '#534AB7' }} name="HRV" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
