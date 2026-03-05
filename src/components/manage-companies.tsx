'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { SavedCompany } from '@/lib/types'
import {
  loadSavedCompanies,
  addSavedCompany,
  updateSavedCompany,
  deleteSavedCompany,
  generateId,
} from '@/lib/quotes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Plus, Pencil, Trash2, Building2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface ManageCompaniesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function emptyCompanyForm(): Omit<SavedCompany, 'id'> {
  return {
    name: '',
    nif: '',
    address: '',
    phone: '',
    email: '',
    iban: '',
    logo: null,
    primaryColor: '#1a56db',
  }
}

export function ManageCompanies({ open, onOpenChange }: ManageCompaniesProps) {
  const [companies, setCompanies] = useState<SavedCompany[]>([])
  const [editing, setEditing] = useState<SavedCompany | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Omit<SavedCompany, 'id'>>(emptyCompanyForm())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      ;(async () => {
        const list = await loadSavedCompanies()
        setCompanies(list)
      })()
    }
  }, [open])

  const resetForm = useCallback(() => {
    setForm(emptyCompanyForm())
    setEditing(null)
    setCreating(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error('O nome da empresa é obrigatório')
      return
    }
    if (editing) {
      const updated = await updateSavedCompany({ ...form, id: editing.id })
      setCompanies(updated)
      toast.success('Empresa atualizada')
    } else {
      const updated = await addSavedCompany(form)
      setCompanies(updated)
      toast.success('Empresa registada')
    }
    resetForm()
  }, [form, editing, resetForm])

  const handleEdit = useCallback((company: SavedCompany) => {
    setEditing(company)
    setCreating(true)
    setForm({
      name: company.name,
      nif: company.nif,
      address: company.address,
      phone: company.phone,
      email: company.email,
      iban: company.iban,
      logo: company.logo,
      primaryColor: company.primaryColor,
    })
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    const updated = await deleteSavedCompany(deleteId)
    setCompanies(updated)
    setDeleteId(null)
    toast.success('Empresa eliminada')
  }, [deleteId])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo deve ter no máximo 2MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, logo: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }, [])

  const showForm = creating

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetForm()
          onOpenChange(v)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Empresas Registadas
            </DialogTitle>
            <DialogDescription>
              Registe as suas empresas para auto-preenchimento nos orçamentos.
            </DialogDescription>
          </DialogHeader>

          {showForm ? (
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  {form.logo ? (
                    <div className="relative">
                      <img
                        src={form.logo}
                        alt="Logo"
                        className="h-14 w-14 rounded-lg border border-border object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, logo: null }))
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-14 w-14"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <span className="text-[10px] text-muted-foreground">Logo</span>
                </div>
                <div className="flex-1 grid gap-2.5">
                  <div>
                    <Label className="text-xs">
                      Nome da Empresa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Empresa, Lda."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">NIF</Label>
                    <Input
                      value={form.nif}
                      onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))}
                      placeholder="123456789"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">Morada</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Rua, Código Postal, Cidade"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+351 000 000 000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@empresa.pt"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">IBAN</Label>
                <Input
                  value={form.iban}
                  onChange={(e) => setForm((p) => ({ ...p, iban: e.target.value }))}
                  placeholder="PT50 0000 0000 0000 0000 0000 0"
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Cor Principal</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="h-9 w-9 cursor-pointer rounded border border-border p-0.5"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="flex-1 font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  {editing ? 'Atualizar' : 'Registar'}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Button
                variant="outline"
                size="sm"
                className="mb-4 w-full"
                onClick={() => setCreating(true)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Nova Empresa
              </Button>

              {companies.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">Nenhuma empresa registada.</p>
                  <p className="text-xs text-muted-foreground">
                    Registe uma empresa para auto-preenchimento.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="grid gap-2">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded border border-border object-contain"
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-secondary">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {company.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[company.nif && `NIF: ${company.nif}`, company.address]
                                .filter(Boolean)
                                .join(' - ') || 'Sem detalhes'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(company)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeleteId(company.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. A empresa será removida do registo.
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
    </>
  )
}
