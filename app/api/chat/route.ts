import type { QuoteState, LicensePosition, ServicePosition, SolutionPosition } from "@/lib/store/types"

export const maxDuration = 30

interface ParsedInfo {
  headerFields: Record<string, string>
  licenses: Array<{ category: string; product: string; quantity: number; unitPrice: number; discount: number }>
  services: Array<{ category: string; description: string; unit: string; quantity: number; rate: number; discount: number }>
  solutions: Array<{ name: string; priceCategory: number }>
}

/**
 * Parse ONLY the latest user message for new information.
 * The quoteState already contains everything from previous messages.
 */
function parseLatestMessage(text: string): ParsedInfo {
  const lower = text.toLowerCase()
  const info: ParsedInfo = {
    headerFields: {},
    licenses: [],
    services: [],
    solutions: [],
  }

  // --- Header fields ---
  const companyPatterns = [
    /(?:firma|unternehmen|kunde|kundenname|company)[:\s]+["']?([a-zäöüßA-ZÄÖÜ\s&.\-]+?)["']?(?:\s*[,.\n]|$)/i,
    /(?:fuer|für)\s+(?:die\s+)?(?:firma\s+)?["']?([a-zäöüßA-ZÄÖÜ\s&.\-]{3,40})["']?(?:\s*[,.\n]|$)/i,
  ]
  for (const p of companyPatterns) {
    const m = text.match(p)
    if (m?.[1] && m[1].trim().length >= 3) {
      info.headerFields.unternehmensname = m[1].trim()
      break
    }
  }

  // Titel
  const titlePatterns = [
    /(?:titel|angebotstitel|betreff|projekt)[:\s]+["']?([^"'\n,]{5,80})["']?/i,
  ]
  for (const p of titlePatterns) {
    const m = text.match(p)
    if (m?.[1]) {
      info.headerFields.angebotstitel = m[1].trim()
      break
    }
  }

  // Verantwortlicher
  const respPatterns = [
    /(?:verantwortlich|projektverantwortlich|mein name|ich bin|ich heisse|ich heiße)[:\s]+["']?([a-zäöüßA-ZÄÖÜ\s.\-]{3,40})["']?/i,
  ]
  for (const p of respPatterns) {
    const m = text.match(p)
    if (m?.[1]) {
      info.headerFields.projektverantwortlicher = m[1].trim()
      break
    }
  }

  // Kostenstelle
  if (lower.includes("graz")) info.headerFields.kostenstelle = "1 - Graz"
  else if (lower.includes("linz")) info.headerFields.kostenstelle = "2 - Linz"
  else if (lower.includes("wien") || lower.includes("vienna")) info.headerFields.kostenstelle = "4 - Wien"

  // Mandant
  if (lower.includes("deutschland") || lower.includes("navax gmbh") || lower.includes("(de)"))
    info.headerFields.angebotImMandant = "NAVAX GmbH (DE)"
  else if (lower.includes("oesterreich") || lower.includes("österreich") || lower.includes("navax consulting") || lower.includes("(at)") || lower.includes(" at") || lower.includes("wien") || lower.includes("graz") || lower.includes("linz"))
    info.headerFields.angebotImMandant = "NAVAX Consulting (AT)"

  // Sprache
  if (lower.includes("englisch") || lower.includes("english") || lower.includes("sprache en") || lower.includes("auf englisch"))
    info.headerFields.sprache = "EN"
  else if (lower.includes("deutsch") || lower.includes("sprache de") || lower.includes("auf deutsch"))
    info.headerFields.sprache = "DE"

  // Kostentraeger
  if (lower.includes("trade") || lower.includes("handel")) info.headerFields.kostentraeger = "104 - Trade"
  else if (lower.includes("construction") || lower.includes("bau")) info.headerFields.kostentraeger = "105 - Construction"
  else if (lower.includes("professional") || lower.includes("prof. services")) info.headerFields.kostentraeger = "106 - Prof. Services"
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
    { regex: /(\d+)\s*(?:x\s*)?sales\s*enterprise/i, product: "Sales Enterprise", category: "D365 CX", price: 95 },
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
  if (lower.includes("ki einfuehrung") || lower.includes("ai workshop")) info.services.push({ category: "DL AI", description: "KI Einfuehrungsworkshop", unit: "LT", quantity: 2, rate: 400, discount: 0 })

  // --- Solutions ---
  if (lower.includes("trade365")) info.solutions.push({ name: "Trade365", priceCategory: 3 })
  if (lower.includes("intercompany")) info.solutions.push({ name: "Intercompany Solution", priceCategory: 2 })
  if (lower.includes("construction365")) info.solutions.push({ name: "Construction365", priceCategory: 3 })

  return info
}

/**
 * Check which required fields are still missing - using the MERGED state
 * (existing quoteState + newly parsed fields).
 */
function getMissingFields(
  quoteState: Partial<QuoteState> | undefined,
  newHeaderFields: Record<string, string>
): string[] {
  const header = { ...(quoteState?.header || {}), ...newHeaderFields }
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
    const val = header[r.key as keyof typeof header]
    if (!val || (typeof val === "string" && val.trim() === "")) {
      missing.push(r.label)
    }
  }

  return missing
}

/**
 * Filter out tool results for fields that are ALREADY in the quoteState.
 * Only send tool results for genuinely NEW data.
 */
function filterNewToolResults(
  info: ParsedInfo,
  quoteState: Partial<QuoteState> | undefined
) {
  const toolResults: Array<{ toolName: string; args: Record<string, unknown>; result: Record<string, unknown> }> = []

  // Only send header fields that are actually new or changed
  const existingHeader = quoteState?.header || {}
  for (const [field, value] of Object.entries(info.headerFields)) {
    const existingVal = existingHeader[field as keyof typeof existingHeader]
    if (!existingVal || existingVal !== value) {
      toolResults.push({
        toolName: "setHeaderField",
        args: { field, value },
        result: { success: true, field, value },
      })
    }
  }

  // Only add licenses not already present
  const existingLicenses = (quoteState?.licenses || []) as LicensePosition[]
  for (const lic of info.licenses) {
    const alreadyExists = existingLicenses.some(
      (l) => l.product === lic.product && l.category === lic.category
    )
    if (!alreadyExists) {
      const total = lic.quantity * lic.unitPrice * (1 - lic.discount / 100)
      toolResults.push({
        toolName: "addLicensePosition",
        args: { ...lic, optional: false },
        result: { success: true, position: { ...lic, total, optional: false } },
      })
    }
  }

  // Only add services not already present
  const existingServices = (quoteState?.services || []) as ServicePosition[]
  for (const svc of info.services) {
    const alreadyExists = existingServices.some((s) => s.description === svc.description)
    if (!alreadyExists) {
      const total = svc.quantity * svc.rate * (1 - svc.discount / 100)
      toolResults.push({
        toolName: "addServicePosition",
        args: { ...svc, optional: false },
        result: { success: true, position: { ...svc, total, optional: false } },
      })
    }
  }

  // Only add solutions not already present
  const existingSolutions = (quoteState?.solutions || []) as SolutionPosition[]
  const priceMap: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
  for (const sol of info.solutions) {
    const alreadyExists = existingSolutions.some((s) => s.name === sol.name)
    if (!alreadyExists) {
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
  quoteState: Partial<QuoteState> | undefined,
  newHeaderFields: Record<string, string>,
  isFollowUp: boolean
): string {
  const parts: string[] = []

  // Determine what was newly added
  const newHeaders = toolResults.filter((t) => t.toolName === "setHeaderField")
  const newLicenses = toolResults.filter((t) => t.toolName === "addLicensePosition")
  const newServices = toolResults.filter((t) => t.toolName === "addServicePosition")
  const newSolutions = toolResults.filter((t) => t.toolName === "addSolutionPosition")

  const hasNewData = toolResults.length > 0

  if (!hasNewData && isFollowUp) {
    // User wrote something but we couldn't extract anything new
    parts.push("Ich konnte aus deiner Nachricht keine neuen Angaben extrahieren. Koenntest du die fehlenden Informationen bitte nochmal etwas deutlicher angeben?\n")
  } else if (hasNewData) {
    parts.push(isFollowUp ? "Danke, ich habe folgendes neu erfasst:\n" : "Danke fuer die Informationen! Ich habe folgendes erfasst:\n")

    if (newHeaders.length > 0) {
      parts.push("**Neue Kopfdaten:**")
      const labels: Record<string, string> = {
        unternehmensname: "Kunde", sprache: "Sprache", angebotImMandant: "Mandant",
        registerkarteDlEinheit: "DL-Einheit", lizenzart: "Lizenzart", lizenzabrechnung: "Abrechnung",
        angebotstitel: "Titel", kostenstelle: "Kostenstelle", kostentraeger: "Kostentraeger",
        projektverantwortlicher: "Verantwortlich", projektart: "Produktlinie",
      }
      for (const tr of newHeaders) {
        const field = tr.args.field as string
        const value = tr.args.value as string
        parts.push(`- ${labels[field] || field}: **${value}**`)
      }
      parts.push("")
    }

    if (newLicenses.length > 0) {
      parts.push("**Neue Lizenzen:**")
      for (const tr of newLicenses) {
        const pos = tr.result.position as Record<string, unknown>
        parts.push(`- ${pos.quantity}x ${pos.product} (${pos.category}) = **${((pos.quantity as number) * (pos.unitPrice as number)).toFixed(2)} EUR/Monat**`)
      }
      parts.push("")
    }

    if (newServices.length > 0) {
      parts.push("**Neue Dienstleistungen:**")
      for (const tr of newServices) {
        const pos = tr.result.position as Record<string, unknown>
        parts.push(`- ${pos.description}: ${pos.quantity} ${pos.unit} x ${pos.rate} EUR = **${((pos.quantity as number) * (pos.rate as number)).toFixed(2)} EUR**`)
      }
      parts.push("")
    }

    if (newSolutions.length > 0) {
      parts.push("**Neue NAVAX Solutions:**")
      for (const tr of newSolutions) {
        const pos = tr.result.position as Record<string, unknown>
        parts.push(`- ${pos.name}: Pauschale **${(pos.flatRate as number).toFixed(2)} EUR**`)
      }
      parts.push("")
    }
  }

  // Always show complete overview
  const mergedHeader = { ...(quoteState?.header || {}), ...newHeaderFields }
  const filledHeaders = Object.entries(mergedHeader).filter(([, v]) => v && String(v).trim() !== "")
  const existingLicenses = [...(quoteState?.licenses || [])]
  const existingServices = [...(quoteState?.services || [])]

  if (filledHeaders.length > 0 || existingLicenses.length > 0 || existingServices.length > 0) {
    parts.push("---\n**Aktueller Gesamtstand:**\n")

    if (filledHeaders.length > 0) {
      const labels: Record<string, string> = {
        unternehmensname: "Kunde", sprache: "Sprache", angebotImMandant: "Mandant",
        registerkarteDlEinheit: "DL-Einheit", lizenzart: "Lizenzart", lizenzabrechnung: "Abrechnung",
        angebotstitel: "Titel", kostenstelle: "Kostenstelle", kostentraeger: "Kostentraeger",
        projektverantwortlicher: "Verantwortlich", projektart: "Produktlinie",
      }
      for (const [key, val] of filledHeaders) {
        if (labels[key]) parts.push(`- ${labels[key]}: ${val}`)
      }
      parts.push("")
    }
  }

  // Missing fields or all done
  if (missingFields.length > 0) {
    parts.push("**Noch fehlend:**")
    missingFields.forEach((f, i) => parts.push(`${i + 1}. ${f}`))
    parts.push("\nBitte ergaenze diese Angaben, z.B.:\n*\"Titel: D365 BC Einfuehrung, Verantwortlich: Max Mustermann, Sprache Deutsch, Leistungstage\"*")
  } else {
    parts.push("Alle Pflichtfelder sind ausgefuellt! Du kannst jetzt im rechten Panel auf **\"Excel herunterladen\"** klicken, oder mir weitere Positionen nennen.")
  }

  return parts.join("\n")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawMessages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }> = body.messages || []
    const quoteState: QuoteState | undefined = body.quoteState

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

    const isFollowUp = userMessages.length > 1

    // Parse only the latest message
    const info = parseLatestMessage(latestText)

    // Filter out duplicates against existing quoteState
    const toolResults = filterNewToolResults(info, quoteState)

    // Check what's still missing AFTER applying new fields
    const missingFields = getMissingFields(quoteState, info.headerFields)

    // Build response text
    const text = buildResponseText(toolResults, missingFields, quoteState, info.headerFields, isFollowUp)

    return Response.json({ text, toolResults })
  } catch (error) {
    console.error("[v0] Mock Chat API error:", error)
    return Response.json({ error: "Interner Serverfehler", details: String(error) }, { status: 500 })
  }
}
