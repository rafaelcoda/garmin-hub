/**
 * lib/api.ts
 * Cliente para o backend FastAPI + garth.
 * Todas as chamadas de dados passam por aqui.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

export const garminApi = {
  summary:         ()                           => apiFetch('/api/summary'),
  dailies:         (days = 7)                   => apiFetch('/api/dailies',          { days: String(days) }),
  activities:      (days = 30, limit = 20)      => apiFetch('/api/activities',       { days: String(days), limit: String(limit) }),
  activityDetail:  (id: string)                 => apiFetch(`/api/activities/${id}`),
  sleep:           (days = 14)                  => apiFetch('/api/sleep',            { days: String(days) }),
  hrv:             (days = 14)                  => apiFetch('/api/hrv',              { days: String(days) }),
  heartRate:       (date?: string)              => apiFetch('/api/heart-rate',       date ? { date_str: date } : {}),
  bodyBattery:     (days = 7)                   => apiFetch('/api/body-battery',     { days: String(days) }),
  stress:          (days = 7)                   => apiFetch('/api/stress',           { days: String(days) }),
  bodyComposition: (days = 30)                  => apiFetch('/api/body-composition', { days: String(days) }),
  profile:         ()                           => apiFetch('/api/profile'),
}
