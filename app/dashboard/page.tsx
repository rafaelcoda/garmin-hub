import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  if (!isAuthenticated()) redirect('/')
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  )
}
