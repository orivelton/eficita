'use client'

import { Dashboard } from '@/components/dashboard'
import { useRouter } from 'next/navigation'
import { loadQuotes, createEmptyQuote } from '@/lib/quotes'
import { addNotification } from '@/lib/notifications'
import type { Quote } from '@/lib/types'

export default function ProposalsPage() {
  const router = useRouter()

  const handleEdit = (quote: Quote) => {
    router.push(`/quote/${quote.id}`)
  }

  const handleExport = (quote: Quote) => {
    router.push(`/pdf/${quote.id}`)
  }

  const handleNew = async () => {
    const current = await loadQuotes()
    const newQuote = await createEmptyQuote(current)
    router.push(`/quote/${newQuote.id}`)
    addNotification('quote', 'Nova proposta', `Orcamento ${newQuote.number} criado`)
  }

  return <Dashboard onEditQuote={handleEdit} onExportPdf={handleExport} onNewQuote={handleNew} />
}
