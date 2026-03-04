'use client'

import { DashboardOverview } from '@/components/dashboard-overview'
import { useRouter } from 'next/navigation'

export default function OverviewPage() {
  const router = useRouter()

  return (
    <DashboardOverview
      onNavigateToProposals={() => router.push('/proposals')}
      onEditQuote={(q) => router.push(`/quote/${q.id}`)}
    />
  )
}
