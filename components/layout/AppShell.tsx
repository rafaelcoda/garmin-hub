'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',    icon: '◈' },
  { href: '/activities',  label: 'Atividades',   icon: '↗' },
  { href: '/sleep',       label: 'Sono & HRV',   icon: '◐' },
  { href: '/ai',          label: 'Análise IA',   icon: '✦' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: '#0D1F17',
        display: 'flex', flexDirection: 'column',
        padding: '1.5rem 1rem',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          <span style={{ fontSize: 22 }}>⌚</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 17, color: '#fff', letterSpacing: '-0.01em',
          }}>Garmin Hub</span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.6rem 0.75rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                background: active ? 'rgba(29,158,117,0.2)' : 'transparent',
                borderLeft: active ? '2px solid var(--garmin)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <form action="/api/auth/logout" method="POST">
          <button type="submit" style={{
            width: '100%', padding: '0.6rem 0.75rem',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: 'rgba(255,255,255,0.35)',
            fontSize: 13, cursor: 'pointer', textAlign: 'left',
            fontFamily: 'var(--font-display)',
          }}>
            ← Sair
          </button>
        </form>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto', maxWidth: 1100 }}>
        {children}
      </main>
    </div>
  )
}
