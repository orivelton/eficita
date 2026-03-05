'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  loadQuotes,
  formatCurrency,
  calculateGrandTotal,
  formatDate,
  loadSavedClients,
  loadSavedCompanies,
} from '@/lib/quotes'
import type { Quote, QuoteStatus } from '@/lib/types'
import { QUOTE_STATUS_CONFIG } from '@/lib/types'
import { Card } from '@/components/ui/card'
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
} from 'lucide-react'

interface DashboardOverviewProps {
  onNavigateToProposals: () => void
  onEditQuote: (quote: Quote) => void
}

export function DashboardOverview({ onNavigateToProposals, onEditQuote }: DashboardOverviewProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clientCount, setClientCount] = useState(0)
  const [companyCount, setCompanyCount] = useState(0)

  useEffect(() => {
    async function load() {
      const qs = await loadQuotes()
      setQuotes(qs)
      const clients = await loadSavedClients()
      setClientCount(clients.length)
      const companies = await loadSavedCompanies()
      setCompanyCount(companies.length)
    }
    load()
  }, [])

  const metrics = useMemo(() => {
    const total = quotes.length
    const totalValue = quotes.reduce((sum, q) => sum + calculateGrandTotal(q.items), 0)
    const accepted = quotes.filter((q) => q.status === 'aceite')
    const acceptedValue = accepted.reduce((sum, q) => sum + calculateGrandTotal(q.items), 0)
    const pending = quotes.filter((q) => q.status === 'enviado' || q.status === 'em_analise')
    const pendingValue = pending.reduce((sum, q) => sum + calculateGrandTotal(q.items), 0)
    const drafts = quotes.filter((q) => q.status === 'rascunho')
    const conversionRate = total > 0 ? (accepted.length / total) * 100 : 0

    return {
      total,
      totalValue,
      accepted: accepted.length,
      acceptedValue,
      pending: pending.length,
      pendingValue,
      drafts: drafts.length,
      conversionRate,
    }
  }, [quotes])

  const recentQuotes = useMemo(
    () =>
      [...quotes]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [quotes],
  )

  const statusDistribution = useMemo(() => {
    const dist: Record<string, number> = {}
    quotes.forEach((q) => {
      const s = q.status || 'rascunho'
      dist[s] = (dist[s] || 0) + 1
    })
    return dist
  }, [quotes])

  const METRIC_CARDS = [
    {
      label: 'Total Propostas',
      value: String(metrics.total),
      sub: formatCurrency(metrics.totalValue),
      icon: FileText,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Aceites',
      value: String(metrics.accepted),
      sub: formatCurrency(metrics.acceptedValue),
      icon: CheckCircle2,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Pendentes',
      value: String(metrics.pending),
      sub: formatCurrency(metrics.pendingValue),
      icon: Clock,
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
    },
    {
      label: 'Taxa Conversao',
      value: `${metrics.conversionRate.toFixed(0)}%`,
      sub: `${metrics.accepted} de ${metrics.total}`,
      icon: TrendingUp,
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
    },
  ]

  return (
    <div className="p-4 lg:p-6">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Painel</h1>
        <p className="text-sm text-muted-foreground">Resumo geral das suas propostas e atividade</p>
      </div>

      {/* Metric cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {METRIC_CARDS.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.label} className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground leading-none">{m.value}</p>
                  <p className="mt-1.5 truncate text-xs text-muted-foreground">{m.sub}</p>
                </div>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.bg}`}
                >
                  <Icon className={`h-[18px] w-[18px] ${m.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Status breakdown */}
        <Card className="lg:col-span-1">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Por Estado</h2>
          </div>
          <div className="p-4">
            {quotes.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Sem dados</p>
            ) : (
              <div className="space-y-3">
                {(Object.keys(QUOTE_STATUS_CONFIG) as QuoteStatus[]).map((status) => {
                  const count = statusDistribution[status] || 0
                  if (count === 0) return null
                  const cfg = QUOTE_STATUS_CONFIG[status]
                  const pct = quotes.length > 0 ? (count / quotes.length) * 100 : 0
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                          <span className="text-xs text-foreground">{cfg.label}</span>
                        </div>
                        <span className="text-xs font-medium text-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cfg.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Recent quotes */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Propostas Recentes</h2>
            {quotes.length > 0 && (
              <button
                onClick={onNavigateToProposals}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Ver todas
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="divide-y divide-border">
            {recentQuotes.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">Nenhuma proposta ainda</p>
              </div>
            ) : (
              recentQuotes.map((q) => {
                const cfg =
                  QUOTE_STATUS_CONFIG[(q.status as QuoteStatus) || 'rascunho'] ||
                  QUOTE_STATUS_CONFIG.rascunho
                return (
                  <button
                    key={q.id}
                    onClick={() => onEditQuote(q)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">{q.number}</span>
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: cfg.bgColor,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-foreground">
                        {q.client.name || 'Sem cliente'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(calculateGrandTotal(q.items))}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(q.updatedAt)}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-[18px] w-[18px] text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-none">{companyCount}</p>
            <p className="text-[11px] text-muted-foreground">Empresas</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Users className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-none">{clientCount}</p>
            <p className="text-[11px] text-muted-foreground">Clientes</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
            <Clock className="h-[18px] w-[18px] text-chart-3" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-none">{metrics.drafts}</p>
            <p className="text-[11px] text-muted-foreground">Rascunhos</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
            <TrendingUp className="h-[18px] w-[18px] text-chart-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-none">
              {formatCurrency(metrics.acceptedValue)}
            </p>
            <p className="text-[11px] text-muted-foreground">Faturado</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
