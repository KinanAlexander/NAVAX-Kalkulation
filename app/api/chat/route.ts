import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
} from "ai"
import { z } from "zod"
import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt"

export const maxDuration = 60

const tools = {
  setHeaderField: tool({
    description:
      "Setzt ein Kopfdatenfeld der Angebotskalkulation. Verwende dieses Tool fuer jedes einzelne Feld.",
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
      console.log("[v0] setHeaderField:", field, "=", value)
      return { success: true, field, value, message: `Feld "${field}" auf "${value}" gesetzt.` }
    },
  }),

  addLicensePosition: tool({
    description: "Fuegt eine Lizenzposition zum Angebot hinzu.",
    inputSchema: z.object({
      category: z.string().describe("Kategorie z.B. 'D365 Business Central', 'BC Apps', 'D365 CX', 'Power BI', 'M365', 'DCP'"),
      product: z.string().describe("Produktname z.B. 'Essentials', 'Premium', 'Team Member'"),
      quantity: z.number().describe("Anzahl/Stueck"),
      unitPrice: z.number().describe("Einzelpreis in EUR"),
      discount: z.number().nullable().describe("Rabatt in Prozent"),
      optional: z.boolean().nullable().describe("Ob die Position optional ist"),
    }),
    execute: async ({ category, product, quantity, unitPrice, discount, optional }) => {
      const d = discount ?? 0
      const total = quantity * unitPrice * (1 - d / 100)
      console.log("[v0] addLicensePosition:", product, total)
      return {
        success: true,
        position: { category, product, quantity, unitPrice, discount: d, total, optional: optional ?? false },
        message: `Lizenz: ${quantity}x ${product} (${category}) = ${total.toFixed(2)} EUR`,
      }
    },
  }),

  addServicePosition: tool({
    description: "Fuegt eine Dienstleistungsposition zum Angebot hinzu.",
    inputSchema: z.object({
      category: z.string().describe("Kategorie z.B. 'ERP EasyStarter', 'NAVAX Packages ERP', 'DL ERP', 'DL Data Analytics', 'DL AI', 'CRM Packages', 'DL CRM', 'Projektkoordination', 'Managed Services'"),
      description: z.string().describe("Beschreibung der Dienstleistung"),
      unit: z.enum(["LT", "STD"]).describe("Einheit: LT (Leistungstage) oder STD (Stunden)"),
      quantity: z.number().describe("Anzahl Tage/Stunden"),
      rate: z.number().describe("Tagessatz/Stundensatz in EUR"),
      discount: z.number().nullable().describe("Rabatt in Prozent"),
      optional: z.boolean().nullable().describe("Ob die Position optional ist"),
    }),
    execute: async ({ category, description, unit, quantity, rate, discount, optional }) => {
      const d = discount ?? 0
      const total = quantity * rate * (1 - d / 100)
      console.log("[v0] addServicePosition:", description, total)
      return {
        success: true,
        position: { category, description, unit, quantity, rate, discount: d, total, optional: optional ?? false },
        message: `DL: ${description} - ${quantity} ${unit} x ${rate} EUR = ${total.toFixed(2)} EUR`,
      }
    },
  }),

  addSolutionPosition: tool({
    description: "Fuegt eine NAVAX Solution zum Angebot hinzu.",
    inputSchema: z.object({
      name: z.string().describe("Name der NAVAX Solution"),
      priceCategory: z.number().min(1).max(4).describe("Preiskategorie 1-4 (1=540, 2=1530, 3=2680, 4=auf Anfrage)"),
      additionalDl: z.number().nullable().describe("Zusaetzliche DL-Tage"),
    }),
    execute: async ({ name, priceCategory, additionalDl }) => {
      const prices: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
      const flatRate = prices[priceCategory] || 0
      console.log("[v0] addSolutionPosition:", name, flatRate)
      return {
        success: true,
        position: { name, priceCategory, flatRate, additionalDl: additionalDl ?? 0 },
        message: `NX Solution: ${name} (Kat. ${priceCategory}) = ${flatRate > 0 ? flatRate + " EUR" : "auf Anfrage"}`,
      }
    },
  }),

  addCustomerServicePosition: tool({
    description: "Fuegt eine NAVAX Customer Service Position hinzu.",
    inputSchema: z.object({
      packageName: z.string().describe("Paket: 'Essential', 'Premium', oder Zusatzservice"),
      description: z.string().describe("Beschreibung"),
      monthlyFee: z.number().describe("Monatliche Gebuehr in EUR"),
      quantity: z.number().nullable().describe("Anzahl"),
    }),
    execute: async ({ packageName, description, monthlyFee, quantity }) => {
      const q = quantity ?? 1
      console.log("[v0] addCustomerServicePosition:", packageName, monthlyFee * q)
      return {
        success: true,
        position: { package: packageName, description, monthlyFee, quantity: q },
        message: `CSV: ${packageName} - ${description} = ${monthlyFee * q} EUR/Monat`,
      }
    },
  }),

  setLegalTerms: tool({
    description: "Setzt die kommerziellen Bedingungen (Legal Terms).",
    inputSchema: z.object({
      nachlassLizenzenMs: z.number().nullable().describe("Nachlass MS-Lizenzen in %"),
      nachlassLizenzenNavax: z.number().nullable().describe("Nachlass NAVAX-Lizenzen in %"),
      nachlassDl: z.number().nullable().describe("Nachlass DL in %"),
      zahlungsfrist: z.string().nullable().describe("Zahlungsfrist"),
    }),
    execute: async (terms) => {
      console.log("[v0] setLegalTerms:", terms)
      return { success: true, terms, message: "Kommerzielle Bedingungen gesetzt." }
    },
  }),

  getQuoteSummary: tool({
    description: "Zeigt eine Zusammenfassung des aktuellen Angebotsstands.",
    inputSchema: z.object({}),
    execute: async () => {
      return { success: true, message: "Zusammenfassung wird angezeigt." }
    },
  }),

  generateExcel: tool({
    description: "Generiert die finale Excel-Datei wenn alle Daten gesammelt sind.",
    inputSchema: z.object({
      confirmGeneration: z.boolean().describe("Bestaetigung dass die Excel generiert werden soll"),
    }),
    execute: async ({ confirmGeneration }) => {
      if (!confirmGeneration) {
        return { success: false, message: "Generierung nicht bestaetigt." }
      }
      return { success: true, message: "Excel-Generierung wird gestartet...", action: "GENERATE_EXCEL" }
    },
  }),
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("[v0] Chat API body keys:", Object.keys(body))

    // Messages come from the prepareSendMessagesRequest wrapper
    const rawMessages = body.messages
    const quoteState = body.quoteState

    if (!rawMessages || !Array.isArray(rawMessages)) {
      console.log("[v0] ERROR: No messages array. Body:", JSON.stringify(body).slice(0, 500))
      return new Response(JSON.stringify({ error: "Missing messages" }), { status: 400 })
    }

    console.log("[v0] Processing", rawMessages.length, "messages")

    const modelMessages = await convertToModelMessages(rawMessages)

    console.log("[v0] Converted to", modelMessages.length, "model messages")

    const contextPrompt = quoteState
      ? `\n\n## AKTUELLER ANGEBOTSSTAND\n${JSON.stringify(quoteState, null, 2)}`
      : ""

    const result = streamText({
      model: "openai/gpt-4o",
      system: SYSTEM_PROMPT + contextPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(10),
      tools,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500 }
    )
  }
}
