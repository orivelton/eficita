'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { loadQuotes } from '@/lib/quotes'
import type { Quote } from '@/lib/types'
import { PdfExport } from '@/components/pdf-export'

export default function PdfPage() {
  const router = useRouter()
  const { id } = useParams() as { id?: string }
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const all = await loadQuotes()
      const found = all.find((q) => q.id === id)
      if (found) setQuote(found)
    })()
  }, [id])

  if (!quote) return null

  return <PdfExport quote={quote} onBack={() => router.push(`/quote/${quote.id}`)} />
}
