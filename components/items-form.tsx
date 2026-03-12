"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import type { QuoteItem, ServiceTemplate, ServiceCategory } from "@/lib/types"
import { UNIT_OPTIONS, VAT_OPTIONS, SERVICE_CATEGORIES } from "@/lib/types"
import {
  createEmptyItem,
  calculateItemTotal,
  formatCurrency,
  calculateSubtotal,
  calculateTotalVat,
  calculateGrandTotal,
  loadServiceTemplates,
  serviceTemplateToItem,
  updateServiceTemplate,
} from "@/lib/quotes"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Search, Wrench, ChevronDown, ChevronUp, Pencil, X, GripVertical } from "lucide-react"
import type { ValidationErrors } from "@/lib/quotes"
import { toast } from "sonner"

interface ItemsFormProps {
  items: QuoteItem[]
  onChange: (items: QuoteItem[]) => void
  errors?: ValidationErrors
}

export function ItemsForm({ items, onChange, errors }: ItemsFormProps) {
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([])
  const [showCatalog, setShowCatalog] = useState(true)
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogFilter, setCatalogFilter] = useState<ServiceCategory | "all">("all")
  const [editingService, setEditingService] = useState<ServiceTemplate | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "outro" as ServiceCategory,
    unit: "un",
    unitPrice: 0,
    vatPercentage: 23,
  })

  useEffect(() => {
    setServiceTemplates(loadServiceTemplates())
  }, [])

  const filteredServices = useMemo(() => {
    let result = serviceTemplates
    if (catalogSearch.trim()) {
      const term = catalogSearch.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term)
      )
    }
    if (catalogFilter !== "all") {
      result = result.filter((t) => t.category === catalogFilter)
    }
    return result
  }, [serviceTemplates, catalogSearch, catalogFilter])

  const updateItem = useCallback(
    (id: string, field: keyof QuoteItem, value: string | number) => {
      onChange(
        items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      )
    },
    [items, onChange]
  )

  const addItem = useCallback(() => {
    onChange([...items, createEmptyItem()])
  }, [items, onChange])

  const removeItem = useCallback(
    (id: string) => {
      if (items.length <= 1) return
      onChange(items.filter((item) => item.id !== id))
    },
    [items, onChange]
  )

  const handleAddFromTemplate = useCallback(
    (template: ServiceTemplate) => {
      const newItem = serviceTemplateToItem(template)
      onChange([...items, newItem])
      toast.success(`"${template.name}" adicionado`)
    },
    [items, onChange]
  )

  const handleStartEditService = useCallback((t: ServiceTemplate) => {
    setEditingService(t)
    setEditForm({
      name: t.name,
      description: t.description,
      category: t.category,
      unit: t.unit,
      unitPrice: t.unitPrice,
      vatPercentage: t.vatPercentage,
    })
  }, [])

  const handleSaveEditService = useCallback(() => {
    if (!editingService) return
    if (!editForm.name.trim()) {
      toast.error("Nome obrigatorio")
      return
    }
    const updated = updateServiceTemplate({
      ...editingService,
      ...editForm,
    })
    setServiceTemplates(updated)
    setEditingService(null)
    toast.success("Servico atualizado")
  }, [editingService, editForm])

  // Drag and drop
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<"above" | "below" | null>(null)
  const dragCounterRef = useRef<Record<string, number>>({})

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
      setDraggedId(itemId)
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("text/plain", itemId)
      const el = e.currentTarget
      requestAnimationFrame(() => {
        el.style.opacity = "0.4"
      })
    },
    []
  )

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.style.opacity = "1"
      setDraggedId(null)
      setDragOverId(null)
      setDragOverPosition(null)
      dragCounterRef.current = {}
    },
    []
  )

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
      e.preventDefault()
      dragCounterRef.current[itemId] = (dragCounterRef.current[itemId] || 0) + 1
      if (itemId !== draggedId) {
        setDragOverId(itemId)
      }
    },
    [draggedId]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
      e.preventDefault()
      dragCounterRef.current[itemId] = (dragCounterRef.current[itemId] || 0) - 1
      if (dragCounterRef.current[itemId] <= 0) {
        dragCounterRef.current[itemId] = 0
        if (dragOverId === itemId) {
          setDragOverId(null)
          setDragOverPosition(null)
        }
      }
    },
    [dragOverId]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      if (itemId === draggedId) return
      const rect = e.currentTarget.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      setDragOverPosition(e.clientY < midY ? "above" : "below")
      setDragOverId(itemId)
    },
    [draggedId]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      e.preventDefault()
      if (!draggedId || draggedId === targetId) return
      const fromIndex = items.findIndex((i) => i.id === draggedId)
      const toIndex = items.findIndex((i) => i.id === targetId)
      if (fromIndex < 0 || toIndex < 0) return

      const newItems = [...items]
      const [moved] = newItems.splice(fromIndex, 1)
      let insertAt = toIndex
      if (dragOverPosition === "below") {
        insertAt = fromIndex < toIndex ? toIndex : toIndex + 1
      } else {
        insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex
      }
      insertAt = Math.max(0, Math.min(insertAt, newItems.length))
      newItems.splice(insertAt, 0, moved)
      onChange(newItems)

      setDraggedId(null)
      setDragOverId(null)
      setDragOverPosition(null)
      dragCounterRef.current = {}
    },
    [draggedId, dragOverPosition, items, onChange]
  )

  return (
    <div className="grid gap-4">
      {errors?.items && (
        <p className="text-xs text-destructive">{errors.items}</p>
      )}

      {/* Service templates catalog */}
      {serviceTemplates.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <button
            className="flex w-full items-center justify-between p-3 text-left"
            onClick={() => setShowCatalog(!showCatalog)}
          >
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Catalogo de servicos
              </span>
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {serviceTemplates.length}
              </span>
            </div>
            {showCatalog ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showCatalog && (
            <div className="border-t border-border p-3">
              {editingService ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">
                      Editar servico
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditingService(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Nome do servico"
                    className="text-sm"
                  />
                  <Input
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Descricao"
                    className="text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Categoria</Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(v) =>
                          setEditForm({
                            ...editForm,
                            category: v as ServiceCategory,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.keys(SERVICE_CATEGORIES) as ServiceCategory[]
                          ).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {SERVICE_CATEGORIES[cat].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Unidade</Label>
                      <Select
                        value={editForm.unit}
                        onValueChange={(v) =>
                          setEditForm({ ...editForm, unit: v })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
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
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Preco un.</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={editForm.unitPrice || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">IVA</Label>
                      <Select
                        value={String(editForm.vatPercentage)}
                        onValueChange={(v) =>
                          setEditForm({
                            ...editForm,
                            vatPercentage: parseInt(v),
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
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
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingService(null)}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEditService}>
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search + filter */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar servicos..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                    <Select
                      value={catalogFilter}
                      onValueChange={(v) =>
                        setCatalogFilter(v as ServiceCategory | "all")
                      }
                    >
                      <SelectTrigger className="h-8 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {(
                          Object.keys(SERVICE_CATEGORIES) as ServiceCategory[]
                        ).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {SERVICE_CATEGORIES[cat].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service cards */}
                  <div className="grid gap-1.5 max-h-[200px] overflow-y-auto">
                    {filteredServices.length === 0 ? (
                      <p className="py-3 text-center text-xs text-muted-foreground">
                        Nenhum servico encontrado
                      </p>
                    ) : (
                      filteredServices.map((t) => {
                        const catCfg = SERVICE_CATEGORIES[t.category]
                        return (
                          <div
                            key={t.id}
                            className="group flex items-center gap-2.5 rounded-lg border border-border p-2 transition-colors hover:bg-secondary/30"
                          >
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded"
                              style={{
                                backgroundColor: `${catCfg.color}12`,
                              }}
                            >
                              <Wrench
                                className="h-3.5 w-3.5"
                                style={{ color: catCfg.color }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-xs font-medium text-foreground">
                                  {t.name}
                                </p>
                                <span
                                  className="inline-flex shrink-0 rounded-full px-1 py-0 text-[8px] font-medium"
                                  style={{
                                    backgroundColor: `${catCfg.color}15`,
                                    color: catCfg.color,
                                  }}
                                >
                                  {catCfg.label}
                                </span>
                              </div>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {formatCurrency(t.unitPrice)}/{t.unit} · IVA{" "}
                                {t.vatPercentage}%
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => handleStartEditService(t)}
                                title="Editar servico"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-6 px-2 text-[10px]"
                                onClick={() => handleAddFromTemplate(t)}
                              >
                                <Plus className="mr-0.5 h-3 w-3" />
                                Adicionar
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

      {/* Item cards */}
      {items.map((item, index) => {
        const itemErr = errors?.itemErrors?.[item.id]
        const isOver = dragOverId === item.id && draggedId !== item.id
        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnd={handleDragEnd}
            onDragEnter={(e) => handleDragEnter(e, item.id)}
            onDragLeave={(e) => handleDragLeave(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={(e) => handleDrop(e, item.id)}
            className={`relative rounded-lg border bg-secondary/30 p-3 transition-all ${
              draggedId === item.id
                ? "border-primary/40 opacity-40"
                : isOver
                  ? "border-primary"
                  : "border-border"
            }`}
          >
            {/* Drop indicator line */}
            {isOver && dragOverPosition === "above" && (
              <div className="absolute -top-[3px] left-2 right-2 h-[3px] rounded-full bg-primary" />
            )}
            {isOver && dragOverPosition === "below" && (
              <div className="absolute -bottom-[3px] left-2 right-2 h-[3px] rounded-full bg-primary" />
            )}

            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div
                  className="cursor-grab touch-none rounded p-0.5 text-muted-foreground/50 hover:bg-secondary hover:text-muted-foreground active:cursor-grabbing"
                  onMouseDown={(e) => e.stopPropagation()}
                  title="Arrastar para reorganizar"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id)}
                disabled={items.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Remover item</span>
              </Button>
            </div>

            <div className="grid gap-3">
              <div>
                <Label className="text-xs">
                  Servico <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={item.serviceName}
                  onChange={(e) =>
                    updateItem(item.id, "serviceName", e.target.value)
                  }
                  placeholder="Nome do servico"
                  className={`mt-1 text-sm ${
                    itemErr?.name ? "border-destructive" : ""
                  }`}
                />
                {itemErr?.name && (
                  <p className="mt-0.5 text-[10px] text-destructive">
                    {itemErr.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Descricao</Label>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                  placeholder="Descricao opcional"
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div>
                  <Label className="text-xs">Qtd</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={`mt-1 text-sm ${
                      itemErr?.quantity ? "border-destructive" : ""
                    }`}
                  />
                  {itemErr?.quantity && (
                    <p className="mt-0.5 text-[10px] text-destructive">
                      {itemErr.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Unidade</Label>
                  <Select
                    value={item.unit}
                    onValueChange={(val) => updateItem(item.id, "unit", val)}
                  >
                    <SelectTrigger className="mt-1 text-sm">
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
                  <Label className="text-xs">Preco Un.</Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={item.unitPrice || ""}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "unitPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={`mt-1 text-sm ${
                      itemErr?.price ? "border-destructive" : ""
                    }`}
                  />
                  {itemErr?.price && (
                    <p className="mt-0.5 text-[10px] text-destructive">
                      {itemErr.price}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">IVA</Label>
                  <Select
                    value={String(item.vatPercentage)}
                    onValueChange={(val) =>
                      updateItem(item.id, "vatPercentage", parseInt(val))
                    }
                  >
                    <SelectTrigger className="mt-1 text-sm">
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

              <div className="text-right">
                <span className="text-xs text-muted-foreground">Total: </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(calculateItemTotal(item))}
                </span>
              </div>
            </div>
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addItem}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Adicionar Item Manualmente
      </Button>

      {/* Totals */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal (s/ IVA)</span>
          <span className="font-medium text-foreground">
            {formatCurrency(calculateSubtotal(items))}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">IVA</span>
          <span className="font-medium text-foreground">
            {formatCurrency(calculateTotalVat(items))}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(calculateGrandTotal(items))}
          </span>
        </div>
      </div>
    </div>
  )
}
