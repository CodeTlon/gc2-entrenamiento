import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/session'
import DashboardShell from './DashboardShell'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  return <DashboardShell email={user.email}>{children}</DashboardShell>
}
