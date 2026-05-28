'use client'

import { useEffect, useState } from 'react'
import { garminApi } from '@/lib/api'

const TYPE_ICONS: Record<string, string> = {
  running: '🏃', cycling: '🚴', swimming: '🏊', strength_training: '🏋️',
  walking: '🚶', hiking: '🥾', default: '⌚',
}

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{value}</p>
    </div>
  )
}

export default function ActivitiesClient() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    garminApi.activities(30, 20)
      .then((d: any) => { setActivities(d.activities ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Atividades</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>Últimos 30 dias</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <div key={i} style={{ height: 80, background: '#e8ede9', borderRadius: 14 }} className="pulse" />)}
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>Nenhuma atividade encontrada.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activities.map((a: any) => {
            const type = (a.activityType?.typeKey ?? a.activityType ?? 'default').toLowerCase()
            const icon = TYPE_ICONS[type] ?? TYPE_ICONS.default
            const dist = a.distance ? `${(a.distance / 1000).toFixed(1)} km` : null
            const hr   = a.averageHR ? `${Math.round(a.averageHR)} bpm` : null
            const pace = a.averageSpeed && type.includes('run')
              ? (() => { const mpk = 1000 / (a.averageSpeed * 60); const m = Math.floor(mpk); const s = Math.round((mpk - m) * 60); return `${m}:${String(s).padStart(2,'0')} /km` })()
              : null
            const dateStr = a.startTimeLocal ? new Date(a.startTimeLocal).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

            return (
              <div key={a.activityId} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 16 }} className="fade-up">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--garmin-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 15 }}>{a.activityName || type}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)' }}>{dateStr}</p>
                </div>
                <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                  <Stat label="Duração" value={formatDuration(a.duration ?? 0)} />
                  {dist && <Stat label="Distância" value={dist} />}
                  {hr && <Stat label="FC Média" value={hr} />}
                  {pace && <Stat label="Pace" value={pace} />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
