import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import AIClient from './AIClient'

export default async function AIPage() {
  if (!(await isAuthenticated())) redirect('/')
  return <AppShell><AIClient /></AppShell>
}
