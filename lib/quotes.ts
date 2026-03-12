import type { Quote, CompanyData, QuoteItem, SavedCompany, SavedClient, QuoteStatus, QuoteHistoryEntry, AppSettings, NotesTemplate, TemplateCategory, ServiceTemplate, ServiceCategory } from "./types"
import { CURRENCY_OPTIONS } from "./types"

const STORAGE_KEY = "orcamentos-app-data"
const COMPANIES_KEY = "orcamentos-saved-companies"
const CLIENTS_KEY = "orcamentos-saved-clients"
const SETTINGS_KEY = "orcamentos-app-settings"
const TEMPLATES_KEY = "orcamentos-notes-templates"
const SERVICE_TEMPLATES_KEY = "orcamentos-service-templates"

export function getDefaultSettings(): AppSettings {
  return {
    currency: "EUR",
    currencyLocale: "pt-PT",
    language: "pt-PT",
    defaultVat: 23,
    quotePrefix: "ORC",
    quoteValidity: 30,
    companyDefaultColor: "#1a56db",
    defaultTemplate: "classico",
  }
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return getDefaultSettings()
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (!data) return getDefaultSettings()
    return { ...getDefaultSettings(), ...JSON.parse(data) }
  } catch {
    return getDefaultSettings()
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function generateQuoteNumber(existing: Quote[]): string {
  const settings = loadSettings()
  const year = new Date().getFullYear()
  const count = existing.length + 1
  return `${settings.quotePrefix}-${year}-${String(count).padStart(4, "0")}`
}

export function getDefaultCompany(): CompanyData {
  return {
    name: "",
    nif: "",
    address: "",
    phone: "",
    email: "",
    iban: "",
    logo: null,
    primaryColor: "#1a56db",
  }
}

export function createEmptyItem(): QuoteItem {
  return {
    id: generateId(),
    serviceName: "",
    description: "",
    quantity: 1,
    unit: "un",
    unitPrice: 0,
    vatPercentage: 23,
  }
}

export function createEmptyQuote(existingQuotes: Quote[]): Quote {
  const settings = loadSettings()
  const now = new Date()
  const validUntil = new Date(now)
  validUntil.setDate(validUntil.getDate() + settings.quoteValidity)

  const savedCompany = getLastUsedCompany()

  return {
    id: generateId(),
    number: generateQuoteNumber(existingQuotes),
    projectTitle: "",
    createdAt: now.toISOString().split("T")[0],
    validUntil: validUntil.toISOString().split("T")[0],
    notes: "",
    company: savedCompany || getDefaultCompany(),
    client: {
      name: "",
      nif: "",
      address: "",
      phone: "",
      email: "",
      workAddress: "",
    },
    items: [createEmptyItem()],
    updatedAt: now.toISOString(),
    status: "rascunho" as QuoteStatus,
    history: [
      {
        id: generateId(),
        status: "rascunho" as QuoteStatus,
        date: now.toISOString(),
        note: "Orçamento criado",
      },
    ],
    templateId: settings.defaultTemplate || "classico",
  }
}

export function addHistoryEntry(
  quote: Quote,
  status: QuoteStatus,
  note: string
): Quote {
  const entry: QuoteHistoryEntry = {
    id: generateId(),
    status,
    date: new Date().toISOString(),
    note,
  }
  return {
    ...quote,
    status,
    history: [...(quote.history || []), entry],
    updatedAt: new Date().toISOString(),
  }
}

export function getLastUsedCompany(): CompanyData | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    const quotes: Quote[] = JSON.parse(data)
    if (quotes.length === 0) return null
    const sorted = [...quotes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    return sorted[0].company
  } catch {
    return null
  }
}

export function loadQuotes(): Quote[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveQuotes(quotes: Quote[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))
}

export function saveQuote(quote: Quote): Quote[] {
  const quotes = loadQuotes()
  const index = quotes.findIndex((q) => q.id === quote.id)
  const updated = { ...quote, updatedAt: new Date().toISOString() }
  if (index >= 0) {
    quotes[index] = updated
  } else {
    quotes.push(updated)
  }
  saveQuotes(quotes)
  return quotes
}

