import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import AIClient from './AIClient'

export default function AIPage() {
  if (!isAuthenticated()) redirect('/')
  return <AppShell><AIClient /></AppShell>
}
