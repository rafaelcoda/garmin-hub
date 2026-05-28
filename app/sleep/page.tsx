import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import SleepClient from './SleepClient'

export default function SleepPage() {
  if (!isAuthenticated()) redirect('/')
  return <AppShell><SleepClient /></AppShell>
}
