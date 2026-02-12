import type { QuoteState } from "@/lib/store/types"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const quoteState: QuoteState | undefined = body.quoteState

    // Check if quote is already fully populated (follow-up message)
    const isAlreadyFilled = quoteState?.header?.unternehmensname && quoteState.licenses.length > 0

    if (isAlreadyFilled) {
      return Response.json({
        text: [
          "Das Angebot ist bereits vollstaendig ausgefuellt. Hier ist der aktuelle Stand:",
          "",
          `**Kunde:** ${quoteState.header.unternehmensname}`,
          `**Titel:** ${quoteState.header.angebotstitel}`,
          `**Lizenzen:** ${quoteState.licenses.length} Position(en)`,
          `**Dienstleistungen:** ${quoteState.services.length} Position(en)`,
          `**Solutions:** ${quoteState.solutions.length} Position(en)`,
          `**Customer Service:** ${quoteState.customerService.length} Position(en)`,
          "",
          "Du kannst jetzt unten auf **\"Excel herunterladen\"** klicken, um die fertige Angebotskalkulation herunterzuladen.",
          "",
          "Oder klicke **\"Neues Angebot\"** um ein neues Angebot zu starten.",
        ].join("\n"),
        toolResults: [],
      })
    }

    // First message or empty state: return complete demo data
    const demoToolResults = [
      // -- Header fields --
      { toolName: "setHeaderField", args: { field: "unternehmensname", value: "Alpentech Solutions GmbH" }, result: { success: true, field: "unternehmensname", value: "Alpentech Solutions GmbH" } },
      { toolName: "setHeaderField", args: { field: "angebotstitel", value: "D365 Business Central Einfuehrung inkl. Trade365" }, result: { success: true, field: "angebotstitel", value: "D365 Business Central Einfuehrung inkl. Trade365" } },
      { toolName: "setHeaderField", args: { field: "projektverantwortlicher", value: "Kinan Alexander" }, result: { success: true, field: "projektverantwortlicher", value: "Kinan Alexander" } },
      { toolName: "setHeaderField", args: { field: "sprache", value: "DE" }, result: { success: true, field: "sprache", value: "DE" } },
      { toolName: "setHeaderField", args: { field: "angebotImMandant", value: "NAVAX Consulting (AT)" }, result: { success: true, field: "angebotImMandant", value: "NAVAX Consulting (AT)" } },
      { toolName: "setHeaderField", args: { field: "lizenzart", value: "SaaS/Cloud" }, result: { success: true, field: "lizenzart", value: "SaaS/Cloud" } },
      { toolName: "setHeaderField", args: { field: "lizenzabrechnung", value: "jaehrlich" }, result: { success: true, field: "lizenzabrechnung", value: "jaehrlich" } },
      { toolName: "setHeaderField", args: { field: "kostenstelle", value: "4 - Wien" }, result: { success: true, field: "kostenstelle", value: "4 - Wien" } },
      { toolName: "setHeaderField", args: { field: "kostentraeger", value: "104 - Trade" }, result: { success: true, field: "kostentraeger", value: "104 - Trade" } },
      { toolName: "setHeaderField", args: { field: "registerkarteDlEinheit", value: "In LT anbieten" }, result: { success: true, field: "registerkarteDlEinheit", value: "In LT anbieten" } },
      { toolName: "setHeaderField", args: { field: "projektart", value: "10 - D365 BC" }, result: { success: true, field: "projektart", value: "10 - D365 BC" } },
      { toolName: "setHeaderField", args: { field: "eingereichtVon", value: "Kinan Alexander" }, result: { success: true, field: "eingereichtVon", value: "Kinan Alexander" } },
      { toolName: "setHeaderField", args: { field: "eingereichtAm", value: new Date().toLocaleDateString("de-AT") }, result: { success: true, field: "eingereichtAm", value: new Date().toLocaleDateString("de-AT") } },
      { toolName: "setHeaderField", args: { field: "ansprechpartnerKunde", value: "Mag. Thomas Berger" }, result: { success: true, field: "ansprechpartnerKunde", value: "Mag. Thomas Berger" } },
      { toolName: "setHeaderField", args: { field: "angebotGueltigBis", value: "31.03.2026" }, result: { success: true, field: "angebotGueltigBis", value: "31.03.2026" } },

      // -- Licenses --
      { toolName: "addLicensePosition", args: { category: "D365 Business Central", product: "Essentials", quantity: 10, unitPrice: 70, discount: 0, optional: false }, result: { success: true, position: { category: "D365 Business Central", product: "Essentials", quantity: 10, unitPrice: 70, discount: 0, total: 700, optional: false } } },
      { toolName: "addLicensePosition", args: { category: "D365 Business Central", product: "Premium", quantity: 3, unitPrice: 100, discount: 0, optional: false }, result: { success: true, position: { category: "D365 Business Central", product: "Premium", quantity: 3, unitPrice: 100, discount: 0, total: 300, optional: false } } },
      { toolName: "addLicensePosition", args: { category: "D365 Business Central", product: "Team Member", quantity: 15, unitPrice: 8, discount: 0, optional: false }, result: { success: true, position: { category: "D365 Business Central", product: "Team Member", quantity: 15, unitPrice: 8, discount: 0, total: 120, optional: false } } },
      { toolName: "addLicensePosition", args: { category: "Power BI / Data Analytics", product: "Power BI Pro", quantity: 5, unitPrice: 10, discount: 0, optional: true }, result: { success: true, position: { category: "Power BI / Data Analytics", product: "Power BI Pro", quantity: 5, unitPrice: 10, discount: 0, total: 50, optional: true } } },

      // -- Services --
      { toolName: "addServicePosition", args: { category: "ERP EasyStarter", description: "EasyStarter Basis Setup", unit: "LT", quantity: 5, rate: 400, discount: 0, optional: false }, result: { success: true, position: { category: "ERP EasyStarter", description: "EasyStarter Basis Setup", unit: "LT", quantity: 5, rate: 400, discount: 0, total: 2000, optional: false } } },
      { toolName: "addServicePosition", args: { category: "ERP EasyStarter", description: "Schulung FIBU", unit: "LT", quantity: 2, rate: 400, discount: 0, optional: false }, result: { success: true, position: { category: "ERP EasyStarter", description: "Schulung FIBU", unit: "LT", quantity: 2, rate: 400, discount: 0, total: 800, optional: false } } },
      { toolName: "addServicePosition", args: { category: "ERP EasyStarter", description: "Schulung Warenwirtschaft", unit: "LT", quantity: 2, rate: 400, discount: 0, optional: false }, result: { success: true, position: { category: "ERP EasyStarter", description: "Schulung Warenwirtschaft", unit: "LT", quantity: 2, rate: 400, discount: 0, total: 800, optional: false } } },
      { toolName: "addServicePosition", args: { category: "DL ERP", description: "Projektumsetzung / Implementierung", unit: "LT", quantity: 15, rate: 400, discount: 0, optional: false }, result: { success: true, position: { category: "DL ERP", description: "Projektumsetzung / Implementierung", unit: "LT", quantity: 15, rate: 400, discount: 0, total: 6000, optional: false } } },
      { toolName: "addServicePosition", args: { category: "DL ERP", description: "Go-Live Begleitung", unit: "LT", quantity: 2, rate: 400, discount: 0, optional: false }, result: { success: true, position: { category: "DL ERP", description: "Go-Live Begleitung", unit: "LT", quantity: 2, rate: 400, discount: 0, total: 800, optional: false } } },
      { toolName: "addServicePosition", args: { category: "Projektkoordination", description: "Projektmanagement PM Base (15%)", unit: "LT", quantity: 4, rate: 400, discount: 0, optional: false }, result: { success: true, position: { category: "Projektkoordination", description: "Projektmanagement PM Base (15%)", unit: "LT", quantity: 4, rate: 400, discount: 0, total: 1600, optional: false } } },

      // -- Solutions --
      { toolName: "addSolutionPosition", args: { name: "Trade365", priceCategory: 3, additionalDl: 5 }, result: { success: true, position: { name: "Trade365", priceCategory: 3, flatRate: 2680, additionalDl: 5 } } },
      { toolName: "addSolutionPosition", args: { name: "NAVAX Intercompany Solution", priceCategory: 2, additionalDl: 3 }, result: { success: true, position: { name: "NAVAX Intercompany Solution", priceCategory: 2, flatRate: 1530, additionalDl: 3 } } },

      // -- Customer Service --
      { toolName: "addCustomerServicePosition", args: { packageName: "NAVAX Customer Service Essential", description: "Inkl. Ticketsystem, Wissensdatenbank, Updates", monthlyFee: 350, quantity: 1 }, result: { success: true, position: { package: "NAVAX Customer Service Essential", description: "Inkl. Ticketsystem, Wissensdatenbank, Updates", monthlyFee: 350, quantity: 1 } } },

      // -- Legal Terms --
      { toolName: "setLegalTerms", args: { nachlassLizenzenMs: 0, nachlassLizenzenNavax: 0, nachlassDl: 0, zahlungsfrist: "30 Tage" }, result: { success: true } },
    ]

    const responseText = [
      "Ich habe ein vollstaendiges Demo-Angebot fuer dich erstellt:",
      "",
      "**Kopfdaten:**",
      "- Kunde: **Alpentech Solutions GmbH**",
      "- Titel: **D365 Business Central Einfuehrung inkl. Trade365**",
      "- Verantwortlich: **Kinan Alexander**",
      "- Mandant: NAVAX Consulting (AT), Kostenstelle Wien",
      "- SaaS/Cloud, jaehrliche Abrechnung, Leistungstage",
      "",
      "**Lizenzen (4 Positionen):**",
      "- 10x Essentials = **700,00 EUR/Monat**",
      "- 3x Premium = **300,00 EUR/Monat**",
      "- 15x Team Member = **120,00 EUR/Monat**",
      "- 5x Power BI Pro = **50,00 EUR/Monat** (optional)",
      "",
      "**Dienstleistungen (6 Positionen):**",
      "- EasyStarter Basis Setup: 5 LT = **2.000,00 EUR**",
      "- Schulung FIBU: 2 LT = **800,00 EUR**",
      "- Schulung Warenwirtschaft: 2 LT = **800,00 EUR**",
      "- Projektumsetzung: 15 LT = **6.000,00 EUR**",
      "- Go-Live Begleitung: 2 LT = **800,00 EUR**",
      "- Projektmanagement PM Base: 4 LT = **1.600,00 EUR**",
      "",
      "**NAVAX Solutions (2 Positionen):**",
      "- Trade365: Pauschale **2.680,00 EUR** + 5 Tage DL",
      "- Intercompany Solution: Pauschale **1.530,00 EUR** + 3 Tage DL",
      "",
      "**Customer Service:**",
      "- Essential-Paket: **350,00 EUR/Monat**",
      "",
      "---",
      "",
      "**Gesamtuebersicht:**",
      "- Lizenzen: **1.170,00 EUR/Monat**",
      "- Dienstleistungen: **12.000,00 EUR** (einmalig)",
      "- Solutions: **4.210,00 EUR** (einmalig)",
      "- Customer Service: **350,00 EUR/Monat**",
      "",
      "Alle Pflichtfelder sind ausgefuellt! Klicke unten auf **\"Excel herunterladen\"** um die fertige Angebotskalkulation zu erhalten.",
    ].join("\n")

    return Response.json({ text: responseText, toolResults: demoToolResults })
  } catch (error) {
    return Response.json(
      { error: "Interner Serverfehler", details: String(error) },
      { status: 500 }
    )
  }
}