export function deleteQuote(id: string): Quote[] {
  const quotes = loadQuotes().filter((q) => q.id !== id)
  saveQuotes(quotes)
  return quotes
}

export function duplicateQuote(id: string): Quote[] {
  const quotes = loadQuotes()
  const original = quotes.find((q) => q.id === id)
  if (!original) return quotes
  const now = new Date()
  const duplicate: Quote = {
    ...JSON.parse(JSON.stringify(original)),
    id: generateId(),
    number: generateQuoteNumber(quotes),
    createdAt: now.toISOString().split("T")[0],
    updatedAt: now.toISOString(),
    items: original.items.map((item) => ({ ...item, id: generateId() })),
    status: "rascunho" as QuoteStatus,
    history: [
      {
        id: generateId(),
        status: "rascunho" as QuoteStatus,
        date: now.toISOString(),
        note: "Duplicado de " + original.number,
      },
    ],
    templateId: original.templateId || "classico",
  }
  quotes.push(duplicate)
  saveQuotes(quotes)
  return quotes
}

export function calculateItemTotal(item: QuoteItem): number {
  return item.quantity * item.unitPrice
}

export function calculateSubtotal(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
}

export function calculateTotalVat(items: QuoteItem[]): number {
  return items.reduce(
    (sum, item) => sum + calculateItemTotal(item) * (item.vatPercentage / 100),
    0
  )
}

export function calculateGrandTotal(items: QuoteItem[]): number {
  return calculateSubtotal(items) + calculateTotalVat(items)
}

