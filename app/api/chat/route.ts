import {
  convertToModelMessages,
  streamText,
  tool,
  validateUIMessages,
  stepCountIs,
} from "ai"
import { z } from "zod"
import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt"

export const maxDuration = 60

const tools = {
  setHeaderField: tool({
    description:
      "Setzt ein Kopfdatenfeld der Angebotskalkulation. Verwende dieses Tool fuer jedes einzelne Feld das du setzen moechtest.",
    inputSchema: z.object({
      field: z
        .enum([
          "unternehmensname",
          "sprache",
          "angebotImMandant",
          "registerkarteDlEinheit",
          "lizenzart",
          "lizenzabrechnung",
          "angebotstitel",
          "kostenstelle",
          "kostentraeger",
          "projektverantwortlicher",
          "projektnr",
          "projektart",
          "ansprechpartnerKunde",
          "angebotGueltigBis",
          "verkaufAnCrmLink",
          "debitornrIna",
          "eingereichtVon",
          "eingereichtAm",
        ])
        .describe("Name des Feldes"),
      value: z.string().describe("Wert des Feldes"),
    }),
    execute: async ({ field, value }) => {
      return { success: true, field, value, message: `Feld "${field}" auf "${value}" gesetzt.` }
    },
  }),

  addLicensePosition: tool({
    description: "Fuegt eine Lizenzposition zum Angebot hinzu.",
    inputSchema: z.object({
      category: z
        .string()
        .describe("Kategorie: z.B. 'D365 Business Central', 'BC Apps', 'D365 CX', 'Power BI', 'M365', 'DCP'"),
      product: z.string().describe("Produktname, z.B. 'Essentials', 'Premium', 'Team Member'"),
      quantity: z.number().describe("Anzahl/Stueck"),
      unitPrice: z.number().describe("Einzelpreis in EUR"),
      discount: z.number().default(0).describe("Rabatt in Prozent"),
      optional: z.boolean().default(false).describe("Ob die Position optional ist"),
    }),
    execute: async ({ category, product, quantity, unitPrice, discount, optional }) => {
      const total = quantity * unitPrice * (1 - discount / 100)
      return {
        success: true,
        position: { category, product, quantity, unitPrice, discount, total, optional },
        message: `Lizenz hinzugefuegt: ${quantity}x ${product} (${category}) = ${total.toFixed(2)} EUR`,
      }
    },
  }),

  addServicePosition: tool({
    description: "Fuegt eine Dienstleistungsposition zum Angebot hinzu.",
    inputSchema: z.object({
      category: z
        .string()
        .describe(
          "Kategorie: z.B. 'ERP EasyStarter', 'NAVAX Packages ERP', 'DL ERP', 'DL Data Analytics', 'DL AI', 'CRM Packages', 'DL CRM', 'Projektkoordination', 'Managed Services'"
        ),
      description: z.string().describe("Beschreibung der Dienstleistung"),
      unit: z.enum(["LT", "STD"]).describe("Einheit: LT (Leistungstage) oder STD (Stunden)"),
      quantity: z.number().describe("Anzahl Tage/Stunden"),
      rate: z.number().describe("Tagessatz/Stundensatz in EUR"),
      discount: z.number().default(0).describe("Rabatt in Prozent"),
      optional: z.boolean().default(false).describe("Ob die Position optional ist"),
    }),
    execute: async ({ category, description, unit, quantity, rate, discount, optional }) => {
      const total = quantity * rate * (1 - discount / 100)
      return {
        success: true,
        position: { category, description, unit, quantity, rate, discount, total, optional },
        message: `DL hinzugefuegt: ${description} - ${quantity} ${unit} x ${rate} EUR = ${total.toFixed(2)} EUR`,
      }
    },
  }),

  addSolutionPosition: tool({
    description: "Fuegt eine NAVAX Solution zum Angebot hinzu.",
    inputSchema: z.object({
      name: z.string().describe("Name der NAVAX Solution"),
      priceCategory: z.number().min(1).max(4).describe("Preiskategorie 1-4 (1=540, 2=1530, 3=2680, 4=auf Anfrage)"),
      additionalDl: z.number().default(0).describe("Zusaetzliche DL-Tage"),
    }),
    execute: async ({ name, priceCategory, additionalDl }) => {
      const prices: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
      const flatRate = prices[priceCategory] || 0
      return {
        success: true,
        position: { name, priceCategory, flatRate, additionalDl },
        message: `NX Solution hinzugefuegt: ${name} (Kat. ${priceCategory}) = ${flatRate > 0 ? flatRate + " EUR" : "auf Anfrage"}`,
      }
    },
  }),

  addCustomerServicePosition: tool({
    description: "Fuegt eine NAVAX Customer Service Position hinzu.",
    inputSchema: z.object({
      package: z
        .string()
        .describe("Paket: 'Essential', 'Premium', oder Zusatzservice"),
      description: z.string().describe("Beschreibung"),
      monthlyFee: z.number().describe("Monatliche Gebuehr in EUR"),
      quantity: z.number().default(1).describe("Anzahl"),
    }),
    execute: async ({ package: pkg, description, monthlyFee, quantity }) => {
      return {
        success: true,
        position: { package: pkg, description, monthlyFee, quantity },
        message: `CSV hinzugefuegt: ${pkg} - ${description} = ${monthlyFee * quantity} EUR/Monat`,
      }
    },
  }),

  setLegalTerms: tool({
    description: "Setzt die kommerziellen Bedingungen (Legal Terms).",
    inputSchema: z.object({
      nachlassLizenzenMs: z.number().default(0).describe("Nachlass MS-Lizenzen in %"),
      nachlassLizenzenNavax: z.number().default(0).describe("Nachlass NAVAX-Lizenzen in %"),
      nachlassDl: z.number().default(0).describe("Nachlass DL in %"),
      zahlungsfrist: z.string().default("30 Tage").describe("Zahlungsfrist"),
    }),
    execute: async (terms) => {
      return { success: true, terms, message: "Kommerzielle Bedingungen gesetzt." }
    },
  }),

  getQuoteSummary: tool({
    description:
      "Zeigt eine Zusammenfassung des aktuellen Angebotsstands. Verwende dieses Tool wenn der Nutzer den aktuellen Stand wissen moechte.",
    inputSchema: z.object({}),
    execute: async () => {
      return {
        success: true,
        message: "Zusammenfassung wird angezeigt.",
      }
    },
  }),

  generateExcel: tool({
    description:
      "Generiert die finale Excel-Datei. Rufe dieses Tool auf wenn alle noetigen Daten gesammelt sind und der Nutzer bereit ist.",
    inputSchema: z.object({
      confirmGeneration: z
        .boolean()
        .describe("Bestaetigung dass die Excel generiert werden soll"),
    }),
    execute: async ({ confirmGeneration }) => {
      if (!confirmGeneration) {
        return { success: false, message: "Generierung nicht bestaetigt." }
      }
      return {
        success: true,
        message: "Excel-Generierung wird gestartet...",
        action: "GENERATE_EXCEL",
      }
    },
  }),
} as const

export async function POST(req: Request) {
  const body = await req.json()

  console.log("[v0] Chat API received body keys:", Object.keys(body))

  const rawMessages = body.messages
  const quoteState = body.quoteState

  if (!rawMessages || !Array.isArray(rawMessages)) {
    return new Response("Missing messages", { status: 400 })
  }

  const messages = await validateUIMessages({
    messages: rawMessages,
    tools,
  })

  const contextPrompt = quoteState
    ? `\n\n## AKTUELLER ANGEBOTSSTAND\n${JSON.stringify(quoteState, null, 2)}`
    : ""

  console.log("[v0] Streaming with", messages.length, "messages")

  const result = streamText({
    model: "openai/gpt-4o",
    system: SYSTEM_PROMPT + contextPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
