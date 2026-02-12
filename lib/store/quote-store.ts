import type { QuoteState, SavedQuote, TemplateInfo } from "./types"

const TEMPLATE_KEY = "navax-template"
const QUOTES_KEY = "navax-quotes"

function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function createEmptyQuoteState(): QuoteState {
  return {
    id: generateId(),
    header: {},
    licenses: [],
    services: [],
    solutions: [],
    customerService: [],
    legalTerms: {},
    travelCosts: {},
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerName: "",
    title: "",
  }
}

// Template storage
export function saveTemplate(template: TemplateInfo): void {
  if (typeof window === "undefined") return
  const { fileData, ...meta } = template
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(meta))
  // Store file data separately for large files
  localStorage.setItem(`${TEMPLATE_KEY}-data`, fileData)
}

export function getTemplate(): TemplateInfo | null {
  if (typeof window === "undefined") return null
  const meta = localStorage.getItem(TEMPLATE_KEY)
  const fileData = localStorage.getItem(`${TEMPLATE_KEY}-data`)
  if (!meta || !fileData) return null
  return { ...JSON.parse(meta), fileData }
}

export function getTemplateMeta(): Omit<TemplateInfo, "fileData"> | null {
  if (typeof window === "undefined") return null
  const meta = localStorage.getItem(TEMPLATE_KEY)
  if (!meta) return null
  return JSON.parse(meta)
}

export function removeTemplate(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TEMPLATE_KEY)
  localStorage.removeItem(`${TEMPLATE_KEY}-data`)
}

// Quote storage
export function saveQuote(quote: SavedQuote): void {
  if (typeof window === "undefined") return
  const quotes = getAllQuotes()
  const idx = quotes.findIndex((q) => q.id === quote.id)
  if (idx >= 0) {
    quotes[idx] = quote
  } else {
    quotes.unshift(quote)
  }
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes))
}

export function getAllQuotes(): SavedQuote[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(QUOTES_KEY)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function getQuoteById(id: string): SavedQuote | null {
  const quotes = getAllQuotes()
  return quotes.find((q) => q.id === id) ?? null
}

export function deleteQuote(id: string): void {
  if (typeof window === "undefined") return
  const quotes = getAllQuotes().filter((q) => q.id !== id)
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes))
}
