import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  if (await isAuthenticated()) redirect('/dashboard')

  const errorMessages: Record<string, string> = {
    auth_failed:     'Falha ao iniciar autenticação. Tente novamente.',
    callback_failed: 'Falha ao completar autenticação. Verifique suas credenciais.',
    missing_params:  'Parâmetros inválidos retornados pelo Garmin.',
  }
  const errorMsg = searchParams.error ? errorMessages[searchParams.error] : null

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0D1F17 0%, #1D3D2A 50%, #0F6E56 100%)',
    }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }} className="fade-up">
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: '#1D9E75',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', fontSize: 32,
        }}>⌚</div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 36, fontWeight: 700,
          color: '#fff', margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}>Garmin Hub</h1>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: '0 0 2.5rem', lineHeight: 1.6 }}>
          Dashboard de saúde e performance com análises de IA conectado à Garmin Health API.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(226,75,74,0.15)',
            border: '1px solid rgba(226,75,74,0.3)',
            borderRadius: 10, padding: '0.75rem 1rem',
            color: '#F09595', fontSize: 14, marginBottom: '1.5rem',
          }}>
            {errorMsg}
          </div>
        )}

        <a href="/api/auth/login" style={{
          display: 'block', background: '#1D9E75', color: '#fff',
          padding: '1rem', borderRadius: 12, fontSize: 16, fontWeight: 600,
          textDecoration: 'none', fontFamily: 'var(--font-display)',
        }}>
          Conectar com Garmin →
        </a>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: '1.5rem' }}>
          Você será redirecionado para o Garmin Connect para autorizar o acesso.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: '2.5rem' }}>
          {['Atividades', 'Sono & HRV', 'Body Battery', 'Análise IA', 'Frequência cardíaca', 'Composição corporal'].map(f => (
            <span key={f} style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '4px 12px',
              fontSize: 12, color: 'rgba(255,255,255,0.5)',
            }}>{f}</span>
          ))}
        </div>
      </div>
    </main>
  )
}
