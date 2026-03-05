'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ServiceTemplate, ServiceCategory } from '@/lib/types'
import { SERVICE_CATEGORIES, UNIT_OPTIONS, VAT_OPTIONS } from '@/lib/types'
import {
  loadServiceTemplates,
  addServiceTemplate,
  updateServiceTemplate,
  deleteServiceTemplate,
  formatCurrency,
} from '@/lib/quotes'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Plus, Pencil, Trash2, Search, Wrench } from 'lucide-react'
import { toast } from 'sonner'

interface ManageServiceTemplatesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyForm = {
  name: '',
  description: '',
  category: 'outro' as ServiceCategory,
  unit: 'un',
  unitPrice: 0,
  vatPercentage: 23,
}

export function ManageServiceTemplates({ open, onOpenChange }: ManageServiceTemplatesProps) {
  const [templates, setTemplates] = useState<ServiceTemplate[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<ServiceCategory | 'all'>('all')
  const [editing, setEditing] = useState<ServiceTemplate | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      ;(async () => {
        setTemplates(await loadServiceTemplates())
      })()
    }
  }, [open])

  const filtered = useMemo(() => {
    let result = templates
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (t) => t.name.toLowerCase().includes(term) || t.description.toLowerCase().includes(term),
      )
    }
    if (catFilter !== 'all') {
      result = result.filter((t) => t.category === catFilter)
    }
    return result
  }, [templates, search, catFilter])

  const startNew = useCallback(() => {
    setForm(emptyForm)
    setEditing(null)
    setIsNew(true)
  }, [])

  const startEdit = useCallback((t: ServiceTemplate) => {
    setForm({
      name: t.name,
      description: t.description,
      category: t.category,
      unit: t.unit,
      unitPrice: t.unitPrice,
      vatPercentage: t.vatPercentage,
    })
    setEditing(t)
    setIsNew(false)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditing(null)
    setIsNew(false)
    setForm(emptyForm)
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error('Nome do servico obrigatorio')
      return
    }
    if (isNew) {
      setTemplates(await addServiceTemplate(form))
      toast.success('Servico adicionado')
    } else if (editing) {
      setTemplates(
        await updateServiceTemplate({
          ...editing,
          ...form,
        }),
      )
      toast.success('Servico atualizado')
    }
    cancelEdit()
  }, [form, isNew, editing, cancelEdit])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    setTemplates(await deleteServiceTemplate(deleteId))
    toast.success('Servico removido')
    setDeleteId(null)
  }, [deleteId])

  const showForm = isNew || editing

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-xl">
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4.5 w-4.5 text-primary" />
                Templates de Servicos
              </DialogTitle>
              {!showForm && (
                <Button size="sm" onClick={startNew}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Novo Servico
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {showForm ? (
              <div className="space-y-4 p-5">
                <p className="text-sm font-semibold text-foreground">
                  {isNew ? 'Novo Servico' : 'Editar Servico'}
                </p>

                <div>
                  <Label className="text-xs">Nome do servico *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ex: Pintura interior de parede"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Descricao</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descricao opcional do servico"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v as ServiceCategory })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(SERVICE_CATEGORIES) as ServiceCategory[]).map((cat) => {
                        const cfg = SERVICE_CATEGORIES[cat]
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
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Unidade</Label>
                    <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-xs">Preco unitario</Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={form.unitPrice || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">IVA</Label>
                    <Select
                      value={String(form.vatPercentage)}
                      onValueChange={(v) => setForm({ ...form, vatPercentage: parseInt(v) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VAT_OPTIONS.map((v) => (
                          <SelectItem key={v.value} value={String(v.value)}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    {isNew ? 'Adicionar' : 'Guardar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {/* Search + Filter */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar servicos..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>
                  <Select
                    value={catFilter}
                    onValueChange={(v) => setCatFilter(v as ServiceCategory | 'all')}
                  >
                    <SelectTrigger className="w-[140px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {(Object.keys(SERVICE_CATEGORIES) as ServiceCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {SERVICE_CATEGORIES[cat].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <Wrench className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      {templates.length === 0
                        ? 'Nenhum servico registado'
                        : 'Nenhum servico encontrado'}
                    </p>
                    {templates.length === 0 && (
                      <Button size="sm" className="mt-3" onClick={startNew}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Criar primeiro servico
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {filtered.map((t) => {
                      const catCfg = SERVICE_CATEGORIES[t.category]
                      return (
                        <div
                          key={t.id}
                          className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/30"
                        >
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: `${catCfg.color}12`,
                            }}
                          >
                            <Wrench className="h-4 w-4" style={{ color: catCfg.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-foreground">
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
                            <p className="truncate text-xs text-muted-foreground">
                              {formatCurrency(t.unitPrice)}/{t.unit} · IVA {t.vatPercentage}%
                              {t.description && ` · ${t.description}`}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => startEdit(t)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => setDeleteId(t.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover servico?</AlertDialogTitle>
            <AlertDialogDescription>
              Este template sera eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
