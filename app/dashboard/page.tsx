import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect('/')
  return <AppShell><DashboardClient /></AppShell>
}
