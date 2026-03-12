"use client"

import { useState, useMemo, useCallback } from "react"
import type { Quote, QuoteTemplateId } from "@/lib/types"
import { QUOTE_TEMPLATES } from "@/lib/types"
import { QuotePreview } from "@/components/quote-preview"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Check, LayoutTemplate } from "lucide-react"

const TEMPLATE_IDS: QuoteTemplateId[] = ["classico", "moderno", "minimalista", "executivo", "colorido"]

interface TemplatePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTemplate: QuoteTemplateId
  onSelect: (templateId: QuoteTemplateId) => void
  previewQuote: Quote
}

export function TemplatePicker({ open, onOpenChange, currentTemplate, onSelect, previewQuote }: TemplatePickerProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = TEMPLATE_IDS.indexOf(currentTemplate)
    return idx >= 0 ? idx : 0
  })

  const activeId = TEMPLATE_IDS[activeIndex]
  const activeMeta = QUOTE_TEMPLATES[activeId]

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % TEMPLATE_IDS.length)
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + TEMPLATE_IDS.length) % TEMPLATE_IDS.length)
  }, [])

  const handleSelect = useCallback(() => {
    onSelect(activeId)
    onOpenChange(false)
  }, [activeId, onSelect, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <LayoutTemplate className="h-4.5 w-4.5 text-primary" />
            Escolher Template
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Template list */}
          <div className="shrink-0 border-b border-border bg-secondary/30 p-4 lg:w-56 lg:border-b-0 lg:border-r">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Templates
            </p>
            <div className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-x-visible">
              {TEMPLATE_IDS.map((tid, idx) => {
                const meta = QUOTE_TEMPLATES[tid]
                const isActive = idx === activeIndex
                const isCurrent = tid === currentTemplate
                return (
                  <button
                    key={tid}
                    onClick={() => setActiveIndex(idx)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium ${isActive ? "" : ""}`}>
                        {meta.label}
                      </p>
                      <p className={`hidden text-[11px] lg:block ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {meta.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <Check className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview area */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-muted/40 p-4">
              <div
                className="origin-top-left shadow-lg"
                style={{
                  transform: "scale(0.42)",
                  transformOrigin: "top center",
                  width: "210mm",
                  minHeight: "297mm",
                }}
              >
                <QuotePreview quote={previewQuote} templateOverride={activeId} />
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Anterior</span>
                </Button>
                <span className="text-xs text-muted-foreground">
                  {activeIndex + 1} / {TEMPLATE_IDS.length}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Proximo</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {activeMeta.label}
                </p>
                <Button
                  size="sm"
                  onClick={handleSelect}
                  disabled={activeId === currentTemplate}
                >
                  {activeId === currentTemplate ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Selecionado
                    </>
                  ) : (
                    "Usar este template"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* Inline compact selector for editor header */
interface TemplateButtonProps {
  currentTemplate: QuoteTemplateId
  onClick: () => void
}

export function TemplateButton({ currentTemplate, onClick }: TemplateButtonProps) {
  const meta = QUOTE_TEMPLATES[currentTemplate]
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      title="Alterar template"
    >
      <LayoutTemplate className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{meta.label}</span>
    </button>
  )
}
