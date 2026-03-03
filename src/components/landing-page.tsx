"use client"

import { Button } from "@/components/ui/button"
import {
  FileText,
  BarChart3,
  Users,
  Shield,
  Zap,
  Download,
  CheckCircle2,
  ArrowRight,
  Layers,
  Clock,
} from "lucide-react"

interface LandingPageProps {
  onLogin: () => void
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-dvh bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Orcamentos
              <span className="ml-1 text-primary">Pro</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#funcionalidades"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Como funciona
            </a>
            <a
              href="#metricas"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Resultados
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onLogin} className="text-sm">
              Entrar
            </Button>
            <Button size="sm" onClick={onLogin} className="text-sm">
              Comecar gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07]"
            style={{
              background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 lg:px-8 lg:pt-28 lg:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              Crie orcamentos profissionais em minutos
            </div>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Orcamentos que{" "}
              <span className="text-primary">convertem</span> clientes
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              A plataforma completa para criar, gerir e acompanhar propostas
              comerciais. Do rascunho ao PDF profissional em poucos cliques.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={onLogin} className="w-full px-8 text-sm sm:w-auto">
                Experimentar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onLogin}
                className="w-full px-8 text-sm sm:w-auto"
              >
                Ver demonstracao
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sem cartao de credito. Configuracao em 30 segundos.
            </p>
          </div>

          {/* Dashboard preview mock */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                </div>
                <div className="ml-4 h-5 flex-1 rounded bg-muted/80" />
              </div>
              {/* Content */}
              <div className="flex">
                {/* Sidebar mock */}
                <div className="hidden w-48 border-r border-border bg-sidebar p-3 md:block">
                  <div className="mb-4 flex items-center gap-2 px-2">
                    <div className="h-6 w-6 rounded bg-sidebar-primary" />
                    <div className="h-3 w-20 rounded bg-sidebar-foreground/20" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-8 rounded-lg bg-sidebar-accent" />
                    <div className="h-8 rounded-lg" />
                    <div className="h-8 rounded-lg" />
                  </div>
                </div>
                {/* Main mock */}
                <div className="flex-1 p-4 md:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-5 w-32 rounded bg-foreground/10" />
                    <div className="h-8 w-28 rounded-lg bg-primary/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="mb-2 h-3 w-16 rounded bg-muted-foreground/15" />
                        <div className="h-6 w-20 rounded bg-foreground/10" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="h-4 w-4 rounded bg-primary/20" />
                        <div className="h-3 flex-1 rounded bg-foreground/8" />
                        <div className="h-5 w-14 rounded-full bg-accent/20" />
                        <div className="h-3 w-16 rounded bg-muted-foreground/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics bar */}
      <section id="metricas" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            { value: "10k+", label: "Orcamentos criados" },
            { value: "98%", label: "Taxa de satisfacao" },
            { value: "3x", label: "Mais rapido que manual" },
            { value: "45%", label: "Taxa de conversao media" },
          ].map((metric, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center bg-card px-6 py-8 md:py-10"
            >
              <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Funcionalidades
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Tudo o que precisa para gerir os seus orcamentos
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Ferramentas profissionais pensadas para simplificar o seu
              dia-a-dia e impressionar os seus clientes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Multi-step intuitivo",
                desc: "Crie propostas passo a passo: empresa, cliente, servicos e condicoes. Sem confusao.",
              },
              {
                icon: Users,
                title: "Catalogo de clientes",
                desc: "Registe clientes e empresas uma vez, reutilize sempre com auto-preenchimento instantaneo.",
              },
              {
                icon: Download,
                title: "Exportacao PDF",
                desc: "Gere PDFs profissionais com a sua marca, logo e cores personalizadas em segundos.",
              },
              {
                icon: BarChart3,
                title: "Dashboard analitico",
                desc: "Acompanhe metricas chave: propostas enviadas, aceites, valores totais e taxa de conversao.",
              },
              {
                icon: Clock,
                title: "Historico de estados",
                desc: "Rastreie cada proposta desde rascunho ate aceite com timeline completa de alteracoes.",
              },
              {
                icon: Shield,
                title: "Templates reutilizaveis",
                desc: "Crie templates de servicos e condicoes para preencher propostas em segundos.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="border-y border-border bg-secondary/30 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Como funciona
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Do rascunho ao cliente em 3 passos
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Configure os seus dados",
                desc: "Registe a sua empresa, clientes e catalogo de servicos. Faca uma vez, use sempre.",
              },
              {
                step: "02",
                title: "Crie a proposta",
                desc: "Selecione empresa e cliente, adicione servicos e condicoes com o assistente multi-step.",
              },
              {
                step: "03",
                title: "Exporte e acompanhe",
                desc: "Gere o PDF profissional, envie ao cliente e acompanhe o estado ate a aceitacao.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </span>
                  {i < 2 && (
                    <div className="hidden h-px flex-1 bg-border md:block" />
                  )}
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center md:px-16 md:py-20">
            <div className="relative z-10">
              <h2 className="mx-auto max-w-lg text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
                Pronto para profissionalizar os seus orcamentos?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-primary-foreground/80 md:text-base">
                Junte-se a milhares de profissionais que ja usam o Orcamentos Pro
                para fechar mais negocios.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={onLogin}
                  className="w-full px-8 sm:w-auto"
                >
                  Comecar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {[
                  "Sem cartao de credito",
                  "Configuracao rapida",
                  "Suporte incluido",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-xs text-primary-foreground/70"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/5" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary-foreground/5" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Orcamentos Pro
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Aplicacao de demonstracao. Dados ficticios armazenados localmente.
          </p>
        </div>
      </footer>
    </div>
  )
}
