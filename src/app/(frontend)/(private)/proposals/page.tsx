'use client'

import { Dashboard } from '@/components/dashboard'
import { useRouter } from 'next/navigation'
import { loadQuotes, createEmptyQuote } from '@/lib/quotes'
import type { Quote } from '@/lib/types'

export default function ProposalsPage() {
  const router = useRouter()

  const handleEdit = (quote: Quote) => {
    router.push(`/quote/${quote.id}`)
  }

  const handleExport = (quote: Quote) => {
    router.push(`/pdf/${quote.id}`)
  }

  const handleNew = () => {
    const current = loadQuotes()
    const newQuote = createEmptyQuote(current)
    router.push(`/quote/${newQuote.id}`)
  }

  return <Dashboard onEditQuote={handleEdit} onExportPdf={handleExport} onNewQuote={handleNew} />
}
