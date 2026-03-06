import type {
  Quote,
  CompanyData,
  QuoteItem,
  SavedCompany,
  SavedClient,
  QuoteStatus,
  QuoteHistoryEntry,
  AppSettings,
  NotesTemplate,
  TemplateCategory,
  ServiceTemplate,
  ServiceCategory,
} from './types'
import { CURRENCY_OPTIONS } from './types'

const STORAGE_KEY = 'orcamentos-app-data'
const COMPANIES_KEY = 'orcamentos-saved-companies'
const CLIENTS_KEY = 'orcamentos-saved-clients'
const SETTINGS_KEY = 'orcamentos-app-settings'
const TEMPLATES_KEY = 'orcamentos-notes-templates'
const SERVICE_TEMPLATES_KEY = 'orcamentos-service-templates'

export function getDefaultSettings(): AppSettings {
  return {
    currency: 'EUR',
    currencyLocale: 'pt-PT',
    language: 'pt-PT',
    defaultVat: 23,
    quotePrefix: 'ORC',
    quoteValidity: 30,
    companyDefaultColor: '#1a56db',
    defaultTemplate: 'classico',
  }
}

import * as settingsApi from './settingsApi'

export async function loadSettings(): Promise<AppSettings> {
  if (typeof window === 'undefined') return getDefaultSettings()
  try {
    const res = await settingsApi.fetchSettings()
    if (!res) return getDefaultSettings()
    return { ...getDefaultSettings(), ...res }
  } catch (err) {
    console.warn('fetchSettings failed, using localStorage', err)
    try {
      const data = localStorage.getItem(SETTINGS_KEY)
      if (!data) return getDefaultSettings()
      return { ...getDefaultSettings(), ...JSON.parse(data) }
    } catch {
      return getDefaultSettings()
    }
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await settingsApi.saveSettings(settings)
  } catch (err) {
    console.warn('saveSettings API failed, storing locally', err)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }
}

export function generateId(): string {
  return crypto.randomUUID()
}

export async function generateQuoteNumber(existing: Quote[]): Promise<string> {
  const settings = await loadSettings()
  const year = new Date().getFullYear()
  const count = existing.length + 1
  return `${settings.quotePrefix}-${year}-${String(count).padStart(4, '0')}`
}

export function getDefaultCompany(): CompanyData {
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

export function createEmptyItem(): QuoteItem {
  return {
    id: generateId(),
    serviceName: '',
    description: '',
    quantity: 1,
    unit: 'un',
    unitPrice: 0,
    vatPercentage: 23,
  }
}

// synchronous helper for formatting that doesn't need network
function getSettingsSync(): AppSettings {
  if (typeof window === 'undefined') return getDefaultSettings()
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) {
      return { ...getDefaultSettings(), ...JSON.parse(data) }
    }
  } catch {
    // ignore
  }
  // fallback to defaults
  return getDefaultSettings()
}

export async function createEmptyQuote(existingQuotes: Quote[]): Promise<Quote> {
  const settings = await loadSettings()
  const now = new Date()
  const validUntil = new Date(now)
  validUntil.setDate(validUntil.getDate() + settings.quoteValidity)

  const savedCompany = getLastUsedCompany()

  return {
    id: generateId(),
    number: await generateQuoteNumber(existingQuotes),
    projectTitle: '',
    createdAt: now.toISOString().split('T')[0],
    validUntil: validUntil.toISOString().split('T')[0],
    notes: '',
    company: savedCompany || getDefaultCompany(),
    client: {
      name: '',
      nif: '',
      address: '',
      phone: '',
      email: '',
      workAddress: '',
    },
    items: [createEmptyItem()],
    updatedAt: now.toISOString(),
    status: 'rascunho' as QuoteStatus,
    history: [
      {
        id: generateId(),
        status: 'rascunho' as QuoteStatus,
        date: now.toISOString(),
        note: 'Orçamento criado',
      },
    ],
    templateId: settings.defaultTemplate || 'classico',
  }
}

export function addHistoryEntry(quote: Quote, status: QuoteStatus, note: string): Quote {
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
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    const quotes: Quote[] = JSON.parse(data)
    if (quotes.length === 0) return null
    const sorted = [...quotes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    return sorted[0].company
  } catch {
    return null
  }
}

