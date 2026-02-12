import {
  convertToModelMessages,
  streamText,
  tool,
  UIMessage,
  stepCountIs,
} from "ai"
import { z } from "zod"
import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt"

export const maxDuration = 60

const tools = {
  setHeaderField: tool({
    description:
      "Set a single header field on the quote. Use this for all Kopfdaten fields like unternehmensname, angebotstitel, sprache, angebotImMandant, kostenstelle, etc.",
    inputSchema: z.object({
      field: z
        .enum([
          "eingereichtVon",
          "eingereichtAm",
          "unternehmensname",
          "verkaufAnCrmLink",
          "debitornrIna",
          "sprache",
          "projektnr",
          "projektart",
          "kostenstelle",
          "kostentraeger",
          "projektverantwortlicher",
          "angebotImMandant",
          "ansprechpartnerKunde",
          "angebotGueltigBis",
          "registerkarteDlEinheit",
          "lizenzart",
          "lizenzabrechnung",
          "angebotstitel",
        ])
        .describe("The header field name to set"),
      value: z.string().describe("The value to set for the field"),
    }),
    execute: async ({ field, value }) => {
      return { success: true, field, value }
    },
  }),

  addLicensePosition: tool({
    description:
      "Add a license position to the quote. Categories: D365 Business Central, Power BI / Data Analytics, M365 / Power Platform, DCP. Products: Essentials, Premium, Team Member, Device, External Accountant, Power BI Pro, Power BI Premium, Power Apps, Power Automate, etc.",
    inputSchema: z.object({
      category: z.string().describe("License category, e.g. 'D365 Business Central'"),
      product: z.string().describe("Product name, e.g. 'Essentials', 'Premium', 'Team Member'"),
      quantity: z.number().describe("Number of licenses"),
      unitPrice: z.number().describe("Price per unit per month in EUR"),
      discount: z.number().default(0).describe("Discount percentage (0-100)"),
      optional: z.boolean().default(false).describe("Whether this is an optional position"),
    }),
    execute: async ({ category, product, quantity, unitPrice, discount, optional }) => {
      const total = quantity * unitPrice * (1 - discount / 100)
      return { success: true, position: { category, product, quantity, unitPrice, discount, total, optional } }
    },
  }),

  addServicePosition: tool({
    description:
      "Add a service/DL position. Categories: ERP EasyStarter, DL ERP, Projektkoordination, DL Data Analytics, DL AI, CRM Packages, DL CRM. Standard rate: 400 EUR/day or 50 EUR/hour.",
    inputSchema: z.object({
      category: z.string().describe("Service category"),
      description: z.string().describe("Service description"),
      unit: z.enum(["LT", "STD"]).default("LT").describe("LT=Leistungstage, STD=Stunden"),
      quantity: z.number().describe("Number of days or hours"),
      rate: z.number().default(400).describe("Rate per unit (default 400 EUR/day)"),
      discount: z.number().default(0).describe("Discount percentage"),
      optional: z.boolean().default(false).describe("Whether optional"),
    }),
    execute: async ({ category, description, unit, quantity, rate, discount, optional }) => {
      const total = quantity * rate * (1 - discount / 100)
      return { success: true, position: { category, description, unit, quantity, rate, discount, total, optional } }
    },
  }),

  addSolutionPosition: tool({
    description:
      "Add a NAVAX Solution position. Price categories: 1=540 EUR, 2=1530 EUR, 3=2680 EUR, 4=auf Anfrage. Common solutions: Trade365 (cat 3), Intercompany Solution (cat 2), Job-Costing (cat 2), etc.",
    inputSchema: z.object({
      name: z.string().describe("Solution name, e.g. 'Trade365'"),
      priceCategory: z.number().min(1).max(4).describe("Price category 1-4"),
      additionalDl: z.number().default(0).describe("Additional consulting days"),
    }),
    execute: async ({ name, priceCategory, additionalDl }) => {
      const priceMap: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
      const flatRate = priceMap[priceCategory] || 0
      return { success: true, position: { name, priceCategory, flatRate, additionalDl } }
    },
  }),

  addCustomerServicePosition: tool({
    description:
      "Add a NAVAX Customer Service package. Packages: Essential (350 EUR/month), Premium (inkl. Managed Service 8h/month).",
    inputSchema: z.object({
      packageName: z.string().describe("Package name"),
      description: z.string().describe("Package description"),
      monthlyFee: z.number().describe("Monthly fee in EUR"),
      quantity: z.number().default(1).describe("Quantity"),
    }),
    execute: async ({ packageName, description, monthlyFee, quantity }) => {
      return { success: true, position: { package: packageName, description, monthlyFee, quantity } }
    },
  }),

  setLegalTerms: tool({
    description: "Set legal and commercial terms for the quote.",
    inputSchema: z.object({
      nachlassLizenzenMs: z.number().default(0).describe("Discount on MS licenses (%)"),
      nachlassLizenzenNavax: z.number().default(0).describe("Discount on NAVAX licenses (%)"),
      nachlassDl: z.number().default(0).describe("Discount on services (%)"),
      zahlungsfrist: z.string().default("30 Tage").describe("Payment term"),
    }),
    execute: async (args) => {
      return { success: true, ...args }
    },
  }),

  generateExcel: tool({
    description:
      "Trigger the Excel file generation and download. Call this when the user says 'generieren', 'fertig', 'Excel erstellen', or when all required fields are collected and the user confirms. This signals the frontend to automatically start the Excel download.",
    inputSchema: z.object({
      summary: z.string().describe("A short summary of the quote being generated, e.g. 'Angebot fuer Alpentech Solutions - D365 BC Einfuehrung'"),
    }),
    execute: async ({ summary }) => {
      return { success: true, action: "generateExcel", summary }
    },
  }),
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
      model: "google/gemini-2.5-flash",
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(10),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    return Response.json(
      { error: "AI-Fehler", details: String(error) },
      { status: 500 }
    )
  }
}
