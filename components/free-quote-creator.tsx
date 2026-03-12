"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Sparkles,
  Crown,
} from "lucide-react"
import { toast } from "sonner"
import { PreviewContainer } from "@/components/preview-container"
import { QuotePreview } from "@/components/quote-preview"
import type { Quote, CompanyData, ClientData, QuoteItem } from "@/lib/types"
import { UNIT_OPTIONS } from "@/lib/types"
import { formatCurrency, calculateSubtotal, calculateTotalVat, calculateGrandTotal } from "@/lib/quotes"

interface FreeQuoteCreatorProps {
  onBack: () => void
  onUpgrade: () => void
}

const STEPS = [
  { id: 0, label: "Empresa", icon: Building2 },
  { id: 1, label: "Cliente", icon: User },
  { id: 2, label: "Itens", icon: ListOrdered },
  { id: 3, label: "Finalizar", icon: FileText },
] as const

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function createEmptyItem(): QuoteItem {
  return {
    id: generateId(),
    serviceName: "",
    description: "",
    quantity: 1,
    unit: "un",
    unitPrice: 0,
    vatPercentage: 23,
  }
}

const FREE_LIMITATIONS = [
  { feature: "Templates de documentos", free: "1 template", pro: "5 templates" },
  { feature: "Historico de propostas", free: "Nao disponivel", pro: "Ilimitado" },
  { feature: "Catalogo de servicos", free: "Nao disponivel", pro: "Ilimitado" },
  { feature: "Gestao de clientes", free: "Nao disponivel", pro: "Ilimitado" },
  { feature: "Dashboard analitico", free: "Nao disponivel", pro: "Completo" },
  { feature: "Exportacao PDF", free: "Com marca d'agua", pro: "Sem marca" },
]

