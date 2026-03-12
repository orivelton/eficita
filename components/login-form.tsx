"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, DEMO_CREDENTIALS, type MockUser } from "@/lib/auth"
import { FileText, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  onSuccess: (user: MockUser) => void
  onBack: () => void
}

export function LoginForm({ onSuccess, onBack }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setLoading(true)

      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800))

      const result = login(email, password)
      setLoading(false)

      if (result.success && result.user) {
        onSuccess(result.user)
      } else {
        setError(result.error || "Erro ao fazer login")
      }
    },
    [email, password, onSuccess]
  )

  const fillDemo = useCallback(() => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setError("")
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Back link */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao inicio
        </button>

        {/* Logo */}
        <div className="mb-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Entrar na conta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Insira as suas credenciais para aceder ao dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Introduza a senha"
                autoComplete="current-password"
                required
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
              <p className="text-xs font-medium text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="h-10 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A entrar...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Conta de demonstracao:
          </p>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-mono text-xs text-foreground">
                {DEMO_CREDENTIALS.email}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {DEMO_CREDENTIALS.password}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={fillDemo}
            >
              Preencher
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Este e um sistema de demonstracao com dados ficticios.
        </p>
      </div>
    </div>
  )
}
