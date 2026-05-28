'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { garminApi } from '@/lib/api'

export default function SleepClient() {
  const [sleeps, setSleeps] = useState<any[]>([])
  const [hrv, setHrv]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([garminApi.sleep(14), garminApi.hrv(14)])
      .then(([s, h]: any) => {
        setSleeps(s.sleeps ?? [])
        setHrv(h.hrv ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const chartData = sleeps.map((s: any) => ({
    date:  (s.calendarDate ?? s.sleepStartTimestampGMT ?? '').toString().slice(5, 10),
    horas: parseFloat(((s.sleepTimeSeconds ?? s.duration ?? 0) / 3600).toFixed(1)),
    score: s.sleepScores?.overall?.value ?? s.sleepScore ?? 0,
  }))

  const hrvData = hrv.map((h: any) => ({
    date: (h.startTimestampLocal ?? h.calendarDate ?? '').toString().slice(5, 10),
    hrv:  h.lastNight ?? h.hrvValue ?? 0,
  }))

  const latest = sleeps[sleeps.length - 1]

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...Array(3)].map((_, i) => <div key={i} style={{ height: 120, background: '#e8ede9', borderRadius: 14 }} className="pulse" />)}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Sono & HRV</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>Últimas 2 semanas</p>
      </div>

      {latest && (
        <div style={{ background: '#0D1F17', borderRadius: 16, padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 16 }} className="fade-up">
          {[
            { label: 'Ontem', value: `${((latest.sleepTimeSeconds ?? latest.duration ?? 0) / 3600).toFixed(1)}h`, sub: 'duração' },
            { label: 'Score', value: latest.sleepScores?.overall?.value ?? latest.sleepScore ?? '—', sub: '' },
            { label: 'HRV', value: hrv.length ? `${hrv[hrv.length-1]?.lastNight ?? '—'} ms` : '—', sub: 'última noite' },
            { label: 'SpO₂', value: latest.averageSpO2 ? `${latest.averageSpO2.toFixed(1)}%` : '—', sub: 'saturação' },
          ].map(({ label, value, sub }) => (
            <div key={label}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>{String(value)}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>Horas de sono</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8FA89E' }} />
            <YAxis tick={{ fontSize: 11, fill: '#8FA89E' }} domain={[0, 10]} unit="h" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}h`, 'Sono']} />
            <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
              {chartData.map((e, i) => <Cell key={i} fill={e.horas >= 7 ? '#1D9E75' : e.horas >= 6 ? '#EF9F27' : '#E24B4A'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hrvData.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem' }}>HRV noturno (ms)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={hrvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8FA89E' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8FA89E' }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v} ms`, 'HRV']} />
              <Line type="monotone" dataKey="hrv" stroke="#534AB7" strokeWidth={2} dot={{ r: 3, fill: '#534AB7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
