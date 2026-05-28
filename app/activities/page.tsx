import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import ActivitiesClient from './ActivitiesClient'

export default async function ActivitiesPage() {
  if (!(await isAuthenticated())) redirect('/')
  return <AppShell><ActivitiesClient /></AppShell>
}
