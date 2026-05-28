'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Activity = {
  summaryId: string
  activityName: string
  activityType: string
  startTimeInSeconds: number
  durationInSeconds: number
  distanceInMeters?: number
  averageHeartRateInBeatsPerMinute?: number
  totalElevationGainInMeters?: number
  averageSpeedInMetersPerSecond?: number
  activeKilocalories?: number
}

const TYPE_ICONS: Record<string, string> = {
  RUNNING:          '🏃',
  CYCLING:          '🚴',
  SWIMMING:         '🏊',
  STRENGTH_TRAINING:'🏋️',
  WALKING:          '🚶',
  HIKING:           '🥾',
  default:          '⌚',
}

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m}min ${s}s`
}

function formatPace(speedMps?: number) {
  if (!speedMps || speedMps === 0) return '—'
  const minPerKm = 1000 / (speedMps * 60)
  const min = Math.floor(minPerKm)
  const sec = Math.round((minPerKm - min) * 60)
  return `${min}:${sec.toString().padStart(2,'0')} /km`
}

export default function ActivitiesClient() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const now   = Math.floor(Date.now() / 1000)
    const start = now - 30 * 86400 // últimos 30 dias

    fetch(`/api/garmin/activities?start=${start}&end=${now}`)
      .then(r => r.json())
      .then(d => { setActivities(d.activities ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Atividades
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>Últimos 30 dias</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 80, background: '#e8ede9', borderRadius: 14 }} className="pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
          Nenhuma atividade encontrada nos últimos 30 dias.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activities.map(a => {
            const icon = TYPE_ICONS[a.activityType] ?? TYPE_ICONS.default
            const date = format(
              new Date(a.startTimeInSeconds * 1000),
              "dd MMM, HH:mm",
              { locale: ptBR }
            )

            return (
              <div key={a.summaryId} style={{
                background: '#fff', borderRadius: 14,
                border: '1px solid var(--border)',
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: 16,
              }} className="fade-up">
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--garmin-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {icon}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>
                    {a.activityName || a.activityType}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)' }}>{date}</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                  <Stat label="Duração" value={formatDuration(a.durationInSeconds)} />
                  {a.distanceInMeters && (
                    <Stat label="Distância" value={`${(a.distanceInMeters / 1000).toFixed(1)} km`} />
                  )}
                  {a.averageHeartRateInBeatsPerMinute && (
                    <Stat label="FC Média" value={`${a.averageHeartRateInBeatsPerMinute} bpm`} />
                  )}
                  {a.activityType === 'RUNNING' && (
                    <Stat label="Pace" value={formatPace(a.averageSpeedInMetersPerSecond)} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>
        {value}
      </p>
    </div>
  )
}