// NOTE: quotes are now stored in Payload.  These helper functions
// proxy to the REST API via quotesApi.  LocalStorage is still kept as a
// fallback if the network call fails or for server components.
import * as quotesApi from './quotesApi'

export async function loadQuotes(): Promise<Quote[]> {
  if (typeof window === 'undefined') return []
  try {
    return await quotesApi.fetchQuotes()
  } catch (err) {
    console.warn('fetchQuotes failed, falling back to localStorage', err)
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }
}

export function saveQuotes(quotes: Quote[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))
}

export async function saveQuote(quote: Quote): Promise<Quote[]> {
  // upsert via API: if id exists update, else create
  // if (quote.id && quote.createdAt) {
  //   await quotesApi.updateQuote(quote.id, quote as any)
  // } else {
  const created = await quotesApi.createQuote(quote as any)
  quote = created
  // }
  // refresh local cache
  try {
    return await quotesApi.fetchQuotes()
  } catch {
    return loadQuotes() // fallback
  }
}

export async function deleteQuote(id: string): Promise<Quote[]> {
  try {
    await quotesApi.deleteQuote(id)
  } catch {
    console.warn('deleteQuote API failed, removing locally')
  }
  try {
    return await quotesApi.fetchQuotes()
  } catch {
    return (await loadQuotes()).filter((q) => q.id !== id)
  }
}

export async function duplicateQuote(id: string): Promise<Quote[]> {
  const quotes = await loadQuotes()
  const original = quotes.find((q) => q.id === id)
  if (!original) return quotes
  const now = new Date()
  const duplicate: Quote = {
    ...JSON.parse(JSON.stringify(original)),
    id: generateId(),
    number: await generateQuoteNumber(quotes),
    createdAt: now.toISOString().split('T')[0],
    updatedAt: now.toISOString(),
    items: original.items.map((item) => ({ ...item, id: generateId() })),
    status: 'rascunho' as QuoteStatus,
    history: [
      {
        id: generateId(),
        status: 'rascunho' as QuoteStatus,
        date: now.toISOString(),
        note: 'Duplicado de ' + original.number,
      },
    ],
    templateId: original.templateId || 'classico',
  }
  // attempt to persist duplicate
  try {
    await saveQuote(duplicate)
  } catch {
    // ignore
  }
  // refresh list
  return await loadQuotes()
}

export function calculateItemTotal(item: QuoteItem): number {
  return item.quantity * item.unitPrice
}

export function calculateSubtotal(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
}

export function calculateTotalVat(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item) * (item.vatPercentage / 100), 0)
}

export function calculateGrandTotal(items: QuoteItem[]): number {
  return calculateSubtotal(items) + calculateTotalVat(items)
}

