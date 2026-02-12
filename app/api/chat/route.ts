import type { QuoteState } from "@/lib/store/types"

export const maxDuration = 30

interface ParsedInfo {
  headerFields: Record<string, string>
  licenses: Array<{ category: string; product: string; quantity: number; unitPrice: number; discount: number }>
  services: Array<{ category: string; description: string; unit: string; quantity: number; rate: number; discount: number }>
  solutions: Array<{ name: string; priceCategory: number }>
  missingFields: string[]
}

function parseUserInput(allMessages: string[], quoteState?: Partial<QuoteState>): ParsedInfo {
  const fullText = allMessages.join("\n").toLowerCase()
  const rawText = allMessages.join("\n")
  const info: ParsedInfo = {
    headerFields: {},
    licenses: [],
    services: [],
    solutions: [],
    missingFields: [],
  }

  // --- Extract header fields ---
  const companyPatterns = [
    /(?:firma|unternehmen|kunde|kundenname|company)[:\s]+["']?([a-zäöüßA-ZÄÖÜ\s&.\-]+?)["']?(?:\s*[,.\n]|$)/i,
    /(?:fuer|für)\s+(?:die\s+)?(?:firma\s+)?["']?([a-zäöüßA-ZÄÖÜ\s&.\-]{3,40})["']?/i,
  ]
  for (const p of companyPatterns) {
    const m = rawText.match(p)
    if (m?.[1]) {
      info.headerFields.unternehmensname = m[1].trim()
      break
    }
  }

  if (fullText.includes("graz")) info.headerFields.kostenstelle = "1 - Graz"
  else if (fullText.includes("linz")) info.headerFields.kostenstelle = "2 - Linz"
  else if (fullText.includes("wien") || fullText.includes("vienna")) info.headerFields.kostenstelle = "4 - Wien"

  if (fullText.includes("deutschland") || fullText.includes("gmbh (de)"))
    info.headerFields.angebotImMandant = "NAVAX GmbH (DE)"
  else if (fullText.includes("oesterreich") || fullText.includes("österreich") || fullText.includes("consulting (at)") || fullText.includes(" at"))
    info.headerFields.angebotImMandant = "NAVAX Consulting (AT)"

  info.headerFields.sprache = (fullText.includes("englisch") || fullText.includes("english")) ? "EN" : "DE"

  if (fullText.includes("trade") || fullText.includes("handel")) info.headerFields.kostentraeger = "104 - Trade"
  else if (fullText.includes("construction") || fullText.includes("bau")) info.headerFields.kostentraeger = "105 - Construction"
  else if (fullText.includes("professional") || fullText.includes("dienstleist")) info.headerFields.kostentraeger = "106 - Prof. Services"
  else if (fullText.includes("manufacturing") || fullText.includes("fertigung")) info.headerFields.kostentraeger = "107 - Manufacturing"

  if (fullText.includes("cloud") || fullText.includes("saas")) info.headerFields.lizenzart = "SaaS/Cloud"
  else if (fullText.includes("on prem")) info.headerFields.lizenzart = fullText.includes("subscription") ? "On Prem Subscription" : "On Prem"

  if (fullText.includes("monatlich")) info.headerFields.lizenzabrechnung = "monatlich"
  else if (fullText.includes("quartalsweise") || fullText.includes("quartal")) info.headerFields.lizenzabrechnung = "quartalsweise"
  else if (fullText.includes("jaehrlich") || fullText.includes("jährlich")) info.headerFields.lizenzabrechnung = "jaehrlich"

  if (fullText.includes("stunden") || fullText.includes("std")) info.headerFields.registerkarteDlEinheit = "In STD anbieten"
  else if (fullText.includes("leistungstag") || fullText.includes(" lt ") || fullText.includes("tage")) info.headerFields.registerkarteDlEinheit = "In LT anbieten"

  if (fullText.includes("business central") || fullText.includes("d365 bc") || fullText.includes("bc ")) info.headerFields.projektart = "10 - D365 BC"
  else if (fullText.includes("d365 fo") || fullText.includes("finance")) info.headerFields.projektart = "20 - D365 FO"
  else if (fullText.includes("crm") || fullText.includes("d365 cx")) info.headerFields.projektart = "50 - D365 CX"
  else if (fullText.includes("analytics") || fullText.includes("power bi")) info.headerFields.projektart = "60 - Data Analytics"
  else if (fullText.includes(" ai ") || fullText.includes("künstlich")) info.headerFields.projektart = "80 - AI"

  // --- Extract licenses ---
  const licPatterns = [
    { regex: /(\d+)\s*(?:x\s*)?essentials/i, product: "Essentials", category: "D365 Business Central", price: 70 },
    { regex: /(\d+)\s*(?:x\s*)?premium(?!\s*s)/i, product: "Premium", category: "D365 Business Central", price: 100 },
    { regex: /(\d+)\s*(?:x\s*)?team\s*member/i, product: "Team Member", category: "D365 Business Central", price: 8 },
    { regex: /(\d+)\s*(?:x\s*)?device/i, product: "Device", category: "D365 Business Central", price: 40 },
    { regex: /(\d+)\s*(?:x\s*)?sales\s*enterprise/i, product: "Sales Enterprise", category: "D365 CX", price: 95 },
    { regex: /(\d+)\s*(?:x\s*)?power\s*bi\s*pro/i, product: "Power BI Pro", category: "Power BI / Data Analytics", price: 10 },
  ]

  for (const pat of licPatterns) {
    const m = rawText.match(pat.regex)
    if (m) {
      info.licenses.push({ category: pat.category, product: pat.product, quantity: parseInt(m[1], 10), unitPrice: pat.price, discount: 0 })
    }
  }

  if (info.licenses.length === 0 && fullText.includes("essentials")) {
    const qMatch = rawText.match(/(\d+)/i)
    info.licenses.push({ category: "D365 Business Central", product: "Essentials", quantity: qMatch ? parseInt(qMatch[1], 10) : 1, unitPrice: 70, discount: 0 })
  }

  // --- Extract services ---
  if (fullText.includes("easystarter")) info.services.push({ category: "ERP EasyStarter", description: "EasyStarter Basis Setup", unit: "LT", quantity: 5, rate: 400, discount: 0 })
  if (fullText.includes("schulung") || fullText.includes("training")) info.services.push({ category: "DL ERP", description: "Anwenderschulung", unit: "LT", quantity: 3, rate: 400, discount: 0 })
  if (fullText.includes("power bi") && fullText.includes("workshop")) info.services.push({ category: "DL Data Analytics", description: "Power BI Package Activation", unit: "LT", quantity: 5, rate: 400, discount: 0 })
  if (fullText.includes("implementierung") || fullText.includes("umsetzung")) info.services.push({ category: "DL ERP", description: "Projektumsetzung / Implementierung", unit: "LT", quantity: 10, rate: 400, discount: 0 })
  if (fullText.includes("go-live")) info.services.push({ category: "DL ERP", description: "Go-Live Begleitung", unit: "LT", quantity: 2, rate: 400, discount: 0 })

  // --- Extract solutions ---
  if (fullText.includes("trade365")) info.solutions.push({ name: "Trade365", priceCategory: 3 })
  if (fullText.includes("intercompany")) info.solutions.push({ name: "Intercompany Solution", priceCategory: 2 })

  // --- Check missing fields ---
  const existingHeader = { ...(quoteState?.header || {}), ...info.headerFields }
  const required = [
    { key: "unternehmensname", label: "Unternehmensname / Kundenname" },
    { key: "angebotImMandant", label: "Mandant (NAVAX Consulting AT oder NAVAX GmbH DE)" },
    { key: "lizenzart", label: "Lizenzart (SaaS/Cloud, On Prem, On Prem Subscription)" },
    { key: "lizenzabrechnung", label: "Lizenzabrechnung (jaehrlich, monatlich, quartalsweise)" },
    { key: "angebotstitel", label: "Angebotstitel" },
    { key: "kostenstelle", label: "Kostenstelle (Graz, Linz, Wien)" },
    { key: "kostentraeger", label: "Kostentraeger (Trade, Construction, Prof. Services, Manufacturing)" },
    { key: "projektverantwortlicher", label: "Projektverantwortlicher (dein Name)" },
    { key: "registerkarteDlEinheit", label: "DL-Einheit (Leistungstage oder Stunden)" },
  ]

  for (const r of required) {
    if (!existingHeader[r.key as keyof typeof existingHeader]) info.missingFields.push(r.label)
  }

  return info
}

function buildResponse(info: ParsedInfo, quoteState?: Partial<QuoteState>, isFollowUp?: boolean): { text: string; toolResults: Array<{ toolName: string; args: Record<string, unknown>; result: Record<string, unknown> }> } {
  const toolResults: Array<{ toolName: string; args: Record<string, unknown>; result: Record<string, unknown> }> = []
  const parts: string[] = []

  // Build tool results
  for (const [field, value] of Object.entries(info.headerFields)) {
    toolResults.push({ toolName: "setHeaderField", args: { field, value }, result: { success: true, field, value } })
  }

  for (const lic of info.licenses) {
    const total = lic.quantity * lic.unitPrice * (1 - lic.discount / 100)
    toolResults.push({ toolName: "addLicensePosition", args: { ...lic, optional: false }, result: { success: true, position: { ...lic, total, optional: false } } })
  }

  for (const svc of info.services) {
    const total = svc.quantity * svc.rate * (1 - svc.discount / 100)
    toolResults.push({ toolName: "addServicePosition", args: { ...svc, optional: false }, result: { success: true, position: { ...svc, total, optional: false } } })
  }

  const priceMap: Record<number, number> = { 1: 540, 2: 1530, 3: 2680, 4: 0 }
  for (const sol of info.solutions) {
    toolResults.push({ toolName: "addSolutionPosition", args: { ...sol, additionalDl: null }, result: { success: true, position: { ...sol, flatRate: priceMap[sol.priceCategory] || 0, additionalDl: 0 } } })
  }

  // Build response text
  parts.push(isFollowUp ? "Danke fuer die Ergaenzungen! Hier der aktualisierte Stand:\n" : "Danke fuer die Informationen! Ich habe folgendes erfasst:\n")

  const allHeaders = { ...(quoteState?.header || {}), ...info.headerFields }
  if (Object.keys(allHeaders).some(k => allHeaders[k as keyof typeof allHeaders])) {
    parts.push("**Kopfdaten:**")
    const labels: Record<string, string> = { unternehmensname: "Kunde", sprache: "Sprache", angebotImMandant: "Mandant", registerkarteDlEinheit: "DL-Einheit", lizenzart: "Lizenzart", lizenzabrechnung: "Abrechnung", angebotstitel: "Titel", kostenstelle: "Kostenstelle", kostentraeger: "Kostentraeger", projektverantwortlicher: "Verantwortlich", projektart: "Produktlinie" }
    for (const [key, val] of Object.entries(allHeaders)) {
      if (val) parts.push(`- ${labels[key] || key}: **${val}**`)
    }
    parts.push("")
  }

  const allLicenses = [...(quoteState?.licenses || []), ...info.licenses]
  if (allLicenses.length > 0) {
    parts.push("**Lizenzen:**")
    for (const l of allLicenses) { parts.push(`- ${l.quantity}x ${l.product} (${l.category}) = **${(l.quantity * l.unitPrice).toFixed(2)} EUR/Monat**`) }
    parts.push("")
  }

  const allServices = [...(quoteState?.services || []), ...info.services]
  if (allServices.length > 0) {
    parts.push("**Dienstleistungen:**")
    for (const s of allServices) { parts.push(`- ${s.description}: ${s.quantity} ${s.unit} x ${s.rate} EUR = **${(s.quantity * s.rate).toFixed(2)} EUR**`) }
    parts.push("")
  }

  if (info.missingFields.length > 0) {
    parts.push("---\n\nUm das Angebot zu vervollstaendigen, brauche ich noch:\n")
    info.missingFields.forEach((f, i) => parts.push(`${i + 1}. **${f}**`))
    parts.push("\nBitte ergaenze die fehlenden Angaben.")
  } else {
    parts.push("---\n\nAlle Pflichtfelder sind ausgefuellt! Klicke auf **\"Excel herunterladen\"** im rechten Panel.")
  }

  return { text: parts.join("\n"), toolResults }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawMessages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }> = body.messages || []
    const quoteState: QuoteState | undefined = body.quoteState

    const userTexts: string[] = []
    for (const msg of rawMessages) {
      if (msg.role !== "user") continue
      if (msg.parts) {
        for (const p of msg.parts) { if (p.type === "text" && p.text) userTexts.push(p.text) }
      } else if (msg.content && typeof msg.content === "string") {
        userTexts.push(msg.content)
      }
    }

    const isFollowUp = rawMessages.filter(m => m.role === "assistant").length > 0
    const info = parseUserInput(userTexts, quoteState)
    const { text, toolResults } = buildResponse(info, quoteState, isFollowUp)

    // Return a simple JSON response - no streaming needed for mock
    return Response.json({
      text,
      toolResults,
    })
  } catch (error) {
    console.error("[v0] Mock Chat API error:", error)
    return Response.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
