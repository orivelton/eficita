'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { loadQuotes, createEmptyQuote } from '@/lib/quotes'
import type { Quote } from '@/lib/types'
import { QuoteEditor } from '@/components/quote-editor'

export default function QuotePage() {
  const router = useRouter()
  const { id } = useParams() as { id?: string }
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const all = await loadQuotes()
      if (id === 'new') {
        const n = await createEmptyQuote(all)
        setQuote(n)
        router.replace(`/quote/${n.id}`)
        return
      }
      const found = all.find((q) => q.id === id)
      if (found) {
        setQuote(found)
      } else {
        // if not found, treat as new with given id
        const n = await createEmptyQuote(all)
        n.id = id
        setQuote(n)
      }
    })()
  }, [id, router])

  if (!quote) return null

  return (
    <QuoteEditor
      initialQuote={quote}
      onBack={() => router.push('/proposals')}
      onExportPdf={(q) => router.push(`/pdf/${q.id}`)}
    />
  )
}
