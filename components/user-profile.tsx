"use client"

import { useState, useCallback } from "react"
import { updateProfile, changePassword, type MockUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Mail,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Save,
  Bell,
  Palette,
  Shield,
} from "lucide-react"
import { toast } from "sonner"

interface UserProfileProps {
  user: MockUser
  onUserUpdate: (user: MockUser) => void
}

export function UserProfile({ user, onUserUpdate }: UserProfileProps) {
  // Profile form
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [company, setCompany] = useState(user.company)
  const [profileDirty, setProfileDirty] = useState(false)

  // Password form
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  // Preferences
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [desktopNotifs, setDesktopNotifs] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const handleProfileChange = useCallback(
    (field: string, value: string) => {
      if (field === "name") setName(value)
      else if (field === "email") setEmail(value)
      else if (field === "company") setCompany(value)
      setProfileDirty(true)
    },
    []
  )

  const handleSaveProfile = useCallback(() => {
    if (!name.trim()) {
      toast.error("O nome e obrigatorio")
      return
    }
    if (!email.trim()) {
      toast.error("O email e obrigatorio")
      return
    }
    const updated = updateProfile({ name, email, company })
    if (updated) {
      onUserUpdate(updated)
      setProfileDirty(false)
      toast.success("Perfil atualizado com sucesso")
    }
  }, [name, email, company, onUserUpdate])

  const handleChangePassword = useCallback(() => {
    if (!currentPass) {
      toast.error("Insira a senha atual")
      return
    }
    if (!newPass || newPass.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    if (newPass !== confirmPass) {
      toast.error("As senhas nao coincidem")
      return
    }
    const result = changePassword(currentPass, newPass)
    if (result.success) {
      setCurrentPass("")
      setNewPass("")
      setConfirmPass("")
      toast.success("Senha alterada com sucesso")
    } else {
      toast.error(result.error || "Erro ao alterar senha")
    }
  }, [currentPass, newPass, confirmPass])

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerir informacoes pessoais, seguranca e preferencias
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile card */}
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {user.avatar}
              </div>
              <div>
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Informacoes pessoais
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={company}
                    onChange={(e) => handleProfileChange("company", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {profileDirty && (
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={handleSaveProfile}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Guardar Alteracoes
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Password card */}
        <Card className="overflow-hidden">
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Seguranca
            </div>

            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Senha atual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Insira a senha atual"
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Min. 6 caracteres"
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Confirmar nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="pl-9"
                    />
                  </div>
                  {newPass && confirmPass && newPass !== confirmPass && (
                    <p className="text-[11px] text-destructive">As senhas nao coincidem</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={!currentPass || !newPass || !confirmPass}
                >
                  <Lock className="mr-1.5 h-3.5 w-3.5" />
                  Alterar Senha
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences card */}
        <Card className="overflow-hidden">
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Palette className="h-3.5 w-3.5" />
              Preferencias
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificacoes por email</p>
                    <p className="text-xs text-muted-foreground">Receber alertas por email</p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifs}
                  onCheckedChange={setEmailNotifs}
                />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificacoes desktop</p>
                    <p className="text-xs text-muted-foreground">Alertas no navegador</p>
                  </div>
                </div>
                <Switch
                  checked={desktopNotifs}
                  onCheckedChange={setDesktopNotifs}
                />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Modo escuro</p>
                    <p className="text-xs text-muted-foreground">Aparencia escura da interface</p>
                  </div>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={(checked) => {
                    setDarkMode(checked)
                    document.documentElement.classList.toggle("dark", checked)
                    toast.success(checked ? "Modo escuro ativado" : "Modo claro ativado")
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Account info (read-only) */}
        <Card className="overflow-hidden">
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Informacoes da conta
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-secondary/50 px-3.5 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">ID da Conta</p>
                <p className="mt-0.5 font-mono text-xs text-foreground">{user.id}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 px-3.5 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Plano</p>
                <p className="mt-0.5 text-xs font-medium text-foreground">Pro <span className="text-primary">(Ativo)</span></p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
