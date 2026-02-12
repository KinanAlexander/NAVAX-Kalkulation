export interface HeaderFields {
  eingereichtVon: string
  eingereichtAm: string
  unternehmensname: string
  verkaufAnCrmLink: string
  debitornrIna: string
  sprache: "DE" | "EN"
  projektnr: string
  projektart: string
  kostenstelle: string
  kostentraeger: string
  projektverantwortlicher: string
  angebotImMandant: string
  ansprechpartnerKunde: string
  angebotGueltigBis: string
  registerkarteDlEinheit: string
  lizenzart: string
  lizenzabrechnung: string
  angebotstitel: string
}

export interface LicensePosition {
  id: string
  category: string
  product: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  optional: boolean
  articleNr: string
}

export interface ServicePosition {
  id: string
  category: string
  description: string
  unit: "LT" | "STD"
  quantity: number
  rate: number
  discount: number
  total: number
  optional: boolean
}

export interface SolutionPosition {
  id: string
  name: string
  priceCategory: 1 | 2 | 3 | 4
  flatRate: number
  additionalDl: number
  articleNr: string
}

export interface CustomerServicePosition {
  id: string
  package: string
  description: string
  monthlyFee: number
  quantity: number
}

export interface LegalTerms {
  nachlassLizenzenMs: number
  nachlassLizenzenNavax: number
  nachlassDl: number
  reisekosten: string
  zahlungsfrist: string
}

export interface TravelCosts {
  startort: string
  zielort: string
  kilometer: number
  kostenPkw: number
  reisezeiten: number
}

export interface QuoteState {
  id: string
  header: Partial<HeaderFields>
  licenses: LicensePosition[]
  services: ServicePosition[]
  solutions: SolutionPosition[]
  customerService: CustomerServicePosition[]
  legalTerms: Partial<LegalTerms>
  travelCosts: Partial<TravelCosts>
  status: "draft" | "generated" | "sent"
  createdAt: string
  updatedAt: string
  customerName: string
  title: string
}

export interface TemplateInfo {
  fileName: string
  uploadedAt: string
  sheetCount: number
  fieldCount: number
  fileData: string // base64
}

export interface SavedQuote {
  id: string
  customerName: string
  title: string
  status: "draft" | "generated" | "sent"
  createdAt: string
  updatedAt: string
  quoteState: QuoteState
  conversationMessages: Array<{ role: string; content: string }>
}

export const DROPDOWN_OPTIONS = {
  positionstyp: ["optional", "Dienstleistung", "Artikel"],
  preismodell: ["fix", "variabel", "pauschal"],
  produktlinie: ["10 - D365 BC", "20 - D365 FO", "50 - D365 CX", "60 - Data Analytics", "80 - AI"],
  angebotOption: ["ja", "nein"],
  dlEinheit: ["In LT anbieten", "In STD anbieten"],
  deployment: ["On Prem", "On Prem Subscription", "SaaS/Cloud"],
  lizenzabrechnung: ["jaehrlich", "monatlich", "quartalsweise"],
  firma: ["NAVAX Consulting (AT)", "NAVAX GmbH (DE)"],
  sprache: ["DE", "EN"],
  kostenstelle: ["1 - Graz", "2 - Linz", "4 - Wien"],
  kostentraeger: ["104 - Trade", "105 - Construction", "106 - Prof. Services", "107 - Manufacturing"],
} as const

export const PRICE_CATEGORIES: Record<number, number> = {
  1: 540,
  2: 1530,
  3: 2680,
  4: 0, // auf Anfrage
}

export const DL_RATES: Record<string, { hourly: number; daily: number }> = {
  "Consultant & Developer": { hourly: 50, daily: 400 },
  "Senior Consultant": { hourly: 50, daily: 400 },
  "Senior Developer": { hourly: 50, daily: 400 },
  "Lead Consultant": { hourly: 50, daily: 400 },
  "Industry Lead": { hourly: 50, daily: 400 },
  "Product Lead": { hourly: 50, daily: 400 },
  "AI Consulting": { hourly: 50, daily: 400 },
  "Projektkoordinator": { hourly: 50, daily: 400 },
  "Projektmanager": { hourly: 50, daily: 400 },
  "Licensing Consulting": { hourly: 50, daily: 400 },
  "Licensing Solution Architect": { hourly: 50, daily: 400 },
}
