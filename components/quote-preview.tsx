"use client"

import type { Quote, QuoteTemplateId } from "@/lib/types"
import { TemplateClassico, TemplateModerno, TemplateMinimalista, TemplateExecutivo, TemplateColorido } from "@/components/templates"

interface QuotePreviewProps {
  quote: Quote
  templateOverride?: QuoteTemplateId
}

const RENDERERS: Record<QuoteTemplateId, React.ComponentType<{ quote: Quote }>> = {
  classico: TemplateClassico,
  moderno: TemplateModerno,
  minimalista: TemplateMinimalista,
  executivo: TemplateExecutivo,
  colorido: TemplateColorido,
}

export function QuotePreview({ quote, templateOverride }: QuotePreviewProps) {
  const tid = templateOverride || quote.templateId || "classico"
  const Renderer = RENDERERS[tid] || TemplateClassico
  return <Renderer quote={quote} />
}
