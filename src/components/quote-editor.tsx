'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { Quote, QuoteStatus, NotesTemplate, TemplateCategory } from '@/lib/types'
import type { SavedCompany, SavedClient } from '@/lib/types'
import { QUOTE_STATUS_CONFIG, TEMPLATE_CATEGORIES } from '@/lib/types'
import {
  saveQuote,
  validateQuote,
  loadSavedCompanies,
  loadSavedClients,
  savedCompanyToCompanyData,
  savedClientToClientData,
  addHistoryEntry,
  loadTemplates,
  updateTemplate,
} from '@/lib/quotes'
import { addNotification } from '@/lib/notifications'
import type { ValidationErrors } from '@/lib/quotes'
import { CompanyForm } from '@/components/company-form'
import { ClientForm } from '@/components/client-form'
import { ItemsForm } from '@/components/items-form'
import { QuotePreview } from '@/components/quote-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  User,
  ListOrdered,
  FileText,
  FileDown,
  Eye,
  EyeOff,
  Save,
  Check,
  CheckCircle2,
  Search,
  Clock,
  Plus,
  BookOpen,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { PreviewContainer } from '@/components/preview-container'
import { TemplatePicker, TemplateButton } from '@/components/template-picker'
import type { QuoteTemplateId } from '@/lib/types'

interface QuoteEditorProps {
  initialQuote: Quote
  onBack: () => void
  onExportPdf: (quote: Quote) => void
}

const STEPS = [
  { id: 0, label: 'Empresa', icon: Building2 },
  { id: 1, label: 'Cliente', icon: User },
  { id: 2, label: 'Itens', icon: ListOrdered },
  { id: 3, label: 'Condições', icon: FileText },
] as const

const STATUS_OPTIONS: QuoteStatus[] = [
  'rascunho',
  'enviado',
  'em_analise',
  'aceite',
  'recusado',
  'expirado',
]