export function formatCurrency(value: number): string {
  const settings = loadSettings()
  const currencyOpt = CURRENCY_OPTIONS.find((c) => c.value === settings.currency)
  return new Intl.NumberFormat(currencyOpt?.locale || settings.currencyLocale, {
    style: "currency",
    currency: settings.currency,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const settings = loadSettings()
  try {
    return new Intl.DateTimeFormat(settings.currencyLocale || "pt-PT").format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export interface ValidationErrors {
  clientName?: string
  items?: string
  itemErrors?: Record<string, { quantity?: string; price?: string; name?: string }>
}

export function validateQuote(quote: Quote): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!quote.client.name.trim()) {
    errors.clientName = "Nome do cliente é obrigatório"
  }

  if (quote.items.length === 0) {
    errors.items = "Adicione pelo menos 1 item"
  }

  const itemErrors: ValidationErrors["itemErrors"] = {}
  quote.items.forEach((item) => {
    const errs: { quantity?: string; price?: string; name?: string } = {}
    if (!item.serviceName.trim()) errs.name = "Nome obrigatório"
    if (item.quantity <= 0) errs.quantity = "Qtd > 0"
    if (item.unitPrice < 0) errs.price = "Preço >= 0"
    if (Object.keys(errs).length > 0) {
      itemErrors![item.id] = errs
    }
  })

  if (Object.keys(itemErrors).length > 0) {
    errors.itemErrors = itemErrors
  }

  return errors
}

// ==========================================
// Saved Companies Registry
// ==========================================

export function loadSavedCompanies(): SavedCompany[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(COMPANIES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSavedCompanies(companies: SavedCompany[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies))
}

export function addSavedCompany(company: Omit<SavedCompany, "id">): SavedCompany[] {
  const companies = loadSavedCompanies()
  const newCompany: SavedCompany = { ...company, id: generateId() }
  companies.push(newCompany)
  saveSavedCompanies(companies)
  return companies
}

export function updateSavedCompany(company: SavedCompany): SavedCompany[] {
  const companies = loadSavedCompanies()
  const idx = companies.findIndex((c) => c.id === company.id)
  if (idx >= 0) companies[idx] = company
  saveSavedCompanies(companies)
  return companies
}

export function deleteSavedCompany(id: string): SavedCompany[] {
  const companies = loadSavedCompanies().filter((c) => c.id !== id)
  saveSavedCompanies(companies)
  return companies
}

export function savedCompanyToCompanyData(sc: SavedCompany): CompanyData {
  return {
    name: sc.name,
    nif: sc.nif,
    address: sc.address,
    phone: sc.phone,
    email: sc.email,
    iban: sc.iban,
    logo: sc.logo,
    primaryColor: sc.primaryColor,
  }
}

// ==========================================
// Saved Clients Registry
// ==========================================

export function loadSavedClients(): SavedClient[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(CLIENTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSavedClients(clients: SavedClient[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
}

export function addSavedClient(client: Omit<SavedClient, "id">): SavedClient[] {
  const clients = loadSavedClients()
  const newClient: SavedClient = { ...client, id: generateId() }
  clients.push(newClient)
  saveSavedClients(clients)
  return clients
}

export function updateSavedClient(client: SavedClient): SavedClient[] {
  const clients = loadSavedClients()
  const idx = clients.findIndex((c) => c.id === client.id)
  if (idx >= 0) clients[idx] = client
  saveSavedClients(clients)
  return clients
}

export function deleteSavedClient(id: string): SavedClient[] {
  const clients = loadSavedClients().filter((c) => c.id !== id)
  saveSavedClients(clients)
  return clients
}

export function savedClientToClientData(sc: SavedClient): import("./types").ClientData {
  return {
    name: sc.name,
    nif: sc.nif,
    address: sc.address,
    phone: sc.phone,
    email: sc.email,
    workAddress: "",
  }
}

// ==========================================
// Notes Templates Registry
// ==========================================

export function loadTemplates(): NotesTemplate[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(TEMPLATES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTemplates(templates: NotesTemplate[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

export function addTemplate(template: Omit<NotesTemplate, "id" | "createdAt" | "updatedAt">): NotesTemplate[] {
  const templates = loadTemplates()
  const now = new Date().toISOString()
  const newTemplate: NotesTemplate = {
    ...template,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  templates.push(newTemplate)
  saveTemplates(templates)
  return templates
}

export function updateTemplate(template: NotesTemplate): NotesTemplate[] {
  const templates = loadTemplates()
  const idx = templates.findIndex((t) => t.id === template.id)
  if (idx >= 0) {
    templates[idx] = { ...template, updatedAt: new Date().toISOString() }
  }
  saveTemplates(templates)
  return templates
}

export function deleteTemplate(id: string): NotesTemplate[] {
  const templates = loadTemplates().filter((t) => t.id !== id)
  saveTemplates(templates)
  return templates
}

// ==========================================
// Service Templates Registry
// ==========================================

export function loadServiceTemplates(): ServiceTemplate[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(SERVICE_TEMPLATES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveServiceTemplates(templates: ServiceTemplate[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SERVICE_TEMPLATES_KEY, JSON.stringify(templates))
}

export function addServiceTemplate(template: Omit<ServiceTemplate, "id" | "createdAt" | "updatedAt">): ServiceTemplate[] {
  const templates = loadServiceTemplates()
  const now = new Date().toISOString()
  const newTemplate: ServiceTemplate = {
    ...template,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  templates.push(newTemplate)
  saveServiceTemplates(templates)
  return templates
}

export function updateServiceTemplate(template: ServiceTemplate): ServiceTemplate[] {
  const templates = loadServiceTemplates()
  const idx = templates.findIndex((t) => t.id === template.id)
  if (idx >= 0) {
    templates[idx] = { ...template, updatedAt: new Date().toISOString() }
  }
  saveServiceTemplates(templates)
  return templates
}

export function deleteServiceTemplate(id: string): ServiceTemplate[] {
  const templates = loadServiceTemplates().filter((t) => t.id !== id)
  saveServiceTemplates(templates)
  return templates
}

export function serviceTemplateToItem(template: ServiceTemplate): QuoteItem {
  return {
    id: generateId(),
    serviceName: template.name,
    description: template.description,
    quantity: 1,
    unit: template.unit,
    unitPrice: template.unitPrice,
    vatPercentage: template.vatPercentage,
  }
}
