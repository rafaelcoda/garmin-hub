import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garmin Hub',
  description: 'Dashboard de saúde e performance conectado à Garmin Health API',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
