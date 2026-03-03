"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewContainerProps {
  children: React.ReactNode
  className?: string
}

const ZOOM_STEPS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
const A4_WIDTH_PX = 794 // 210mm at 96dpi

export function PreviewContainer({ children, className = "" }: PreviewContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScale, setAutoScale] = useState(0.5)
  const [zoomIndex, setZoomIndex] = useState(-1) // -1 = auto-fit
  const [isAutoFit, setIsAutoFit] = useState(true)

  const calculateAutoScale = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth
    const padding = 32 // 16px each side
    const available = containerWidth - padding
    const scale = Math.min(available / A4_WIDTH_PX, 0.85)
    setAutoScale(Math.max(0.25, scale))
  }, [])

  useEffect(() => {
    calculateAutoScale()
    const observer = new ResizeObserver(() => calculateAutoScale())
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [calculateAutoScale])

  const currentScale = isAutoFit ? autoScale : ZOOM_STEPS[zoomIndex] ?? autoScale

  const handleZoomIn = useCallback(() => {
    if (isAutoFit) {
      const closest = ZOOM_STEPS.findIndex((s) => s >= autoScale)
      const next = Math.min(closest + 1, ZOOM_STEPS.length - 1)
      setZoomIndex(next)
      setIsAutoFit(false)
    } else {
      setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1))
    }
  }, [isAutoFit, autoScale])

  const handleZoomOut = useCallback(() => {
    if (isAutoFit) {
      const closest = ZOOM_STEPS.findIndex((s) => s >= autoScale)
      const prev = Math.max(closest - 1, 0)
      setZoomIndex(prev)
      setIsAutoFit(false)
    } else {
      setZoomIndex((i) => Math.max(i - 1, 0))
    }
  }, [isAutoFit, autoScale])

  const handleAutoFit = useCallback(() => {
    setIsAutoFit(true)
    setZoomIndex(-1)
  }, [])

  const zoomPercent = Math.round(currentScale * 100)

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* Zoom toolbar */}
      <div className="flex shrink-0 items-center justify-center gap-1 border-b border-border bg-card/80 px-3 py-1.5 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomOut}
          disabled={!isAutoFit && zoomIndex <= 0}
        >
          <ZoomOut className="h-3.5 w-3.5" />
          <span className="sr-only">Reduzir zoom</span>
        </Button>
        <span className="min-w-[52px] text-center text-xs font-medium tabular-nums text-muted-foreground">
          {zoomPercent}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomIn}
          disabled={!isAutoFit && zoomIndex >= ZOOM_STEPS.length - 1}
        >
          <ZoomIn className="h-3.5 w-3.5" />
          <span className="sr-only">Aumentar zoom</span>
        </Button>
        {!isAutoFit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleAutoFit}
            title="Ajustar automaticamente"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="sr-only">Ajustar ao ecra</span>
          </Button>
        )}
      </div>

      {/* Scrollable preview area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/50"
      >
        <div
          className="mx-auto py-4"
          style={{
            width: A4_WIDTH_PX * currentScale + 32,
            minHeight: "100%",
          }}
        >
          <div
            className="origin-top-left rounded shadow-lg"
            style={{
              width: A4_WIDTH_PX,
              transform: `scale(${currentScale})`,
              transformOrigin: "top left",
              marginLeft: 16,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
