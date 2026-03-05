'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '@/lib/types'
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS, VAT_OPTIONS } from '@/lib/types'
import { loadSettings, saveSettings } from '@/lib/quotes'
import { ManageCompanies } from '@/components/manage-companies'
import { ManageClients } from '@/components/manage-clients'
import { ManageTemplates } from '@/components/manage-templates'
import { ManageServiceTemplates } from '@/components/manage-service-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  Building2,
  Users,
  Globe,
  Coins,
  FileText,
  Palette,
  ChevronRight,
  Save,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getDefault())

  function getDefault(): AppSettings {
    return {
      currency: 'EUR',
      currencyLocale: 'pt-PT',
      language: 'pt-PT',
      defaultVat: 23,
      quotePrefix: 'ORC',
      quoteValidity: 30,
      companyDefaultColor: '#1a56db',
      defaultTemplate: 'classico',
    }
  }
  const [showCompanies, setShowCompanies] = useState(false)
  const [showClients, setShowClients] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showServiceTemplates, setShowServiceTemplates] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings().then((s) => setSettings(s))
  }, [])

  const update = useCallback((changes: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...changes }))
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(() => {
    saveSettings(settings).then(() => {
      setHasChanges(false)
      toast.success('Definicoes guardadas')
    })
  }, [settings])

  const handleCurrencyChange = useCallback(
    (value: string) => {
      const opt = CURRENCY_OPTIONS.find((c) => c.value === value)
      update({
        currency: value,
        currencyLocale: opt?.locale || 'pt-PT',
      })
    },
    [update],
  )

  return (
    <div className="p-4 lg:p-6">
      {/* Page title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Definicoes</h1>
          <p className="text-sm text-muted-foreground">
            Configuracoes gerais, registos e preferencias
          </p>
        </div>
        {hasChanges && (
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Registos Section */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Registos
          </h2>
          <div className="grid gap-2">
            <Card
              className="cursor-pointer transition-colors hover:bg-secondary/50"
              onClick={() => setShowCompanies(true)}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Empresas</p>
                  <p className="text-sm text-muted-foreground">
                    Gerir empresas emissoras de orcamentos
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </Card>
            <Card
              className="cursor-pointer transition-colors hover:bg-secondary/50"
              onClick={() => setShowClients(true)}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Clientes</p>
                  <p className="text-sm text-muted-foreground">
                    Gerir clientes para auto-preenchimento
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </Card>
            <Card
              className="cursor-pointer transition-colors hover:bg-secondary/50"
              onClick={() => setShowTemplates(true)}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Templates de Condicoes</p>
                  <p className="text-sm text-muted-foreground">
                    Templates de observacoes e condicoes reutilizaveis
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </Card>
            <Card
              className="cursor-pointer transition-colors hover:bg-secondary/50"
              onClick={() => setShowServiceTemplates(true)}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Catalogo de Servicos</p>
                  <p className="text-sm text-muted-foreground">
                    Servicos pre-definidos para adicionar rapidamente
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </section>

        {/* Regional Section */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Regional
          </h2>
          <Card>
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Label className="text-sm font-medium">Moeda</Label>
                  <p className="text-xs text-muted-foreground">Moeda utilizada nos orcamentos</p>
                </div>
                <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span className="text-muted-foreground">{opt.symbol}</span>
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Label className="text-sm font-medium">Idioma</Label>
                  <p className="text-xs text-muted-foreground">Idioma dos documentos gerados</p>
                </div>
                <Select value={settings.language} onValueChange={(v) => update({ language: v })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Label className="text-sm font-medium">IVA Padrao</Label>
                  <p className="text-xs text-muted-foreground">Taxa de IVA aplicada por defeito</p>
                </div>
                <Select
                  value={String(settings.defaultVat)}
                  onValueChange={(v) => update({ defaultVat: Number(v) })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VAT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </section>

        {/* Document Settings */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documentos
          </h2>
          <Card>
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Label className="text-sm font-medium">Prefixo de Numeracao</Label>
                  <p className="text-xs text-muted-foreground">
                    Prefixo usado na numeracao (ex: ORC, PROP, FT)
                  </p>
                </div>
                <Input
                  value={settings.quotePrefix}
                  onChange={(e) => update({ quotePrefix: e.target.value.toUpperCase() })}
                  className="w-[120px] text-center font-mono text-sm uppercase"
                  maxLength={6}
                  placeholder="ORC"
                />
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Label className="text-sm font-medium">Validade (dias)</Label>
                  <p className="text-xs text-muted-foreground">
                    Dias de validade por defeito para novos orcamentos
                  </p>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={settings.quoteValidity}
                  onChange={(e) => update({ quoteValidity: Number(e.target.value) || 30 })}
                  className="w-[100px] text-center text-sm"
                />
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <Label className="text-sm font-medium">Cor Padrao</Label>
                  <p className="text-xs text-muted-foreground">
                    Cor principal usada em novos orcamentos
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.companyDefaultColor}
                    onChange={(e) => update({ companyDefaultColor: e.target.value })}
                    className="h-9 w-9 cursor-pointer rounded border border-border p-0.5"
                  />
                  <Input
                    value={settings.companyDefaultColor}
                    onChange={(e) => update({ companyDefaultColor: e.target.value })}
                    className="w-[100px] font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <ManageCompanies open={showCompanies} onOpenChange={setShowCompanies} />
      <ManageClients open={showClients} onOpenChange={setShowClients} />
      <ManageTemplates open={showTemplates} onOpenChange={setShowTemplates} />
      <ManageServiceTemplates open={showServiceTemplates} onOpenChange={setShowServiceTemplates} />
    </div>
  )
}
