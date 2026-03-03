"use client"

import { useState, useEffect, useCallback } from "react"
import type { SavedClient } from "@/lib/types"
import {
  loadSavedClients,
  addSavedClient,
  updateSavedClient,
  deleteSavedClient,
} from "@/lib/quotes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Plus, Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

interface ManageClientsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function emptyClientForm(): Omit<SavedClient, "id"> {
  return {
    name: "",
    nif: "",
    address: "",
    phone: "",
    email: "",
  }
}

export function ManageClients({ open, onOpenChange }: ManageClientsProps) {
  const [clients, setClients] = useState<SavedClient[]>([])
  const [editing, setEditing] = useState<SavedClient | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Omit<SavedClient, "id">>(emptyClientForm())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (open) setClients(loadSavedClients())
  }, [open])

  const resetForm = useCallback(() => {
    setForm(emptyClientForm())
    setEditing(null)
    setCreating(false)
  }, [])

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      toast.error("O nome do cliente é obrigatório")
      return
    }
    if (editing) {
      const updated = updateSavedClient({ ...form, id: editing.id })
      setClients(updated)
      toast.success("Cliente atualizado")
    } else {
      const updated = addSavedClient(form)
      setClients(updated)
      toast.success("Cliente registado")
    }
    resetForm()
  }, [form, editing, resetForm])

  const handleEdit = useCallback((client: SavedClient) => {
    setEditing(client)
    setCreating(true)
    setForm({
      name: client.name,
      nif: client.nif,
      address: client.address,
      phone: client.phone,
      email: client.email,
    })
  }, [])

  const handleDelete = useCallback(() => {
    if (!deleteId) return
    const updated = deleteSavedClient(deleteId)
    setClients(updated)
    setDeleteId(null)
    toast.success("Cliente eliminado")
  }, [deleteId])

  const showForm = creating

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Clientes Registados
            </DialogTitle>
            <DialogDescription>
              Registe os seus clientes para auto-preenchimento nos orçamentos.
            </DialogDescription>
          </DialogHeader>

          {showForm ? (
            <div className="grid gap-3">
              <div>
                <Label className="text-xs">Nome do Cliente <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nome do cliente"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">NIF</Label>
                <Input
                  value={form.nif}
                  onChange={(e) => setForm((p) => ({ ...p, nif: e.target.value }))}
                  placeholder="NIF do cliente"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Morada</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Morada do cliente"
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
                    placeholder="email@cliente.pt"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  {editing ? "Atualizar" : "Registar"}
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
                Novo Cliente
              </Button>

              {clients.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhum cliente registado.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registe um cliente para auto-preenchimento.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="grid gap-2">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {client.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[client.nif && `NIF: ${client.nif}`, client.address]
                              .filter(Boolean)
                              .join(" - ") || "Sem detalhes"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(client)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeleteId(client.id)}
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
            <AlertDialogTitle>Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. O cliente será removido do registo.
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
