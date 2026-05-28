'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, subDays, fromUnixTime } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type DailySummary = {
  calendarDate: string
  steps: number
  activeKilocalories: number
  minHeartRate: number
  maxHeartRate: number
  averageHeartRate: number
  averageStressLevel?: number
  bodyBatteryChargedValue?: number
  bodyBatteryDrainedValue?: number
}

type DailiesResponse = { dailies?: DailySummary[] }

function MetricCard({
  label, value, unit, delta, deltaPositive,
}: {
  label: string; value: string | number; unit?: string
  delta?: string; deltaPositive?: boolean
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1px solid var(--border)',
      padding: '1.25rem',
    }} className="fade-up">
      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>
        {value}
        {unit && <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, color: 'var(--text-2)' }}>{unit}</span>}
      </p>
      {delta && (
        <p style={{
          margin: '6px 0 0', fontSize: 12,
          color: deltaPositive ? 'var(--garmin)' : '#E24B4A',
        }}>
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)', fontSize: 13,
      fontWeight: 600, color: 'var(--text-3)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      margin: '0 0 1rem',
    }}>
      {children}
    </h2>
  )
}

export default function DashboardClient() {
  const [data, setData]       = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const now   = Math.floor(Date.now() / 1000)
    const start = now - 7 * 86400

    fetch(`/api/garmin/dailies?start=${start}&end=${now}`)
      .then(r => r.json())
      .then((d: DailiesResponse) => {
        setData(d.dailies ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError('Falha ao carregar dados. Verifique suas credenciais.')
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ height: 32, width: 200, background: '#e8ede9', borderRadius: 8 }} className="pulse" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 100, background: '#e8ede9', borderRadius: 14 }} className="pulse" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FECACA',
      borderRadius: 12, padding: '1rem 1.25rem', color: '#991B1B',
    }}>
      {error}
    </div>
  )

  const latest = data[data.length - 1]
  const prev   = data[data.length - 2]

  const stepsToday  = latest?.steps ?? 0
  const stepsPrev   = prev?.steps ?? 1
  const stepsDelta  = Math.round(((stepsToday - stepsPrev) / stepsPrev) * 100)

  const chartData = data.map(d => ({
    date:     format(new Date(d.calendarDate), 'dd/MM', { locale: ptBR }),
    passos:   d.steps,
    fcMedia:  d.averageHeartRate,
    calorias: d.activeKilocalories,
    stress:   d.averageStressLevel ?? 0,
    battery:  d.bodyBatteryChargedValue ?? 0,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Bom dia 👋
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>
          Últimos 7 dias · {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Metric cards */}
      <div>
        <SectionTitle>Resumo de hoje</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <MetricCard label="Passos" value={stepsToday.toLocaleString('pt-BR')}
            delta={`${Math.abs(stepsDelta)}% vs ontem`} deltaPositive={stepsDelta >= 0} />
          <MetricCard label="FC média" value={latest?.averageHeartRate ?? '—'} unit="bpm" />
          <MetricCard label="FC mínima" value={latest?.minHeartRate ?? '—'} unit="bpm" />
          <MetricCard label="Calorias ativas" value={latest?.activeKilocalories?.toLocaleString('pt-BR') ?? '—'} unit="kcal" />
          <MetricCard label="Body Battery" value={latest?.bodyBatteryChargedValue ?? '—'} unit="/ 100" />
          <MetricCard label="Stress médio" value={latest?.averageStressLevel ?? '—'} unit="/ 100" />
        </div>
      </div>

      {/* Steps chart */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
        <SectionTitle>Passos — 7 dias</SectionTitle>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8FA89E' }} />
            <YAxis tick={{ fontSize: 11, fill: '#8FA89E' }} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e8ede9', borderRadius: 8, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="passos" stroke="#1D9E75" strokeWidth={2}
              fill="url(#gSteps)" dot={{ r: 3, fill: '#1D9E75' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* HR + Stress side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
          <SectionTitle>Frequência cardíaca</SectionTitle>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8FA89E' }} />
              <YAxis tick={{ fontSize: 10, fill: '#8FA89E' }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="fcMedia" stroke="#378ADD" strokeWidth={2} dot={false} name="FC Média" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1.25rem' }}>
          <SectionTitle>Stress</SectionTitle>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E24B4A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E24B4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8FA89E' }} />
              <YAxis tick={{ fontSize: 10, fill: '#8FA89E' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="stress" stroke="#E24B4A" strokeWidth={2}
                fill="url(#gStress)" dot={false} name="Stress" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
