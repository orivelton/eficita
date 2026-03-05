export type NotificationType = 'info' | 'success' | 'warning' | 'quote'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  createdBy?: string
}

export interface CompanyData {
  name: string
  nif: string
  address: string
  phone: string
  email: string
  iban: string
  logo: string | null
  primaryColor: string
}

export interface SavedCompany {
  id: string
  name: string
  nif: string
  address: string
  phone: string
  email: string
  iban: string
  logo: string | null
  primaryColor: string
}

export interface ClientData {
  name: string
  nif: string
  address: string
  phone: string
  email: string
  workAddress: string
}

export interface SavedClient {
  id: string
  name: string
  nif: string
  address: string
  phone: string
  email: string
}

export interface QuoteItem {
  id: string
  serviceName: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  vatPercentage: number
}

export type QuoteStatus = 'rascunho' | 'enviado' | 'em_analise' | 'aceite' | 'recusado' | 'expirado'

export interface QuoteHistoryEntry {
  id: string
  status: QuoteStatus
  date: string
  note: string
}

export type QuoteTemplateId = 'classico' | 'moderno' | 'minimalista' | 'executivo' | 'colorido'

export const QUOTE_TEMPLATES: Record<QuoteTemplateId, { label: string; description: string }> = {
  classico: { label: 'Classico', description: 'Layout tradicional com tabela formal' },
  moderno: { label: 'Moderno', description: 'Barra lateral colorida e tipografia arrojada' },
  minimalista: { label: 'Minimalista', description: 'Limpo e elegante, espacamento generoso' },
  executivo: { label: 'Executivo', description: 'Cabecalho escuro sofisticado e profissional' },
  colorido: { label: 'Colorido', description: 'Blocos de cor vibrantes e dinamicos' },
}

export interface Quote {
  id: string
  number: string
  projectTitle: string
  createdAt: string
  validUntil: string
  notes: string
  company: CompanyData
  client: ClientData
  items: QuoteItem[]
  updatedAt: string
  status: QuoteStatus
  history: QuoteHistoryEntry[]
  templateId: QuoteTemplateId
}

export const QUOTE_STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; color: string; bgColor: string }
> = {
  rascunho: { label: 'Rascunho', color: '#6b7280', bgColor: '#f3f4f6' },
  enviado: { label: 'Enviado', color: '#2563eb', bgColor: '#eff6ff' },
  em_analise: { label: 'Em Analise', color: '#d97706', bgColor: '#fffbeb' },
  aceite: { label: 'Aceite', color: '#16a34a', bgColor: '#f0fdf4' },
  recusado: { label: 'Recusado', color: '#dc2626', bgColor: '#fef2f2' },
  expirado: { label: 'Expirado', color: '#9ca3af', bgColor: '#f9fafb' },
}

export type TemplateCategory = 'geral' | 'pagamento' | 'prazo' | 'garantia' | 'material' | 'outro'

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; color: string }> = {
  geral: { label: 'Geral', color: '#6b7280' },
  pagamento: { label: 'Pagamento', color: '#2563eb' },
  prazo: { label: 'Prazo', color: '#d97706' },
  garantia: { label: 'Garantia', color: '#16a34a' },
  material: { label: 'Material', color: '#9333ea' },
  outro: { label: 'Outro', color: '#64748b' },
}

export interface NotesTemplate {
  id: string
  name: string
  content: string
  category: TemplateCategory
  createdAt: string
  updatedAt: string
}

export type ServiceCategory =
  | 'construcao'
  | 'eletricidade'
  | 'canalizacao'
  | 'pintura'
  | 'limpeza'
  | 'consultoria'
  | 'manutencao'
  | 'outro'

export const SERVICE_CATEGORIES: Record<ServiceCategory, { label: string; color: string }> = {
  construcao: { label: 'Construcao', color: '#d97706' },
  eletricidade: { label: 'Eletricidade', color: '#2563eb' },
  canalizacao: { label: 'Canalizacao', color: '#0891b2' },
  pintura: { label: 'Pintura', color: '#9333ea' },
  limpeza: { label: 'Limpeza', color: '#16a34a' },
  consultoria: { label: 'Consultoria', color: '#6366f1' },
  manutencao: { label: 'Manutencao', color: '#ea580c' },
  outro: { label: 'Outro', color: '#64748b' },
}

export interface ServiceTemplate {
  id: string
  name: string
  description: string
  category: ServiceCategory
  unit: string
  unitPrice: number
  vatPercentage: number
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  currency: string
  currencyLocale: string
  language: string
  defaultVat: number
  quotePrefix: string
  quoteValidity: number
  companyDefaultColor: string
  defaultTemplate: QuoteTemplateId
}

export const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'Euro (EUR)', locale: 'pt-PT', symbol: '\u20AC' },
  { value: 'USD', label: 'Dolar (USD)', locale: 'en-US', symbol: '$' },
  { value: 'GBP', label: 'Libra (GBP)', locale: 'en-GB', symbol: '\u00A3' },
  { value: 'BRL', label: 'Real (BRL)', locale: 'pt-BR', symbol: 'R$' },
  { value: 'CHF', label: 'Franco Suico (CHF)', locale: 'de-CH', symbol: 'CHF' },
  { value: 'AOA', label: 'Kwanza (AOA)', locale: 'pt-AO', symbol: 'Kz' },
  { value: 'MZN', label: 'Metical (MZN)', locale: 'pt-MZ', symbol: 'MT' },
  { value: 'CVE', label: 'Escudo CV (CVE)', locale: 'pt-CV', symbol: '$' },
] as const

export const LANGUAGE_OPTIONS = [
  { value: 'pt-PT', label: 'Portugues (PT)' },
  { value: 'pt-BR', label: 'Portugues (BR)' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Espanol' },
  { value: 'fr', label: 'Francais' },
] as const

export const UNIT_OPTIONS = [
  { value: 'un', label: 'un' },
  { value: 'm²', label: 'm\u00B2' },
  { value: 'm', label: 'm' },
  { value: 'ml', label: 'ml' },
  { value: 'hora', label: 'hora' },
  { value: 'dia', label: 'dia' },
  { value: 'vg', label: 'vg' },
  { value: 'kg', label: 'kg' },
] as const

export const VAT_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 6, label: '6%' },
  { value: 13, label: '13%' },
  { value: 23, label: '23%' },
] as const