export function FreeQuoteCreator({ onBack, onUpgrade }: FreeQuoteCreatorProps) {
  const [step, setStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  // Company data
  const [company, setCompany] = useState<CompanyData>({
    name: "",
    nif: "",
    address: "",
    phone: "",
    email: "",
    iban: "",
    logo: null,
    primaryColor: "#4f46e5",
  })

  // Client data
  const [client, setClient] = useState<ClientData>({
    name: "",
    nif: "",
    address: "",
    phone: "",
    email: "",
    workAddress: "",
  })

  // Items
  const [items, setItems] = useState<QuoteItem[]>([createEmptyItem()])

  // Notes
  const [notes, setNotes] = useState("")
  const [projectTitle, setProjectTitle] = useState("")

  // Build quote object for preview
  const quote: Quote = useMemo(
    () => ({
      id: "free-preview",
      number: "ORC-FREE-001",
      projectTitle,
      createdAt: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes,
      company,
      client,
      items,
      updatedAt: new Date().toISOString(),
      status: "rascunho",
      history: [],
      templateId: "classico",
    }),
    [projectTitle, notes, company, client, items]
  )

  const updateCompany = useCallback(
    (updates: Partial<CompanyData>) => setCompany((c) => ({ ...c, ...updates })),
    []
  )

  const updateClient = useCallback(
    (updates: Partial<ClientData>) => setClient((c) => ({ ...c, ...updates })),
    []
  )

  const updateItem = useCallback((id: string, updates: Partial<QuoteItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }, [])

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, createEmptyItem()])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev))
  }, [])

  const canProceed = useMemo(() => {
    if (step === 0) return company.name.trim().length > 0
    if (step === 1) return client.name.trim().length > 0
    if (step === 2) return items.some((i) => i.serviceName.trim().length > 0)
    return true
  }, [step, company.name, client.name, items])

  const handleExportFree = useCallback(() => {
    toast.info("Na versao gratuita, o PDF inclui marca d'agua. Faca upgrade para remover!")
    // In a real app, this would generate a PDF with watermark
    toast.success("Orcamento gerado! (Demonstracao)")
  }, [])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                Criar Orcamento Gratis
              </h1>
              <p className="text-[10px] text-muted-foreground">
                Versao gratuita com funcionalidades limitadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden"
            >
              {showPreview ? (
                <EyeOff className="mr-1.5 h-4 w-4" />
              ) : (
                <Eye className="mr-1.5 h-4 w-4" />
              )}
              {showPreview ? "Formulario" : "Pre-visualizar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onUpgrade}
              className="hidden sm:flex"
            >
              <Crown className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              Fazer Upgrade
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex min-h-0 flex-1">
        {/* Form panel */}
        <div
          className={`w-full flex-shrink-0 lg:w-[500px] xl:w-[560px] ${
            showPreview ? "hidden lg:flex" : "flex"
          } flex-col overflow-hidden`}
        >
          {/* Step indicator */}
          <div className="shrink-0 border-b border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isActive = step === s.id
                const isComplete = step > s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Step 0: Company */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      Dados da Empresa
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Nome da Empresa *</Label>
                        <Input
                          value={company.name}
                          onChange={(e) => updateCompany({ name: e.target.value })}
                          placeholder="A Sua Empresa, Lda"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">NIF</Label>
                          <Input
                            value={company.nif}
                            onChange={(e) => updateCompany({ nif: e.target.value })}
                            placeholder="123456789"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Telefone</Label>
                          <Input
                            value={company.phone}
                            onChange={(e) => updateCompany({ phone: e.target.value })}
                            placeholder="+351 912 345 678"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          value={company.email}
                          onChange={(e) => updateCompany({ email: e.target.value })}
                          placeholder="empresa@exemplo.pt"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Morada</Label>
                        <Input
                          value={company.address}
                          onChange={(e) => updateCompany({ address: e.target.value })}
                          placeholder="Rua Exemplo, 123, Lisboa"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upgrade hint */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Guarde os seus dados
                        </p>
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                          Com a versao Pro, guarde empresas e clientes para auto-preenchimento automatico.
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={onUpgrade}
                          className="mt-1 h-auto p-0 text-xs text-amber-700 underline dark:text-amber-300"
                        >
                          Saber mais
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Client */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      Dados do Cliente
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Nome do Cliente *</Label>
                        <Input
                          value={client.name}
                          onChange={(e) => updateClient({ name: e.target.value })}
                          placeholder="Joao Silva"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">NIF</Label>
                          <Input
                            value={client.nif}
                            onChange={(e) => updateClient({ nif: e.target.value })}
                            placeholder="123456789"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Telefone</Label>
                          <Input
                            value={client.phone}
                            onChange={(e) => updateClient({ phone: e.target.value })}
                            placeholder="+351 912 345 678"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          value={client.email}
                          onChange={(e) => updateClient({ email: e.target.value })}
                          placeholder="cliente@exemplo.pt"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Morada</Label>
                        <Input
                          value={client.address}
                          onChange={(e) => updateClient({ address: e.target.value })}
                          placeholder="Rua do Cliente, 456, Porto"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Items */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Titulo do Projeto</Label>
                        <Input
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="Remodelacao de cozinha"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Locked feature hint */}
                  <div className="rounded-lg border border-border bg-secondary/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-xs">
                        Catalogo de servicos disponivel na versao Pro
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Item {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={item.serviceName}
                          onChange={(e) =>
                            updateItem(item.id, { serviceName: e.target.value })
                          }
                          placeholder="Nome do servico"
                          className="text-sm"
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, { description: e.target.value })
                          }
                          placeholder="Descricao..."
                          rows={2}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label className="text-[10px]">Qtd</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  quantity: Number(e.target.value) || 1,
                                })
                              }
                              className="mt-0.5 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Unid</Label>
                            <Select
                              value={item.unit}
                              onValueChange={(v) => updateItem(item.id, { unit: v })}
                            >
                              <SelectTrigger className="mt-0.5 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {UNIT_OPTIONS.map((u) => (
                                  <SelectItem key={u.value} value={u.value}>
                                    {u.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[10px]">Preco</Label>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  unitPrice: Number(e.target.value) || 0,
                                })
                              }
                              className="mt-0.5 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">IVA %</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={item.vatPercentage}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  vatPercentage: Number(e.target.value) || 0,
                                })
                              }
                              className="mt-0.5 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={addItem}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Adicionar Item
                  </Button>

                  {/* Totals */}
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(calculateSubtotal(items))}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>IVA</span>
                        <span>{formatCurrency(calculateTotalVat(items))}</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                        <span>Total</span>
                        <span>{formatCurrency(calculateGrandTotal(items))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Finalize */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      Observacoes / Condicoes
                    </h3>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Condicoes de pagamento, prazos, garantias..."
                      rows={5}
                      className="text-sm"
                    />
                  </div>

                  {/* Locked feature hint */}
                  <div className="rounded-lg border border-border bg-secondary/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-xs">
                        Templates de condicoes disponiveis na versao Pro
                      </span>
                    </div>
                  </div>

                  {/* Free vs Pro comparison */}
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Comparacao Free vs Pro
                    </h3>
                    <div className="space-y-2">
                      {FREE_LIMITATIONS.map((item, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-3 gap-2 text-xs"
                        >
                          <span className="text-muted-foreground">
                            {item.feature}
                          </span>
                          <span className="text-center text-muted-foreground/70">
                            {item.free}
                          </span>
                          <span className="text-center font-medium text-accent">
                            {item.pro}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="mt-4 w-full"
                      size="sm"
                      onClick={onUpgrade}
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Fazer Upgrade para Pro
                    </Button>
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                      Resumo do Orcamento
                    </h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        <strong>Empresa:</strong> {company.name || "Nao definido"}
                      </p>
                      <p>
                        <strong>Cliente:</strong> {client.name || "Nao definido"}
                      </p>
                      <p>
                        <strong>Itens:</strong>{" "}
                        {items.filter((i) => i.serviceName).length} servico(s)
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        <strong>Total:</strong>{" "}
                        {formatCurrency(calculateGrandTotal(items))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step navigation */}
          <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Anterior
            </Button>

            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {step < 3 ? (
              <Button
                size="sm"
                onClick={() => setStep(Math.min(3, step + 1))}
                disabled={!canProceed}
              >
                Seguinte
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleExportFree}>
                <FileDown className="mr-1.5 h-3.5 w-3.5" />
                Exportar (Free)
              </Button>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden border-l border-border ${
            showPreview ? "flex" : "hidden lg:flex"
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
