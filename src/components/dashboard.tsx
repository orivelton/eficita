'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  loadQuotes,
  deleteQuote,
  duplicateQuote,
  createEmptyQuote,
  formatCurrency,
  formatDate,
  calculateGrandTotal,
  saveQuote,
  addHistoryEntry,
} from '@/lib/quotes'
import { addNotification } from '@/lib/notifications'
import type { Quote, QuoteStatus } from '@/lib/types'
import { QUOTE_STATUS_CONFIG } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Plus, FileText, Copy, Trash2, Pencil, FileDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface DashboardProps {
  onEditQuote: (quote: Quote) => void
  onExportPdf: (quote: Quote) => void
  onNewQuote: () => void
}

export function Dashboard({ onEditQuote, onExportPdf, onNewQuote }: DashboardProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')

  useEffect(() => {
    async function load() {
      const qs = await loadQuotes()
      setQuotes(qs)
    }
    load()
  }, [])

  const handleDuplicate = useCallback(async (id: string) => {
    const updated = await duplicateQuote(id)
    setQuotes(updated)
    toast.success('Proposta duplicada')
    addNotification('quote', 'Proposta duplicada', `Orcamento ${id} foi duplicado`) // fire and forget
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    const updated = await deleteQuote(deleteId)
    setQuotes(updated)
    setDeleteId(null)
    toast.success('Proposta eliminada')
  }, [deleteId])

  const handleStatusChange = useCallback(
    async (quoteId: string, newStatus: QuoteStatus) => {
      const q = quotes.find((x) => x.id === quoteId)
      if (!q) return
      const cfg = QUOTE_STATUS_CONFIG[newStatus]
      const updated = addHistoryEntry(q, newStatus, `Estado alterado para ${cfg.label}`)
      await saveQuote(updated)
      const fresh = await loadQuotes()
      setQuotes(fresh)
      toast.success(`Estado: ${cfg.label}`)
      addNotification('quote', 'Status alterado', `Orcamento ${quoteId} passou para ${cfg.label}`)
    },
    [quotes],
  )

  const filtered = quotes
    .filter((q) => {
      const term = search.toLowerCase()
      const matchesSearch =
        q.number.toLowerCase().includes(term) ||
        q.client.name.toLowerCase().includes(term) ||
        q.projectTitle.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'all' || (q.status || 'rascunho') === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const StatusBadge = ({ quote, interactive = false }: { quote: Quote; interactive?: boolean }) => {
    const status = (quote.status as QuoteStatus) || 'rascunho'
    const cfg = QUOTE_STATUS_CONFIG[status] || QUOTE_STATUS_CONFIG.rascunho

    const badge = (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${interactive ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
        style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
        {cfg.label}
      </span>
    )

    if (!interactive) return badge

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          {badge}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Alterar estado
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(QUOTE_STATUS_CONFIG) as QuoteStatus[]).map((s) => {
            const c = QUOTE_STATUS_CONFIG[s]
            const isActive = s === status
            return (
              <DropdownMenuItem
                key={s}
                onClick={() => {
                  if (!isActive) handleStatusChange(quote.id, s)
                }}
                className={isActive ? 'bg-secondary' : ''}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className={isActive ? 'font-semibold' : ''}>{c.label}</span>
                </span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Page title */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Propostas</h1>
          <p className="text-sm text-muted-foreground">
            {quotes.length} {quotes.length === 1 ? 'proposta' : 'propostas'} no total
          </p>
        </div>
        <Button onClick={onNewQuote} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nova Proposta
        </Button>
      </div>

      {/* Search and filter */}
      {quotes.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por cliente, numero ou projeto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              Todos
            </button>
            {(Object.keys(QUOTE_STATUS_CONFIG) as QuoteStatus[]).map((status) => {
              const cfg = QUOTE_STATUS_CONFIG[status]
              const count = quotes.filter((q) => (q.status || 'rascunho') === status).length
              if (count === 0) return null
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: statusFilter === status ? cfg.color : cfg.bgColor,
                    color: statusFilter === status ? '#fff' : cfg.color,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: statusFilter === status ? '#fff' : cfg.color,
                    }}
                  />
                  {cfg.label}
                  <span className="opacity-70">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 && quotes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-medium text-foreground">Sem propostas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie a sua primeira proposta para comecar.
          </p>
          <Button className="mt-5" onClick={onNewQuote} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Criar Proposta
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-14">
          <Search className="h-7 w-7 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
        </Card>
      ) : (
        <div className="grid gap-2">
          {/* Table header -- desktop */}
          <div className="hidden grid-cols-12 items-center gap-4 px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-2">N.o</div>
            <div className="col-span-2">Cliente</div>
            <div className="col-span-2">Projeto</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1 text-center">Data</div>
            <div className="col-span-2 text-right">Acoes</div>
          </div>

          {filtered.map((quote) => (
            <Card
              key={quote.id}
              className="group cursor-pointer transition-colors hover:bg-secondary/40"
              onClick={() => onEditQuote(quote)}
            >
              <div className="p-3 lg:p-4">
                {/* Mobile */}
                <div className="flex flex-col gap-2.5 md:hidden">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">{quote.number}</span>
                        <StatusBadge quote={quote} interactive />
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {quote.client.name || 'Sem cliente'}
                      </p>
                      {quote.projectTitle && (
                        <p className="text-xs text-muted-foreground">{quote.projectTitle}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-bold text-foreground">
                      {formatCurrency(calculateGrandTotal(quote.items))}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditQuote(quote)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicate(quote.id)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          onExportPdf(quote)
                        }}
                      >
                        <FileDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(quote.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden grid-cols-12 items-center gap-4 md:grid">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-primary">{quote.number}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {quote.client.name || 'Sem cliente'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="truncate text-sm text-muted-foreground">
                      {quote.projectTitle || '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge quote={quote} interactive />
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(calculateGrandTotal(quote.items))}
                    </p>
                  </div>
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-muted-foreground">{formatDate(quote.createdAt)}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditQuote(quote)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(quote.id)
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onExportPdf(quote)
                      }}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(quote.id)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar proposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao e irreversivel. A proposta sera eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
