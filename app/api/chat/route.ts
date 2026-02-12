import type { QuoteState, LicensePosition, ServicePosition, SolutionPosition } from "@/lib/store/types"

export const maxDuration = 30

interface ParsedInfo {
  headerFields: Record<string, string>
  licenses: Array<{ category: string; product: string; quantity: number; unitPrice: number; discount: number }>
  services: Array<{ category: string; description: string; unit: string; quantity: number; rate: number; discount: number }>
  solutions: Array<{ name: string; priceCategory: number }>
}

function parseLatestMessage(text: string): ParsedInfo {
  const lower = text.toLowerCase()
  const info: ParsedInfo = {
    headerFields: {},
    licenses: [],
    services: [],
    solutions: [],
  }

  // --- Header fields ---
  // Company name - flexible patterns
  const companyPatterns = [
    /(?:firma|unternehmen|kunde|kundenname|company)[:\s]+["']?([a-zäöüßA-ZÄÖÜ\s&.\-]+?)["']?(?:\s*[,.\n]|$)/i,
    /(?:fuer|für)\s+(?:die\s+)?(?:firma\s+)?["']?([a-zäöüßA-ZÄÖÜ\s&.\-]{3,40}?)["']?\s+(?:moechte|möchte|braucht|will|in\s)/i,
  ]
  for (const p of companyPatterns) {
    const m = text.match(p)
    if (m?.[1] && m[1].trim().length >= 2) {
      info.headerFields.unternehmensname = m[1].trim()
      break
    }
  }

  // Titel
  const titleMatch = text.match(/(?:titel|angebotstitel|betreff|projekt)[:\s]+["']?([^"'\n,]{5,80})["']?/i)
  if (titleMatch?.[1]) info.headerFields.angebotstitel = titleMatch[1].trim()

  // Verantwortlicher
  const respMatch = text.match(/(?:verantwortlich|projektverantwortlich|mein name|ich bin|ich heisse|ich heiße)[:\s]+["']?([a-zäöüßA-ZÄÖÜ\s.\-]{3,40})["']?/i)
  if (respMatch?.[1]) info.headerFields.projektverantwortlicher = respMatch[1].trim()

  // Kostenstelle
  if (lower.includes("graz")) info.headerFields.kostenstelle = "1 - Graz"
  else if (lower.includes("linz")) info.headerFields.kostenstelle = "2 - Linz"
  else if (lower.includes("wien") || lower.includes("vienna")) info.headerFields.kostenstelle = "4 - Wien"

  // Mandant - derive from Kostenstelle or explicit
  if (lower.includes("deutschland") || lower.includes("navax gmbh") || lower.includes("(de)"))
    info.headerFields.angebotImMandant = "NAVAX GmbH (DE)"
  else if (lower.includes("oesterreich") || lower.includes("österreich") || lower.includes("navax consulting") || lower.includes("(at)") || lower.includes("wien") || lower.includes("graz") || lower.includes("linz"))
    info.headerFields.angebotImMandant = "NAVAX Consulting (AT)"

  // Sprache
  if (lower.includes("englisch") || lower.includes("english") || lower.includes("sprache en"))
    info.headerFields.sprache = "EN"
  else if (lower.includes("deutsch") || lower.includes("sprache de") || lower.includes("auf deutsch"))
    info.headerFields.sprache = "DE"

  // Kostentraeger
  if (lower.includes("trade") || lower.includes("handel")) info.headerFields.kostentraeger = "104 - Trade"
  else if (lower.includes("construction") || lower.includes("bau")) info.headerFields.kostentraeger = "105 - Construction"
  else if (lower.includes("professional") || lower.includes("prof. services") || lower.includes("dienstleistung")) info.headerFields.kostentraeger = "106 - Prof. Services"
  else if (lower.includes("manufacturing") || lower.includes("fertigung")) info.headerFields.kostentraeger = "107 - Manufacturing"

  // Deployment / Lizenzart
  if (lower.includes("cloud") || lower.includes("saas")) info.headerFields.lizenzart = "SaaS/Cloud"
  else if (lower.includes("on prem")) info.headerFields.lizenzart = lower.includes("subscription") ? "On Prem Subscription" : "On Prem"

  // Abrechnung
  if (lower.includes("monatlich")) info.headerFields.lizenzabrechnung = "monatlich"
  else if (lower.includes("quartalsweise") || lower.includes("quartal")) info.headerFields.lizenzabrechnung = "quartalsweise"
  else if (lower.includes("jaehrlich") || lower.includes("jährlich")) info.headerFields.lizenzabrechnung = "jaehrlich"

  // DL-Einheit
  if (lower.includes("stunden") || lower.includes("std")) info.headerFields.registerkarteDlEinheit = "In STD anbieten"
  else if (lower.includes("leistungstag") || lower.includes(" lt ") || lower.includes("tage")) info.headerFields.registerkarteDlEinheit = "In LT anbieten"

  // Produktlinie
  if (lower.includes("business central") || lower.includes("d365 bc") || lower.includes(" bc")) info.headerFields.projektart = "10 - D365 BC"
  else if (lower.includes("d365 fo") || lower.includes("finance")) info.headerFields.projektart = "20 - D365 FO"
  else if (lower.includes("crm") || lower.includes("d365 cx") || lower.includes("customer experience")) info.headerFields.projektart = "50 - D365 CX"
  else if (lower.includes("analytics") || lower.includes("power bi")) info.headerFields.projektart = "60 - Data Analytics"
  else if (lower.includes(" ai ") || lower.includes("kuenstliche intelligenz")) info.headerFields.projektart = "80 - AI"

  // --- Licenses ---
  const licPatterns = [
    { regex: /(\d+)\s*(?:x\s*)?essentials/i, product: "Essentials", category: "D365 Business Central", price: 70 },
    { regex: /(\d+)\s*(?:x\s*)?premium(?!\s*s)/i, product: "Premium", category: "D365 Business Central", price: 100 },
    { regex: /(\d+)\s*(?:x\s*)?team\s*member/i, product: "Team Member", category: "D365 Business Central", price: 8 },
    { regex: /(\d+)\s*(?:x\s*)?device/i, product: "Device", category: "D365 Business Central", price: 40 },
    { regex: /(\d+)\s*(?:x\s*)?sales\s*(?:enterprise)?/i, product: "Sales Enterprise", category: "D365 CX", price: 95 },
    { regex: /(\d+)\s*(?:x\s*)?customer\s*service\s*enterprise/i, product: "Customer Service Enterprise", category: "D365 CX", price: 95 },
    { regex: /(\d+)\s*(?:x\s*)?field\s*service/i, product: "Field Service", category: "D365 CX", price: 95 },
    { regex: /(\d+)\s*(?:x\s*)?power\s*bi\s*pro/i, product: "Power BI Pro", category: "Power BI / Data Analytics", price: 10 },
  ]
  for (const pat of licPatterns) {
    const m = text.match(pat.regex)
    if (m) {
      info.licenses.push({ category: pat.category, product: pat.product, quantity: parseInt(m[1], 10), unitPrice: pat.price, discount: 0 })
    }
  }

  // --- Services ---
  if (lower.includes("easystarter")) info.services.push({ category: "ERP EasyStarter", description: "EasyStarter Basis Setup", unit: "LT", quantity: 5, rate: 400, discount: 0 })
  if (lower.includes("schulung") || lower.includes("training")) info.services.push({ category: "DL ERP", description: "Anwenderschulung", unit: "LT", quantity: 3, rate: 400, discount: 0 })
  if (lower.includes("power bi") && (lower.includes("workshop") || lower.includes("paket"))) info.services.push({ category: "DL Data Analytics", description: "Power BI Package Activation", unit: "LT", quantity: 5, rate: 400, discount: 0 })
  if (lower.includes("implementierung") || lower.includes("umsetzung")) info.services.push({ category: "DL ERP", description: "Projektumsetzung / Implementierung", unit: "LT", quantity: 10, rate: 400, discount: 0 })
  if (lower.includes("go-live")) info.services.push({ category: "DL ERP", description: "Go-Live Begleitung", unit: "LT", quantity: 2, rate: 400, discount: 0 })

  // --- Solutions ---
  if (lower.includes("trade365")) info.solutions.push({ name: "Trade365", priceCategory: 3 })
  if (lower.includes("intercompany")) info.solutions.push({ name: "Intercompany Solution", priceCategory: 2 })
  if (lower.includes("construction365")) info.solutions.push({ name: "Construction365", priceCategory: 3 })

  return info
}

function getMissingFields(mergedHeader: Record<string, string>): string[] {
  const missing: string[] = []

  const required: Array<{ key: string; label: string }> = [
    { key: "unternehmensname", label: "Unternehmensname / Kundenname" },
    { key: "angebotstitel", label: "Angebotstitel (z.B. 'D365 BC Einfuehrung Musterfirma')" },
    { key: "projektverantwortlicher", label: "Projektverantwortlicher (dein Name)" },
    { key: "sprache", label: "Sprache (Deutsch oder Englisch)" },
    { key: "angebotImMandant", label: "Mandant (NAVAX Consulting AT oder NAVAX GmbH DE)" },
    { key: "lizenzart", label: "Lizenzart (SaaS/Cloud, On Prem, On Prem Subscription)" },
    { key: "lizenzabrechnung", label: "Lizenzabrechnung (jaehrlich, monatlich, quartalsweise)" },
    { key: "kostenstelle", label: "Kostenstelle (Graz, Linz, Wien)" },
    { key: "kostentraeger", label: "Kostentraeger (Trade, Construction, Prof. Services, Manufacturing)" },
    { key: "registerkarteDlEinheit", label: "DL-Einheit (Leistungstage oder Stunden)" },
  ]

  for (const r of required) {
    const val = mergedHeader[r.key]
    if (!val || val.trim() === "") {
      missing.push(r.label)
    }
  }

  return missing
}

function filterNewToolResults(
  info: ParsedInfo,
  quoteState: Partial<QuoteState> | undefined
) {
  const toolResults: Array<{ toolName: string; args: Record<string, unknown>; result: Record<string, unknown> }> = []

  const existingHeader = (quoteState?.header || {}) as Record<string, string>
  for (const [field, value] of Object.entries(info.headerFields)) {
    const existingVal = existingHeader[field]
    if (!existingVal || existingVal !== value) {
      toolResults.push({
        toolName: "setHeaderField",
        args: { field, value },
        result: { success: true, field, value },
      })
    }
  }

  const existingLicenses = (quoteState?.licenses || []) as LicensePosition[]
  for (const lic of info.licenses) {
    const exists = existingLicenses.some((l) => l.product === lic.product && l.category === lic.category)
    if (!exists) {
      const total = lic.quantity * lic.unitPrice * (1 - lic.discount / 100)
      toolResults.push({
        toolName: "addLicensePosition",
        args: { ...lic, optional: false },
        result: { success: true, position: { ...lic, total, optional: false } },
      })
    }
  }

  const existingServices = (quoteState?.services || []) as ServicePosition[]
  for (const svc of info.services) {
    const exists = existingServices.some((s) => s.description === svc.description)
    if (!exists) {
      const total = svc.quantity * svc.rate * (1 - svc.discount / 100)
      toolResults.push({
        toolName: "addServicePosition",
        args: { ...svc, optional: false },
        result: { success: true, position: { ...svc, total, optional: false } },
      })
    }
  }

  const existingSolutions = (quoteState?.solutions || []) as SolutionPosition[]
  const priceMap: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
  for (const sol of info.solutions) {
    const exists = existingSolutions.some((s) => s.name === sol.name)
    if (!exists) {
      toolResults.push({
        toolName: "addSolutionPosition",
        args: { ...sol, additionalDl: null },
        result: { success: true, position: { ...sol, flatRate: priceMap[sol.priceCategory] || 0, additionalDl: 0 } },
      })
    }
  }

  return toolResults
}

function buildResponseText(
  toolResults: Array<{ toolName: string; args: Record<string, unknown>; result: Record<string, unknown> }>,
  missingFields: string[],
  mergedHeader: Record<string, string>,
  quoteState: Partial<QuoteState> | undefined,
  isFollowUp: boolean
): string {
  const parts: string[] = []
  const labels: Record<string, string> = {
    unternehmensname: "Kunde", sprache: "Sprache", angebotImMandant: "Mandant",
    registerkarteDlEinheit: "DL-Einheit", lizenzart: "Lizenzart", lizenzabrechnung: "Abrechnung",
    angebotstitel: "Titel", kostenstelle: "Kostenstelle", kostentraeger: "Kostentraeger",
    projektverantwortlicher: "Verantwortlich", projektart: "Produktlinie",
  }

  const newHeaders = toolResults.filter((t) => t.toolName === "setHeaderField")
  const newLicenses = toolResults.filter((t) => t.toolName === "addLicensePosition")
  const newServices = toolResults.filter((t) => t.toolName === "addServicePosition")
  const newSolutions = toolResults.filter((t) => t.toolName === "addSolutionPosition")
  const hasNewData = toolResults.length > 0

  if (!hasNewData && isFollowUp) {
    parts.push("Ich konnte aus deiner Nachricht keine neuen Angaben extrahieren. Bitte formuliere die fehlenden Infos etwas deutlicher.\n")
  } else if (hasNewData) {
    parts.push(isFollowUp ? "Danke, ich habe Neues erfasst:\n" : "Danke fuer die Informationen! Ich habe folgendes erfasst:\n")

    if (newHeaders.length > 0) {
      parts.push("**Kopfdaten:**")
      for (const tr of newHeaders) {
        parts.push(`- ${labels[tr.args.field as string] || tr.args.field}: **${tr.args.value}**`)
      }
      parts.push("")
    }

    if (newLicenses.length > 0) {
      parts.push("**Lizenzen:**")
      for (const tr of newLicenses) {
        const p = tr.result.position as Record<string, unknown>
        parts.push(`- ${p.quantity}x ${p.product} (${p.category}) = **${((p.quantity as number) * (p.unitPrice as number)).toFixed(2)} EUR/Monat**`)
      }
      parts.push("")
    }

    if (newServices.length > 0) {
      parts.push("**Dienstleistungen:**")
      for (const tr of newServices) {
        const p = tr.result.position as Record<string, unknown>
        parts.push(`- ${p.description}: ${p.quantity} ${p.unit} x ${p.rate} EUR = **${((p.quantity as number) * (p.rate as number)).toFixed(2)} EUR**`)
      }
      parts.push("")
    }

    if (newSolutions.length > 0) {
      parts.push("**NAVAX Solutions:**")
      for (const tr of newSolutions) {
        const p = tr.result.position as Record<string, unknown>
        parts.push(`- ${p.name}: Pauschale **${(p.flatRate as number).toFixed(2)} EUR**`)
      }
      parts.push("")
    }
  }

  // Show current total state
  const filledHeaders = Object.entries(mergedHeader).filter(([, v]) => v && v.trim() !== "")
  if (filledHeaders.length > 0) {
    parts.push("---")
    parts.push("**Aktueller Gesamtstand Kopfdaten:**")
    for (const [key, val] of filledHeaders) {
      if (labels[key]) parts.push(`- ${labels[key]}: ${val}`)
    }
    parts.push("")
  }

  // Existing licenses / services
  const allLicenses = quoteState?.licenses || []
  const allServices = quoteState?.services || []
  if (allLicenses.length > 0) {
    parts.push(`**Lizenzen gesamt:** ${allLicenses.length} Position(en)`)
  }
  if (allServices.length > 0) {
    parts.push(`**Dienstleistungen gesamt:** ${allServices.length} Position(en)`)
  }
  if (allLicenses.length > 0 || allServices.length > 0) parts.push("")

  // Missing fields
  if (missingFields.length > 0) {
    parts.push("**Noch fehlende Angaben:**")
    missingFields.forEach((f, i) => parts.push(`${i + 1}. ${f}`))
    parts.push("\nBitte ergaenze diese Angaben, z.B.:\n*\"Titel: D365 BC Einfuehrung, Verantwortlich: Max Mustermann, Sprache Deutsch, Leistungstage, jaehrlich, Trade\"*")
  } else {
    parts.push("Alle Pflichtfelder sind ausgefuellt! Du kannst jetzt rechts auf **\"Excel herunterladen\"** klicken, oder mir weitere Positionen (Lizenzen, DL, Solutions) nennen.")
  }

  return parts.join("\n")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawMessages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }> = body.messages || []
    const quoteState: QuoteState | undefined = body.quoteState

    console.log("[v0] Incoming quoteState header:", JSON.stringify(quoteState?.header || {}))
    console.log("[v0] Incoming quoteState licenses count:", quoteState?.licenses?.length || 0)
    console.log("[v0] Incoming quoteState services count:", quoteState?.services?.length || 0)

    // Get ONLY the latest user message
    const userMessages = rawMessages.filter((m) => m.role === "user")
    const lastUserMsg = userMessages[userMessages.length - 1]

    if (!lastUserMsg) {
      return Response.json({ text: "Bitte beschreibe dein Kundenmeeting -- ich extrahiere die Angaben fuer die Angebotskalkulation.", toolResults: [] })
    }

    let latestText = ""
    if (lastUserMsg.parts) {
      latestText = lastUserMsg.parts.filter((p) => p.type === "text" && p.text).map((p) => p.text).join("\n")
    } else if (lastUserMsg.content) {
      latestText = lastUserMsg.content
    }

    console.log("[v0] Latest user text:", latestText.slice(0, 200))

    const isFollowUp = userMessages.length > 1

    // Parse only the latest message
    const info = parseLatestMessage(latestText)
    console.log("[v0] Parsed header fields:", JSON.stringify(info.headerFields))
    console.log("[v0] Parsed licenses:", info.licenses.length)
    console.log("[v0] Parsed services:", info.services.length)

    // Build the merged header: existing state + newly parsed fields
    const existingHeader = (quoteState?.header || {}) as Record<string, string>
    const mergedHeader: Record<string, string> = {}
    // Copy all existing header values
    for (const [k, v] of Object.entries(existingHeader)) {
      if (v && typeof v === "string" && v.trim() !== "") {
        mergedHeader[k] = v
      }
    }
    // Overlay newly parsed fields
    for (const [k, v] of Object.entries(info.headerFields)) {
      if (v && v.trim() !== "") {
        mergedHeader[k] = v
      }
    }

    console.log("[v0] Merged header:", JSON.stringify(mergedHeader))

    // Filter to only new tool results
    const toolResults = filterNewToolResults(info, quoteState)
    console.log("[v0] New tool results count:", toolResults.length)

    // Check missing fields against merged header
    const missingFields = getMissingFields(mergedHeader)
    console.log("[v0] Missing fields:", missingFields)

    // Build response
    const text = buildResponseText(toolResults, missingFields, mergedHeader, quoteState, isFollowUp)

    return Response.json({ text, toolResults })
  } catch (error) {
    console.error("[v0] Mock Chat API error:", error)
    return Response.json(
      { error: "Interner Serverfehler", details: String(error) },
      { status: 500 }
    )
  }
}
