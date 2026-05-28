import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import ActivitiesClient from './ActivitiesClient'

export default function ActivitiesPage() {
  if (!isAuthenticated()) redirect('/')
  return <AppShell><ActivitiesClient /></AppShell>
}