export function QuoteEditor({ initialQuote, onBack, onExportPdf }: QuoteEditorProps) {
  const [quote, setQuote] = useState<Quote>(() => ({
    ...initialQuote,
    status: initialQuote.status || 'rascunho',
    history: initialQuote.history || [
      {
        id: crypto.randomUUID(),
        status: 'rascunho' as QuoteStatus,
        date: new Date().toISOString(),
        note: 'Orçamento criado',
      },
    ],
  }))
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showPreview, setShowPreview] = useState(false)
  const [step, setStep] = useState(0)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const [saved, setSaved] = useState(false)

  // Saved entities
  const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>([])
  const [savedClients, setSavedClients] = useState<SavedClient[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  // Search
  const [companySearch, setCompanySearch] = useState('')
  const [clientSearch, setClientSearch] = useState('')

  // Status change
  const [showHistory, setShowHistory] = useState(false)
  const [statusNote, setStatusNote] = useState('')

  // Templates
  const [templates, setTemplates] = useState<NotesTemplate[]>([])
  const [templateSearch, setTemplateSearch] = useState('')
  const [templateFilter, setTemplateFilter] = useState<TemplateCategory | 'all'>('all')
  const [showTemplates, setShowTemplates] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<NotesTemplate | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    content: '',
    category: 'geral' as TemplateCategory,
  })
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  useEffect(() => {
    ;(async () => {
      setSavedCompanies(await loadSavedCompanies())
      setSavedClients(await loadSavedClients())
      setTemplates(await loadTemplates())
    })()
  }, [])

  // Auto-save
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      saveQuote(quote)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 1000)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [quote])

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return savedCompanies
    const term = companySearch.toLowerCase()
    return savedCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.nif.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term),
    )
  }, [savedCompanies, companySearch])

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return savedClients
    const term = clientSearch.toLowerCase()
    return savedClients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.nif.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term),
    )
  }, [savedClients, clientSearch])

  const updateQuote = useCallback((changes: Partial<Quote>) => {
    setQuote((prev) => ({ ...prev, ...changes }))
    setErrors({})
  }, [])

  const handleSelectCompany = useCallback(
    (company: SavedCompany) => {
      setSelectedCompanyId(company.id)
      updateQuote({ company: savedCompanyToCompanyData(company) })
    },
    [updateQuote],
  )

  const handleSelectClient = useCallback(
    (client: SavedClient) => {
      setSelectedClientId(client.id)
      updateQuote({ client: savedClientToClientData(client) })
    },
    [updateQuote],
  )

  const filteredTemplates = useMemo(() => {
    let result = templates
    if (templateSearch.trim()) {
      const term = templateSearch.toLowerCase()
      result = result.filter(
        (t) => t.name.toLowerCase().includes(term) || t.content.toLowerCase().includes(term),
      )
    }
    if (templateFilter !== 'all') {
      result = result.filter((t) => t.category === templateFilter)
    }
    return result
  }, [templates, templateSearch, templateFilter])

  const handleApplyTemplate = useCallback(
    (template: NotesTemplate) => {
      const current = quote.notes.trim()
      const newNotes = current ? `${current}\n\n${template.content}` : template.content
      updateQuote({ notes: newNotes })
      toast.success(`Template "${template.name}" aplicado`)
    },
    [quote.notes, updateQuote],
  )

  const handleReplaceWithTemplate = useCallback(
    (template: NotesTemplate) => {
      updateQuote({ notes: template.content })
      toast.success(`Template "${template.name}" aplicado`)
    },
    [updateQuote],
  )

  const handleStartEditTemplate = useCallback((template: NotesTemplate) => {
    setEditingTemplate(template)
    setEditForm({
      name: template.name,
      content: template.content,
      category: template.category,
    })
  }, [])

  const handleSaveEditTemplate = useCallback(async () => {
    if (!editingTemplate) return
    if (!editForm.name.trim() || !editForm.content.trim()) {
      toast.error('Nome e conteudo obrigatorios')
      return
    }
    const updated = await updateTemplate({
      ...editingTemplate,
      name: editForm.name,
      content: editForm.content,
      category: editForm.category as TemplateCategory,
    })
    setTemplates(updated)
    setEditingTemplate(null)
    toast.success('Template atualizado')
  }, [editingTemplate, editForm])

  const handleStatusChange = useCallback(
    (newStatus: QuoteStatus) => {
      const config = QUOTE_STATUS_CONFIG[newStatus]
      const note = statusNote.trim() || `Status alterado para ${config.label}`
      const updated = addHistoryEntry(quote, newStatus, note)
      setQuote(updated)
      saveQuote(updated)
      setStatusNote('')
      toast.success(`Status: ${config.label}`)
      addNotification(
        'quote',
        'Status alterado',
        `Orcamento ${quote.number} passou para ${config.label}`,
      )
    },
    [quote, statusNote],
  )

  const handleExportPdf = useCallback(() => {
    const validationErrors = validateQuote(quote)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Corrija os erros antes de exportar')
      return
    }
    saveQuote(quote)
    onExportPdf(quote)
  }, [quote, onExportPdf])

  const handleSave = useCallback(() => {
    saveQuote(quote)
    setSaved(true)
    toast.success('Orçamento guardado')
    setTimeout(() => setSaved(false), 2000)
  }, [quote])

  const handleBack = useCallback(() => {
    saveQuote(quote)
    onBack()
  }, [quote, onBack])

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 3))
  }, [])

  const goPrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const isStepComplete = useCallback(
    (s: number): boolean => {
      switch (s) {
        case 0:
          return !!quote.company.name.trim()
        case 1:
          return !!quote.client.name.trim()
        case 2:
          return quote.items.length > 0 && quote.items.some((i) => i.serviceName.trim() !== '')
        case 3:
          return true
        default:
          return false
      }
    },
    [quote],
  )

  const statusConfig = QUOTE_STATUS_CONFIG[quote.status] || QUOTE_STATUS_CONFIG.rascunho

  return (
    <div className="flex h-dvh flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{quote.number}</p>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{saved ? 'Guardado' : 'A guardar...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Eye className="mr-1.5 h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{showPreview ? 'Formulário' : 'Preview'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guardar</span>
          </Button>
          <Button size="sm" onClick={handleExportPdf}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex min-h-0 flex-1">
        {/* Form panel */}
        <div
          className={`w-full flex-shrink-0 lg:w-[500px] xl:w-[560px] ${
            showPreview ? 'hidden lg:flex' : 'flex'
          } flex-col overflow-hidden`}
        >
          {/* Step indicator */}
          <div className="shrink-0 border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isActive = step === i
                const isDone = isStepComplete(i) && step > i
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(i)}
                    className={`group flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isDone
                          ? 'bg-accent/15 text-accent hover:bg-accent/25'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Quote metadata */}
              <div className="mb-4 grid gap-3 rounded-lg border border-border bg-card p-4">
                <div>
                  <Label className="text-xs font-medium">Titulo do Projeto</Label>
                  <Input
                    value={quote.projectTitle}
                    onChange={(e) => updateQuote({ projectTitle: e.target.value })}
                    placeholder="ex: Remodelacao cozinha"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Data</Label>
                    <Input
                      type="date"
                      value={quote.createdAt}
                      onChange={(e) => updateQuote({ createdAt: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Validade</Label>
                    <Input
                      type="date"
                      value={quote.validUntil}
                      onChange={(e) => updateQuote({ validUntil: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Step 0: Empresa */}
              {step === 0 && (
                <div className="space-y-4">
                  {savedCompanies.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Selecionar empresa registada
                      </p>
                      {/* Search bar */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Procurar por nome, NIF ou email..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="grid gap-2">
                        {filteredCompanies.length === 0 ? (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            Nenhuma empresa encontrada.
                          </p>
                        ) : (
                          filteredCompanies.map((company) => {
                            const isSelected = selectedCompanyId === company.id
                            return (
                              <Card
                                key={company.id}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'hover:border-primary/40 hover:bg-secondary/50'
                                }`}
                                onClick={() => handleSelectCompany(company)}
                              >
                                <div className="flex items-center gap-3 p-3">
                                  {company.logo ? (
                                    <img
                                      src={company.logo}
                                      alt=""
                                      className="h-10 w-10 shrink-0 rounded-lg border border-border object-contain"
                                    />
                                  ) : (
                                    <div
                                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                      style={{
                                        backgroundColor: `${company.primaryColor}15`,
                                      }}
                                    >
                                      <Building2
                                        className="h-5 w-5"
                                        style={{ color: company.primaryColor }}
                                      />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                      {company.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {[company.nif && `NIF: ${company.nif}`, company.address]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-5 w-5 shrink-0 text-primary" />
                                  )}
                                </div>
                              </Card>
                            )
                          })
                        )}
                      </div>
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          ou preencha manualmente
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <CompanyForm
                      company={quote.company}
                      onChange={(company) => {
                        setSelectedCompanyId(null)
                        updateQuote({ company })
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Cliente */}
              {step === 1 && (
                <div className="space-y-4">
                  {savedClients.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Selecionar cliente registado
                      </p>
                      {/* Search bar */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Procurar por nome, NIF, email ou telefone..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="grid gap-2">
                        {filteredClients.length === 0 ? (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            Nenhum cliente encontrado.
                          </p>
                        ) : (
                          filteredClients.map((client) => {
                            const isSelected = selectedClientId === client.id
                            return (
                              <Card
                                key={client.id}
                                className={`cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'hover:border-primary/40 hover:bg-secondary/50'
                                }`}
                                onClick={() => handleSelectClient(client)}
                              >
                                <div className="flex items-center gap-3 p-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                      {client.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {[
                                        client.nif && `NIF: ${client.nif}`,
                                        client.phone,
                                        client.address,
                                      ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-5 w-5 shrink-0 text-primary" />
                                  )}
                                </div>
                              </Card>
                            )
                          })
                        )}
                      </div>
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          ou preencha manualmente
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <ClientForm
                      client={quote.client}
                      onChange={(client) => {
                        setSelectedClientId(null)
                        updateQuote({ client })
                      }}
                      errors={errors}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Itens */}
              {step === 2 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <ItemsForm
                    items={quote.items}
                    onChange={(items) => updateQuote({ items })}
                    errors={errors}
                  />
                </div>
              )}

              {/* Step 3: Condições */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Template selector */}
                  {templates.length > 0 && (
                    <div className="rounded-lg border border-border bg-card">
                      <button
                        className="flex w-full items-center justify-between p-3 text-left"
                        onClick={() => setShowTemplates(!showTemplates)}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Templates guardados
                          </span>
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {templates.length}
                          </span>
                        </div>
                        {showTemplates ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {showTemplates && (
                        <div className="border-t border-border p-3">
                          {/* Inline template editing */}
                          {editingTemplate ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-foreground">
                                  Editar template
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setEditingTemplate(null)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Nome do template"
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Select
                                  value={editForm.category}
                                  onValueChange={(v) =>
                                    setEditForm({
                                      ...editForm,
                                      category: v as TemplateCategory,
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(Object.keys(TEMPLATE_CATEGORIES) as TemplateCategory[]).map(
                                      (cat) => {
                                        const cfg = TEMPLATE_CATEGORIES[cat]
                                        return (
                                          <SelectItem key={cat} value={cat}>
                                            <span className="flex items-center gap-2">
                                              <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: cfg.color }}
                                              />
                                              {cfg.label}
                                            </span>
                                          </SelectItem>
                                        )
                                      },
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Textarea
                                value={editForm.content}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, content: e.target.value })
                                }
                                rows={5}
                                className="text-sm"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingTemplate(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button size="sm" onClick={handleSaveEditTemplate}>
                                  Guardar Template
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Template search + filter */}
                              <div className="mb-3 flex items-center gap-2">
                                <div className="relative flex-1">
                                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="Pesquisar templates..."
                                    value={templateSearch}
                                    onChange={(e) => setTemplateSearch(e.target.value)}
                                    className="h-8 pl-8 text-xs"
                                  />
                                </div>
                                <Select
                                  value={templateFilter}
                                  onValueChange={(v) =>
                                    setTemplateFilter(v as TemplateCategory | 'all')
                                  }
                                >
                                  <SelectTrigger className="h-8 w-[120px] text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {(Object.keys(TEMPLATE_CATEGORIES) as TemplateCategory[]).map(
                                      (cat) => (
                                        <SelectItem key={cat} value={cat}>
                                          {TEMPLATE_CATEGORIES[cat].label}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Template cards */}
                              <div className="grid gap-2 max-h-[240px] overflow-y-auto">
                                {filteredTemplates.length === 0 ? (
                                  <p className="py-4 text-center text-xs text-muted-foreground">
                                    Nenhum template encontrado
                                  </p>
                                ) : (
                                  filteredTemplates.map((t) => {
                                    const catCfg = TEMPLATE_CATEGORIES[t.category]
                                    return (
                                      <div
                                        key={t.id}
                                        className="group rounded-lg border border-border p-2.5 transition-colors hover:bg-secondary/30"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                              <p className="truncate text-xs font-semibold text-foreground">
                                                {t.name}
                                              </p>
                                              <span
                                                className="inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                                                style={{
                                                  backgroundColor: `${catCfg.color}15`,
                                                  color: catCfg.color,
                                                }}
                                              >
                                                {catCfg.label}
                                              </span>
                                            </div>
                                            <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                                              {t.content}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-1.5">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 flex-1 text-[11px]"
                                            onClick={() => handleReplaceWithTemplate(t)}
                                          >
                                            Substituir
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="h-7 flex-1 text-[11px]"
                                            onClick={() => handleApplyTemplate(t)}
                                          >
                                            <Plus className="mr-1 h-3 w-3" />
                                            Adicionar
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0"
                                            onClick={() => handleStartEditTemplate(t)}
                                            title="Editar template"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes textarea */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <Label className="text-xs font-semibold">Observacoes / Condicoes</Label>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Condicoes de pagamento, prazos de execucao, garantias, notas adicionais.
                    </p>
                    <Textarea
                      value={quote.notes}
                      onChange={(e) => updateQuote({ notes: e.target.value })}
                      placeholder={
                        'Exemplo:\n- Pagamento: 50% no inicio, 50% na conclusao\n- Prazo de execucao: 15 dias uteis\n- Garantia: 2 anos sobre mao de obra\n- Orcamento valido por 30 dias'
                      }
                      rows={8}
                      className="text-sm"
                    />
                    {quote.notes.trim() && (
                      <p className="mt-2 text-right text-[10px] text-muted-foreground">
                        {quote.notes.length} caracteres
                      </p>
                    )}
                  </div>

                  {/* Status Management */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Estado da Proposta
                    </p>
                    <div className="flex items-center gap-3">
                      <Select
                        value={quote.status}
                        onValueChange={(val) => handleStatusChange(val as QuoteStatus)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => {
                            const cfg = QUOTE_STATUS_CONFIG[s]
                            return (
                              <SelectItem key={s} value={s}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ backgroundColor: cfg.color }}
                                  />
                                  {cfg.label}
                                </span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-3">
                      <Input
                        placeholder="Nota opcional (ex: Enviado por email ao cliente)"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* History */}
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {showHistory ? 'Ocultar historico' : 'Ver historico'}
                      {quote.history && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {quote.history.length}
                        </span>
                      )}
                    </button>

                    {showHistory && quote.history && quote.history.length > 0 && (
                      <div className="mt-3 space-y-0">
                        {[...quote.history].reverse().map((entry, i) => {
                          const cfg =
                            QUOTE_STATUS_CONFIG[entry.status] || QUOTE_STATUS_CONFIG.rascunho
                          return (
                            <div key={entry.id} className="relative flex gap-3 pb-4">
                              {/* Timeline line */}
                              {i < quote.history.length - 1 && (
                                <div className="absolute left-[7px] top-5 h-full w-px bg-border" />
                              )}
                              {/* Dot */}
                              <div
                                className="relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2"
                                style={{
                                  borderColor: cfg.color,
                                  backgroundColor: i === 0 ? cfg.color : 'transparent',
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                                    style={{
                                      backgroundColor: cfg.bgColor,
                                      color: cfg.color,
                                    }}
                                  >
                                    {cfg.label}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {new Date(entry.date).toLocaleDateString('pt-PT', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {entry.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Resumo do Orcamento
                    </p>
                    <div className="grid gap-2.5 text-sm">
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Empresa</p>
                          <p className="truncate font-medium text-foreground">
                            {quote.company.name || 'Nao definida'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Cliente</p>
                          <p className="truncate font-medium text-foreground">
                            {quote.client.name || 'Nao definido'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Itens / Servicos</p>
                          <p className="font-medium text-foreground">
                            {quote.items.length} {quote.items.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step navigation footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-4 py-3">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={step === 0}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Anterior
            </Button>
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-accent' : 'w-1.5 bg-border'
                  }`}
                />
              ))}
            </div>
            {step < 3 ? (
              <Button size="sm" onClick={goNext}>
                Seguinte
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleExportPdf}>
                <FileDown className="mr-1.5 h-3.5 w-3.5" />
                Exportar PDF
              </Button>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden border-l border-border ${
            showPreview ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <PreviewContainer className="flex-1">
            <QuotePreview quote={quote} />
          </PreviewContainer>
        </div>
      </div>
    </div>
  )
}
