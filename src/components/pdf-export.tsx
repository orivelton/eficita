"use client"

import { useCallback, useState, useRef, useEffect } from "react"
import type { Quote } from "@/lib/types"
import { QuotePreview } from "@/components/quote-preview"
import { Button } from "@/components/ui/button"
import { PreviewContainer } from "@/components/preview-container"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PdfExportProps {
  quote: Quote
  onBack: () => void
}

export function PdfExport({ quote, onBack }: PdfExportProps) {
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [html2pdf, setHtml2pdf] = useState<typeof import("html2pdf.js") extends Promise<infer T> ? T : never>()

  useEffect(() => {
    import("html2pdf.js").then((mod) => {
      setHtml2pdf(() => mod.default)
    })
  }, [])

  const handleExport = useCallback(async () => {
    if (!previewRef.current || !html2pdf) return
    setExporting(true)
    try {
      const element = previewRef.current.querySelector("#quote-preview")
      if (!element) throw new Error("Preview not found")

      const filename = `${quote.number}_${quote.client.name || "orcamento"}`
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_")

      await html2pdf()
        .set({
          margin: 0,
          filename: `${filename}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(element)
        .save()

      toast.success("PDF exportado com sucesso")
    } catch {
      toast.error("Erro ao exportar PDF")
    } finally {
      setExporting(false)
    }
  }, [html2pdf, quote])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Exportar PDF
            </p>
            <p className="text-xs text-muted-foreground">{quote.number}</p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={exporting || !html2pdf} size="sm">
          {exporting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-3.5 w-3.5" />
          )}
          {exporting ? "A exportar..." : "Descarregar PDF"}
        </Button>
      </header>

      <div ref={previewRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <PreviewContainer className="flex-1">
          <QuotePreview quote={quote} />
        </PreviewContainer>
      </div>
    </div>
  )
}
