"use client"

import { useState, useEffect, useCallback } from "react"
import type { NotesTemplate, TemplateCategory } from "@/lib/types"
import { TEMPLATE_CATEGORIES } from "@/lib/types"
import {
  loadTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/quotes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, FileText, Search, X } from "lucide-react"
import { toast } from "sonner"

interface ManageTemplatesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORIES = Object.keys(TEMPLATE_CATEGORIES) as TemplateCategory[]

const emptyForm = {
  name: "",
  content: "",
  category: "geral" as TemplateCategory,
}

export function ManageTemplates({ open, onOpenChange }: ManageTemplatesProps) {
  const [templates, setTemplates] = useState<NotesTemplate[]>([])
  const [editing, setEditing] = useState<NotesTemplate | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | "all">("all")

  useEffect(() => {
    if (open) {
      setTemplates(loadTemplates())
      setShowForm(false)
      setEditing(null)
      setSearch("")
    }
  }, [open])

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      toast.error("Nome do template obrigatorio")
      return
    }
    if (!form.content.trim()) {
      toast.error("Conteudo do template obrigatorio")
      return
    }

    if (editing) {
      const updated = updateTemplate({
        ...editing,
        name: form.name,
        content: form.content,
        category: form.category,
      })
      setTemplates(updated)
      toast.success("Template atualizado")
    } else {
      const updated = addTemplate(form)
      setTemplates(updated)
      toast.success("Template criado")
    }

    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
  }, [form, editing])

  const handleEdit = useCallback((template: NotesTemplate) => {
    setEditing(template)
    setForm({
      name: template.name,
      content: template.content,
      category: template.category,
    })
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(() => {
    if (!deleteId) return
    const updated = deleteTemplate(deleteId)
    setTemplates(updated)
    setDeleteId(null)
    toast.success("Template removido")
  }, [deleteId])

  const handleNew = useCallback(() => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }, [])

  const filtered = templates.filter((t) => {
    const matchSearch =
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === "all" || t.category === filterCategory
    return matchSearch && matchCategory
  })

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Templates de Observacoes / Condicoes
            </DialogTitle>
          </DialogHeader>

          {showForm ? (
            <div className="space-y-4 overflow-y-auto px-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {editing ? "Editar Template" : "Novo Template"}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label className="text-xs font-medium">Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: Condicoes de pagamento padrao"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as TemplateCategory })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => {
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
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium">Conteudo</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={"Escreva as observacoes / condicoes...\n\nExemplo:\n- Pagamento: 50% no inicio, 50% na conclusao\n- Prazo de execucao: 15 dias uteis\n- Garantia: 2 anos"}
                  rows={8}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  {editing ? "Guardar Alteracoes" : "Criar Template"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-3 overflow-hidden">
              {/* Search + New */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button size="sm" onClick={handleNew}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Novo
                </Button>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterCategory === "all"
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  Todos
                </button>
                {CATEGORIES.map((cat) => {
                  const cfg = TEMPLATE_CATEGORIES[cat]
                  const count = templates.filter((t) => t.category === cat).length
                  if (count === 0) return null
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: filterCategory === cat ? cfg.color : `${cfg.color}15`,
                        color: filterCategory === cat ? "#fff" : cfg.color,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: filterCategory === cat ? "#fff" : cfg.color,
                        }}
                      />
                      {cfg.label}
                      <span className="opacity-60">{count}</span>
                    </button>
                  )
                })}
              </div>

              {/* Template list */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {templates.length === 0
                        ? "Nenhum template criado"
                        : "Nenhum template encontrado"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {templates.length === 0
                        ? "Crie templates para reutilizar observacoes e condicoes"
                        : "Tente alterar a pesquisa ou filtro"}
                    </p>
                    {templates.length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={handleNew}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Criar primeiro template
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {filtered.map((template) => {
                      const catCfg = TEMPLATE_CATEGORIES[template.category]
                      return (
                        <div
                          key={template.id}
                          className="group rounded-lg border border-border bg-card p-3 transition-colors hover:bg-secondary/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {template.name}
                                </p>
                                <span
                                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                  style={{
                                    backgroundColor: `${catCfg.color}15`,
                                    color: catCfg.color,
                                  }}
                                >
                                  {catCfg.label}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                                {template.content}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEdit(template)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteId(template.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser revertida. O template sera permanentemente
              removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
