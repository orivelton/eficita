"use client"

import { useCallback } from "react"
import type { ClientData } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ClientFormProps {
  client: ClientData
  onChange: (client: ClientData) => void
  errors?: { clientName?: string }
}

export function ClientForm({ client, onChange, errors }: ClientFormProps) {
  const update = useCallback(
    (field: keyof ClientData, value: string) => {
      onChange({ ...client, [field]: value })
    },
    [client, onChange]
  )

  return (
    <div className="grid gap-3">
      <div>
        <Label className="text-xs">
          Nome do Cliente <span className="text-destructive">*</span>
        </Label>
        <Input
          value={client.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Nome do cliente"
          className={`mt-1 ${errors?.clientName ? "border-destructive" : ""}`}
        />
        {errors?.clientName && (
          <p className="mt-1 text-xs text-destructive">{errors.clientName}</p>
        )}
      </div>

      <div>
        <Label className="text-xs">NIF</Label>
        <Input
          value={client.nif}
          onChange={(e) => update("nif", e.target.value)}
          placeholder="NIF do cliente"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs">Morada do Cliente</Label>
        <Input
          value={client.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="Morada do cliente"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs">Morada da Obra</Label>
        <Input
          value={client.workAddress}
          onChange={(e) => update("workAddress", e.target.value)}
          placeholder="Morada da obra (se diferente)"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label className="text-xs">Telefone</Label>
          <Input
            value={client.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+351 000 000 000"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input
            type="email"
            value={client.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="email@cliente.pt"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}
