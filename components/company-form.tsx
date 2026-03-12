"use client"

import { useCallback, useRef } from "react"
import type { CompanyData } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface CompanyFormProps {
  company: CompanyData
  onChange: (company: CompanyData) => void
}

export function CompanyForm({ company, onChange }: CompanyFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = useCallback(
    (field: keyof CompanyData, value: string) => {
      onChange({ ...company, [field]: value })
    },
    [company, onChange]
  )

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo deve ter no máximo 2MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange({ ...company, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    },
    [company, onChange]
  )

  const removeLogo = useCallback(() => {
    onChange({ ...company, logo: null })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [company, onChange])

  return (
    <div className="grid gap-3">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1.5">
          {company.logo ? (
            <div className="relative">
              <img
                src={company.logo}
                alt="Logo da empresa"
                className="h-14 w-14 rounded-lg border border-border object-contain"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
                onClick={removeLogo}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover logo</span>
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
              <span className="sr-only">Upload logo</span>
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
            <Label className="text-xs">Nome da Empresa</Label>
            <Input
              value={company.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Empresa, Lda."
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">NIF</Label>
            <Input
              value={company.nif}
              onChange={(e) => update("nif", e.target.value)}
              placeholder="123456789"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs">Morada</Label>
        <Input
          value={company.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="Rua, Código Postal, Cidade"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label className="text-xs">Telefone</Label>
          <Input
            value={company.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+351 000 000 000"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input
            type="email"
            value={company.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="email@empresa.pt"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">IBAN</Label>
        <Input
          value={company.iban}
          onChange={(e) => update("iban", e.target.value)}
          placeholder="PT50 0000 0000 0000 0000 0000 0"
          className="mt-1 font-mono text-xs"
        />
      </div>

      <div>
        <Label className="text-xs">Cor do Orçamento</Label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={company.primaryColor}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="h-9 w-9 cursor-pointer rounded border border-border p-0.5"
          />
          <Input
            value={company.primaryColor}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="flex-1 font-mono text-xs"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  )
}