export function formatCurrency(value: number): string {
  const settings = getSettingsSync()
  const currencyOpt = CURRENCY_OPTIONS.find((c) => c.value === settings.currency)
  return new Intl.NumberFormat(currencyOpt?.locale || settings.currencyLocale, {
    style: 'currency',
    currency: settings.currency,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const settings = getSettingsSync()
  try {
    return new Intl.DateTimeFormat(settings.currencyLocale || 'pt-PT').format(new Date(dateStr))
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

  // Validate client
  if (quote.clientType === 'existing') {
    if (!quote.client?.name?.trim()) {
      errors.clientName = 'Cliente é obrigatório'
    }
  } else {
    if (!quote.manualClient?.trim()) {
      errors.clientName = 'Nome do cliente é obrigatório'
    }
  }

  if (quote.items.length === 0) {
    errors.items = 'Adicione pelo menos 1 item'
  }

  const itemErrors: ValidationErrors['itemErrors'] = {}
  quote.items.forEach((item) => {
    const errs: { quantity?: string; price?: string; name?: string } = {}
    if (!item.serviceName.trim()) errs.name = 'Nome obrigatório'
    if (item.quantity <= 0) errs.quantity = 'Qtd > 0'
    if (item.unitPrice < 0) errs.price = 'Preço >= 0'
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
// these routines now talk to the backend API, with a localStorage
// fallback for resilience or server components.
import * as companiesApi from './companiesApi'

export async function loadSavedCompanies(): Promise<SavedCompany[]> {
  if (typeof window === 'undefined') return []
  try {
    return await companiesApi.fetchCompanies()
  } catch (err) {
    console.warn('fetchCompanies failed, falling back to localStorage', err)
    try {
      const data = localStorage.getItem(COMPANIES_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }
}

export function saveSavedCompanies(companies: SavedCompany[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies))
}

export async function addSavedCompany(company: Omit<SavedCompany, 'id'>): Promise<SavedCompany[]> {
  try {
    await companiesApi.createCompany(company)
  } catch (err) {
    console.warn('createCompany API failed, saving locally', err)
    const companies = await loadSavedCompanies()
    const newCompany: SavedCompany = { ...company, id: generateId() }
    companies.push(newCompany)
    saveSavedCompanies(companies)
    return companies
  }
  // refresh cache after successful API call
  try {
    return await companiesApi.fetchCompanies()
  } catch {
    return await loadSavedCompanies()
  }
}

export async function updateSavedCompany(company: SavedCompany): Promise<SavedCompany[]> {
  try {
    await companiesApi.updateCompany(company.id, company as any)
  } catch (err) {
    console.warn('updateCompany API failed, updating locally', err)
    const companies = await loadSavedCompanies()
    const idx = companies.findIndex((c) => c.id === company.id)
    if (idx >= 0) companies[idx] = company
    saveSavedCompanies(companies)
    return companies
  }
  try {
    return await companiesApi.fetchCompanies()
  } catch {
    return await loadSavedCompanies()
  }
}

export async function deleteSavedCompany(id: string): Promise<SavedCompany[]> {
  try {
    await companiesApi.deleteCompany(id)
  } catch (err) {
    console.warn('deleteCompany API failed, removing locally', err)
  }
  try {
    return await companiesApi.fetchCompanies()
  } catch {
    return (await loadSavedCompanies()).filter((c) => c.id !== id)
  }
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
import * as clientsApi from './clientsApi'

export async function loadSavedClients(): Promise<SavedClient[]> {
  if (typeof window === 'undefined') return []
  try {
    return await clientsApi.fetchClients()
  } catch (err) {
    console.warn('fetchClients failed, falling back to localStorage', err)
    try {
      const data = localStorage.getItem(CLIENTS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }
}

export function saveSavedClients(clients: SavedClient[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
}

export async function addSavedClient(client: Omit<SavedClient, 'id'>): Promise<SavedClient[]> {
  try {
    await clientsApi.createClient(client)
  } catch (err) {
    console.warn('createClient API failed, saving locally', err)
    const clients = await loadSavedClients()
    const newClient: SavedClient = { ...client, id: generateId() }
    clients.push(newClient)
    saveSavedClients(clients)
    return clients
  }
  try {
    return await clientsApi.fetchClients()
  } catch {
    return await loadSavedClients()
  }
}

export async function updateSavedClient(client: SavedClient): Promise<SavedClient[]> {
  try {
    await clientsApi.updateClient(client.id, client as any)
  } catch (err) {
    console.warn('updateClient API failed, updating locally', err)
    const clients = await loadSavedClients()
    const idx = clients.findIndex((c) => c.id === client.id)
    if (idx >= 0) clients[idx] = client
    saveSavedClients(clients)
    return clients
  }
  try {
    return await clientsApi.fetchClients()
  } catch {
    return await loadSavedClients()
  }
}

export async function deleteSavedClient(id: string): Promise<SavedClient[]> {
  try {
    await clientsApi.deleteClient(id)
  } catch (err) {
    console.warn('deleteClient API failed, removing locally', err)
  }
  try {
    return await clientsApi.fetchClients()
  } catch {
    return (await loadSavedClients()).filter((c) => c.id !== id)
  }
}

export function savedClientToClientData(sc: SavedClient): import('./types').ClientData {
  return {
    name: sc.name,
    nif: sc.nif,
    address: sc.address,
    phone: sc.phone,
    email: sc.email,
    workAddress: '',
  }
}

// ==========================================
// Notes Templates Registry
// ==========================================
import * as templatesApi from './templatesApi'

export async function loadTemplates(): Promise<NotesTemplate[]> {
  if (typeof window === 'undefined') return []
  try {
    return await templatesApi.fetchTemplates()
  } catch (err) {
    console.warn('fetchTemplates failed, falling back to localStorage', err)
    try {
      const data = localStorage.getItem(TEMPLATES_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }
}

export function saveTemplates(templates: NotesTemplate[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

export async function addTemplate(
  template: Omit<NotesTemplate, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<NotesTemplate[]> {
  try {
    await templatesApi.createTemplate(template as any)
  } catch (err) {
    console.warn('createTemplate API failed, saving locally', err)
    const templates = await loadTemplates()
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
  try {
    return await templatesApi.fetchTemplates()
  } catch {
    return await loadTemplates()
  }
}

export async function updateTemplate(template: NotesTemplate): Promise<NotesTemplate[]> {
  try {
    await templatesApi.updateTemplate(template.id, template as any)
  } catch (err) {
    console.warn('updateTemplate API failed, updating locally', err)
    const templates = await loadTemplates()
    const idx = templates.findIndex((t) => t.id === template.id)
    if (idx >= 0) {
      templates[idx] = { ...template, updatedAt: new Date().toISOString() }
    }
    saveTemplates(templates)
    return templates
  }
  try {
    return await templatesApi.fetchTemplates()
  } catch {
    return await loadTemplates()
  }
}

export async function deleteTemplate(id: string): Promise<NotesTemplate[]> {
  try {
    await templatesApi.deleteTemplate(id)
  } catch (err) {
    console.warn('deleteTemplate API failed, removing locally', err)
  }
  try {
    return await templatesApi.fetchTemplates()
  } catch {
    return (await loadTemplates()).filter((t) => t.id !== id)
  }
}

// ==========================================
// Service Templates Registry
// ==========================================
import * as serviceTemplatesApi from './serviceTemplatesApi'

export async function loadServiceTemplates(): Promise<ServiceTemplate[]> {
  if (typeof window === 'undefined') return []
  try {
    return await serviceTemplatesApi.fetchServiceTemplates()
  } catch (err) {
    console.warn('fetchServiceTemplates failed, falling back to localStorage', err)
    try {
      const data = localStorage.getItem(SERVICE_TEMPLATES_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }
}

export function saveServiceTemplates(templates: ServiceTemplate[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SERVICE_TEMPLATES_KEY, JSON.stringify(templates))
}

export async function addServiceTemplate(
  template: Omit<ServiceTemplate, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ServiceTemplate[]> {
  try {
    await serviceTemplatesApi.createServiceTemplate(template as any)
  } catch (err) {
    console.warn('createServiceTemplate API failed, saving locally', err)
    const templates = await loadServiceTemplates()
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
  try {
    return await serviceTemplatesApi.fetchServiceTemplates()
  } catch {
    return await loadServiceTemplates()
  }
}

export async function updateServiceTemplate(template: ServiceTemplate): Promise<ServiceTemplate[]> {
  try {
    await serviceTemplatesApi.updateServiceTemplate(template.id, template as any)
  } catch (err) {
    console.warn('updateServiceTemplate API failed, updating locally', err)
    const templates = await loadServiceTemplates()
    const idx = templates.findIndex((t) => t.id === template.id)
    if (idx >= 0) {
      templates[idx] = { ...template, updatedAt: new Date().toISOString() }
    }
    saveServiceTemplates(templates)
    return templates
  }
  try {
    return await serviceTemplatesApi.fetchServiceTemplates()
  } catch {
    return await loadServiceTemplates()
  }
}

export async function deleteServiceTemplate(id: string): Promise<ServiceTemplate[]> {
  try {
    await serviceTemplatesApi.deleteServiceTemplate(id)
  } catch (err) {
    console.warn('deleteServiceTemplate API failed, removing locally', err)
  }
  try {
    return await serviceTemplatesApi.fetchServiceTemplates()
  } catch {
    return (await loadServiceTemplates()).filter((t) => t.id !== id)
  }
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
