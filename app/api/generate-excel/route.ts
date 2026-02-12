import type { QuoteState } from "@/lib/store/types"

// NAVAX brand colors
const NAVAX_MAGENTA = "FF79217A"
const NAVAX_DARK = "FF1A1A2E"
const WHITE = "FFFFFFFF"
const LIGHT_GRAY = "FFF5F5F5"
const MEDIUM_GRAY = "FFE0E0E0"
const DARK_TEXT = "FF333333"

function sectionHeaderStyle(): Partial<import("exceljs").Style> {
  return {
    font: { bold: true, size: 11, color: { argb: WHITE } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: NAVAX_MAGENTA } },
    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
    border: {
      bottom: { style: "thin", color: { argb: MEDIUM_GRAY } },
    },
  }
}

function subHeaderStyle(): Partial<import("exceljs").Style> {
  return {
    font: { bold: true, size: 10, color: { argb: NAVAX_DARK } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } },
    alignment: { horizontal: "left", vertical: "middle", wrapText: true },
    border: {
      bottom: { style: "thin", color: { argb: MEDIUM_GRAY } },
    },
  }
}

function dataStyle(): Partial<import("exceljs").Style> {
  return {
    font: { size: 10, color: { argb: DARK_TEXT } },
    alignment: { vertical: "middle", wrapText: true },
    border: {
      bottom: { style: "hair", color: { argb: MEDIUM_GRAY } },
    },
  }
}

function currencyFormat(value: number): string {
  return value.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC"
}

export async function POST(req: Request) {
  try {
    const { quoteState } = (await req.json()) as { quoteState: QuoteState }
    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "NAVAX Angebotskalkulation"
    workbook.created = new Date()

    const hStyle = sectionHeaderStyle()
    const shStyle = subHeaderStyle()
    const dStyle = dataStyle()

    // ===== Sheet 1: Zusammenfassung =====
    const ws1 = workbook.addWorksheet("Zusammenfassung", {
      properties: { defaultColWidth: 20 },
    })

    // Title row
    ws1.mergeCells("A1:H1")
    const titleCell = ws1.getCell("A1")
    titleCell.value = "Angebotskalkulation"
    titleCell.font = { bold: true, size: 16, color: { argb: NAVAX_MAGENTA } }
    titleCell.alignment = { horizontal: "left", vertical: "middle" }

    ws1.mergeCells("A2:H2")
    ws1.getCell("A2").value = `f\u00FCr: ${quoteState.header.unternehmensname || "xxx"} am: ${quoteState.header.eingereichtAm || new Date().toLocaleDateString("de-AT")} Version: V1.0`
    ws1.getCell("A2").font = { size: 10, color: { argb: DARK_TEXT } }

    // Header fields section
    const headerData: [string, string, string][] = [
      ["Eingereicht von:", quoteState.header.eingereichtVon || "", ""],
      ["Eingereicht am:", quoteState.header.eingereichtAm || new Date().toLocaleDateString("de-AT"), ""],
      ["Unternehmensname", quoteState.header.unternehmensname || "", "PFLICHTFELD"],
      ["Verk. an CRM (Link zur Firma)", quoteState.header.verkaufAnCrmLink || "", ""],
      ["Verk. an Debitornr. (INA)", quoteState.header.debitornrIna || "", "PFLICHTFELD"],
      ["Sprache", quoteState.header.sprache || "DE", "PFLICHTFELD"],
      ["Projektnr. (INA)", quoteState.header.projektnr || "", "PFLICHTFELD"],
      ["Projektart", quoteState.header.projektart || "", ""],
      ["Kostenstelle (KST)", quoteState.header.kostenstelle || "", ""],
      ["Kostentr\u00E4ger (KTR)", quoteState.header.kostentraeger || "", ""],
      ["Projektverantwortlich (PV)", quoteState.header.projektverantwortlicher || "", "PFLICHTFELD"],
      ["Angebot im Mandant", quoteState.header.angebotImMandant || "", ""],
      ["Ansprechpartner Kunde", quoteState.header.ansprechpartnerKunde || "", ""],
      ["Angebot g\u00FCltig bis", quoteState.header.angebotGueltigBis || "", "PFLICHTFELD"],
      ['Registerkarte "DL" (Einheit)', quoteState.header.registerkarteDlEinheit || "", "PFLICHTFELD"],
      ["Lizenzart", quoteState.header.lizenzart || "", "PFLICHTFELD"],
      ["Lizenzabrechnung (Intervall)", quoteState.header.lizenzabrechnung || "", ""],
      ["Angebotstitel", quoteState.header.angebotstitel || "", ""],
    ]

    ws1.columns = [
      { width: 35 }, { width: 40 }, { width: 15 },
      { width: 5 },
      { width: 22 }, { width: 22 }, { width: 22 },
      { width: 15 },
    ]

    let row = 4
    headerData.forEach(([label, value, tag]) => {
      const r = ws1.getRow(row)
      r.getCell(1).value = label
      r.getCell(1).font = { bold: true, size: 10, color: { argb: DARK_TEXT } }
      r.getCell(2).value = value
      r.getCell(2).font = { size: 10, color: { argb: DARK_TEXT } }
      if (tag === "PFLICHTFELD") {
        r.getCell(3).value = "PFLICHTFELD"
        r.getCell(3).font = { bold: true, size: 9, color: { argb: "FFCC0000" } }
      }
      row++
    })

    // Summary table
    row += 2
    const licenseTotal = quoteState.licenses.reduce((sum, l) => sum + l.total, 0)
    const serviceTotal = quoteState.services.reduce((sum, s) => sum + s.total, 0)
    const solutionTotal = quoteState.solutions.reduce((sum, s) => sum + s.flatRate, 0)
    const csvMonthly = quoteState.customerService.reduce((sum, c) => sum + c.monthlyFee * c.quantity, 0)

    // Summary header
    const sumHeaders = ["", "Monatliche Geb\u00FChren", "Einmalige Geb\u00FChren", "J\u00E4hrliche Geb\u00FChren"]
    const sumRow = ws1.getRow(row)
    sumHeaders.forEach((h, i) => {
      sumRow.getCell(i + 4).value = h
      Object.assign(sumRow.getCell(i + 4).style, hStyle)
    })
    row++

    const summaryRows: [string, number, number, number][] = [
      ["Lizenzen", 0, 0, licenseTotal],
      ["Dienstleistungen", 0, serviceTotal + solutionTotal, 0],
      ["NAVAX Customer Service", csvMonthly, 0, 0],
    ]

    summaryRows.forEach(([label, monthly, oneTime, yearly]) => {
      const r = ws1.getRow(row)
      r.getCell(4).value = label
      r.getCell(4).font = { bold: true, size: 10 }
      r.getCell(5).value = monthly > 0 ? currencyFormat(monthly) : "-"
      r.getCell(6).value = oneTime > 0 ? currencyFormat(oneTime) : "-"
      r.getCell(7).value = yearly > 0 ? currencyFormat(yearly) : "-"
      ;[5, 6, 7].forEach(c => { r.getCell(c).alignment = { horizontal: "right" } })
      row++
    })

    // Grand total
    const totalR = ws1.getRow(row)
    totalR.getCell(4).value = "Gesamtsumme"
    totalR.getCell(4).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
    totalR.getCell(5).value = csvMonthly > 0 ? currencyFormat(csvMonthly) : "-"
    totalR.getCell(6).value = (serviceTotal + solutionTotal) > 0 ? currencyFormat(serviceTotal + solutionTotal) : "-"
    totalR.getCell(7).value = licenseTotal > 0 ? currencyFormat(licenseTotal) : "-"
    ;[5, 6, 7].forEach(c => {
      totalR.getCell(c).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
      totalR.getCell(c).alignment = { horizontal: "right" }
    })
    totalR.getCell(4).border = { top: { style: "medium", color: { argb: NAVAX_MAGENTA } } }
    totalR.getCell(5).border = { top: { style: "medium", color: { argb: NAVAX_MAGENTA } } }
    totalR.getCell(6).border = { top: { style: "medium", color: { argb: NAVAX_MAGENTA } } }
    totalR.getCell(7).border = { top: { style: "medium", color: { argb: NAVAX_MAGENTA } } }

    row += 2
    ws1.getRow(row).getCell(4).value = "Bei einer Mindestvertragslaufzeit von 12 Monaten und j\u00E4hrlicher Zahlung im Voraus (Lizenzen)."
    ws1.getRow(row).getCell(4).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws1.mergeCells(row, 4, row, 7)
    row++
    ws1.getRow(row).getCell(4).value = "Ohne optionale Positionen."
    ws1.getRow(row).getCell(4).font = { italic: true, size: 9, color: { argb: "FF666666" } }

    // Preisliste section
    row += 3
    ws1.getRow(row).getCell(1).value = "NAVAX Preisliste f\u00FCr DL 01.01.2025 - 31.12.2026"
    ws1.getRow(row).getCell(1).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
    ws1.mergeCells(row, 1, row, 3)
    row++

    const priceHeaders = ws1.getRow(row)
    priceHeaders.getCell(1).value = ""
    priceHeaders.getCell(2).value = "h/Satz"
    priceHeaders.getCell(3).value = "d/Satz"
    ;[1, 2, 3].forEach(c => Object.assign(priceHeaders.getCell(c).style, hStyle))
    row++

    const priceData: [string, string, string, string][] = [
      ["ERP & CRM:", "", "", ""],
      ["", "Consultant & Developer", "50 \u20AC", "400 \u20AC"],
      ["", "Senior Consultant / Senior Developer", "50 \u20AC", "400 \u20AC"],
      ["", "Lead Consultant", "50 \u20AC", "400 \u20AC"],
      ["", "Industry Lead", "50 \u20AC", "400 \u20AC"],
      ["Business Intelligence", "", "", ""],
      ["", "Consultant", "50 \u20AC", "400 \u20AC"],
      ["", "Product Lead", "50 \u20AC", "400 \u20AC"],
      ["AI Consulting", "", "", ""],
      ["", "AI Consulting", "50 \u20AC", "400 \u20AC"],
      ["Sonstige Services", "", "", ""],
      ["", "Projektkoordinator", "50 \u20AC", "400 \u20AC"],
      ["", "Projektmanager", "50 \u20AC", "400 \u20AC"],
      ["", "Licensing Consulting", "50 \u20AC", "400 \u20AC"],
      ["", "Licensing Solution Architect", "50 \u20AC", "400 \u20AC"],
    ]

    priceData.forEach(([cat, role, hRate, dRate]) => {
      const r = ws1.getRow(row)
      if (cat && !role) {
        r.getCell(1).value = cat
        r.getCell(1).font = { bold: true, size: 10, color: { argb: NAVAX_DARK } }
        Object.assign(r.getCell(1).style, shStyle)
        ws1.mergeCells(row, 1, row, 3)
      } else {
        r.getCell(1).value = role
        r.getCell(1).font = { size: 10 }
        r.getCell(2).value = hRate
        r.getCell(2).alignment = { horizontal: "right" }
        r.getCell(3).value = dRate
        r.getCell(3).alignment = { horizontal: "right" }
      }
      row++
    })

    row++
    ws1.getRow(row).getCell(1).value = "Reisezeiten: pro angefangener Reisestunde gem. Stundensatz-Kategorien"
    ws1.getRow(row).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws1.mergeCells(row, 1, row, 3)
    row++
    ws1.getRow(row).getCell(1).value = "Reisekosten: PKW 0,80 \u20AC / Km - Weitere Verkehrsmittel nach Aufwand"
    ws1.getRow(row).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws1.mergeCells(row, 1, row, 3)

    // ===== Sheet 2: Angebotsanfrage INA =====
    const ws2 = workbook.addWorksheet("Angebotsanfrage INA")
    ws2.columns = [
      { header: "", width: 5 },
      { header: "Art", width: 15 },
      { header: "Beschreibung", width: 50 },
      { header: "Menge", width: 10 },
      { header: "Einheit", width: 12 },
      { header: "VK-Preis\nEinzelpreis\n(unrabattiert)", width: 18 },
      { header: "VK-Preis\nSumme\n(unrabattiert)", width: 18 },
      { header: "Rabatt\n%", width: 10 },
      { header: "Abrechnung\n(fix, variabel, pauschal)", width: 20 },
    ]
    ws2.getRow(1).eachCell((cell) => Object.assign(cell.style, hStyle))
    ws2.getRow(1).height = 40

    // Standard text note
    const noteRow = ws2.addRow(["", "", 'Hinweis: Untenstehend sind die Standard Textbausteine "Allgemein", "Abonnement", "Managed Service" und "Unterschrift"'])
    noteRow.getCell(3).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws2.mergeCells(noteRow.number, 3, noteRow.number, 9)

    // Add 20 empty rows for INA
    for (let i = 0; i < 20; i++) {
      const r = ws2.addRow(["", "", "", "", "", "- \u20AC", "- \u20AC", "", ""])
      r.eachCell(c => Object.assign(c.style, dStyle))
    }

    // Standard text blocks
    const textBlocks = [
      { title: "ALLG - Allgemein", items: [
        "Variable Dienstleistungen",
        "Lizenzen",
        "Stundenkontingent - Laufzeit & Leistungsumfang",
        "Schulung",
        "Projektkoordination",
        "Reisezeiten",
        "Reisekosten und \u00DCbernachtungen",
      ]},
      { title: "ABO - Abonnements", items: [
        "Laufzeiten & Fristen",
        "Lizenzbestimmungen",
        "Abrechnung Abonnements",
        "AGB",
      ]},
      { title: "MAS - Managed Service", items: [
        "Allgemeine Informationen",
        "Dauer & Umfang der Dienstleistungen",
        "Index-Anpassung",
        "Einschleifphase",
        "AGB",
      ]},
      { title: "Unterschriftsfeld", items: [
        "Wir bitten um firmenm\u00E4\u00DFige Zeichnung und R\u00FCcksendung an salessupport@navax.com.",
      ]},
    ]

    ws2.addRow([])
    textBlocks.forEach(block => {
      const headerR = ws2.addRow(["", "", block.title])
      Object.assign(headerR.getCell(3).style, shStyle)
      ws2.mergeCells(headerR.number, 3, headerR.number, 9)
      block.items.forEach(item => {
        const r = ws2.addRow(["", "", item])
        r.getCell(3).font = { size: 9, color: { argb: "FF666666" } }
      })
      ws2.addRow([])
    })

    // ===== Sheet 3: LIZ (Lizenzen) =====
    const ws3 = workbook.addWorksheet("LIZ")
    ws3.columns = [
      { width: 45 },  // Product
      { width: 8 },   // St\u00FCck
      { width: 15 },  // Einzelpreis
      { width: 8 },   // %
      { width: 15 },  // Summe
      { width: 15 },  // opt. Summe
      { width: 15 },  // Artikelnr.
    ]

    const lizSections = [
      {
        title: "Dynamics 365 Business Central",
        subtitle: "Monatliche Geb\u00FChren",
        headers: ["", "St\u00FCck", "Einzelpreis", "%", "Summe", "opt. Summe", "Artikelnr."],
        products: [
          "Dynamics 365 Business Central Essentials User",
          "Dynamics 365 Business Central Premium User",
          "Dynamics 365 Business Central Team Member",
          "Business Central Device",
          "Business Central External Accountant",
          "Business Central Additional Environment AddOn",
          "Business Central Database Capacity",
        ],
      },
      {
        title: "Dynamics 365 Business Central Apps",
        subtitle: "NAVAX AppSource Apps",
        headers: ["", "St\u00FCck", "Einzelpreis", "%", "Summe", "opt. Summe", ""],
        products: [
          "NCEX Extension Base",
          "NCDT Document Text",
          "NAVAX Zahlungsverkehr Import",
          "NAVAX Zahlungsverkehr Export",
          "Excel Report Builder",
          "NAVAX G/L Application",
          "NAVAX Bilanz",
          "NCCA Kostenrechnung",
          "NAVAX Automatic Order Matching",
          "E-Document - ebInterface",
          "NAVAX konfipay Connector Import",
          "NAVAX konfipay Connector Export",
        ],
      },
      {
        title: "Dynamics 365 Customer Experience",
        subtitle: "",
        headers: ["", "St\u00FCck", "Einzelpreis", "%", "Summe", "opt. Summe", ""],
        products: [
          "Dynamics 365 Sales Professional User",
          "Dynamics 365 Sales Enterprise Edition User",
          "Dynamics 365 Sales Premium User",
          "Dynamics 365 Customer Service Professional",
          "Dynamics 365 Customer Service Enterprise",
          "Dynamics 365 Field Service User",
        ],
      },
      {
        title: "Power BI Lizenzen | Packages | Azure",
        subtitle: "",
        headers: ["", "St\u00FCck", "Einzelpreis", "%", "Summe", "opt. Summe", ""],
        products: [
          "Power BI Pro User",
          "Power BI Premium User",
          "Microsoft Azure (Richtwert)",
          "NAVAX Power BI Data Warehouse (DWH)",
          "NAVAX Power BI Package Finanzen (inkl. 1 Mandant)",
          "NAVAX Power BI Package Verkauf (inkl. 1 Mandant)",
        ],
      },
      {
        title: "DCP (DocumentsCorePack)",
        subtitle: "J\u00E4hrliche Geb\u00FChren",
        headers: ["", "St\u00FCck", "Einzelpreis", "%", "Summe", "opt. Summe", ""],
        products: [
          "DCP Extra Small (1-10 users)",
          "DCP Small (11-30 users)",
          "DCP Medium (31 - 80 users)",
          "DCP Large (81 - 140 users)",
          "DCP Enterprise (600 + users)",
        ],
      },
    ]

    const noteR = ws3.addRow(["HINWEIS: Alle Preise gelten nur f\u00FCr Laufzeit von 12 Monaten und j\u00E4hrlicher Zahlung im Voraus"])
    noteR.getCell(1).font = { bold: true, size: 9, color: { argb: "FFCC0000" } }
    ws3.mergeCells(1, 1, 1, 7)
    ws3.addRow([])

    lizSections.forEach(section => {
      // Section title
      const titleR = ws3.addRow([section.title])
      Object.assign(titleR.getCell(1).style, { font: { bold: true, size: 12, color: { argb: NAVAX_MAGENTA } } })
      ws3.mergeCells(titleR.number, 1, titleR.number, 7)

      if (section.subtitle) {
        const subR = ws3.addRow([section.subtitle])
        subR.getCell(1).font = { bold: true, size: 10, color: { argb: NAVAX_DARK } }
        ws3.mergeCells(subR.number, 1, subR.number, 7)
      }

      // Column headers
      const hdrR = ws3.addRow(section.headers)
      hdrR.eachCell(c => Object.assign(c.style, hStyle))

      // Products - fill from quoteState if matching
      section.products.forEach(product => {
        const match = quoteState.licenses.find(l =>
          l.product.toLowerCase().includes(product.toLowerCase().substring(0, 20)) ||
          product.toLowerCase().includes(l.product.toLowerCase().substring(0, 20))
        )
        const r = ws3.addRow([
          product,
          match ? match.quantity : 0,
          match ? currencyFormat(match.unitPrice) : "8,50",
          match ? `${match.discount}%` : "",
          match ? currencyFormat(match.total) : "- \u20AC",
          "",
          match?.articleNr || "",
        ])
        r.eachCell(c => Object.assign(c.style, dStyle))
        r.getCell(2).alignment = { horizontal: "center" }
        r.getCell(3).alignment = { horizontal: "right" }
        r.getCell(5).alignment = { horizontal: "right" }
      })

      // Subtotal
      const subTotalR = ws3.addRow(["Zwischensumme", "", "", "", "- \u20AC", "- \u20AC", ""])
      subTotalR.getCell(1).font = { bold: true, size: 10 }
      Object.assign(subTotalR.getCell(1).style, shStyle)
      ws3.addRow([])
    })

    // License totals
    ws3.addRow([])
    const lizSumHeaders = [
      ["Lizenzen", "Summe | Monatliche Geb\u00FChren"],
      ["Lizenzen", "Summe | Einmalige Geb\u00FChren"],
      ["Lizenzen", "Summe | J\u00E4hrliche Geb\u00FChren"],
    ]
    lizSumHeaders.forEach(([cat, label]) => {
      const r = ws3.addRow([`${cat} - ${label}`, "", "", "", currencyFormat(licenseTotal), "", ""])
      r.getCell(1).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
      r.getCell(5).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
      r.getCell(5).alignment = { horizontal: "right" }
    })

    // ===== Sheet 4: DL (Dienstleistungen) =====
    const ws4 = workbook.addWorksheet("DL")
    ws4.columns = [
      { width: 50 },  // Description
      { width: 8 },   // St\u00FCck/LT
      { width: 15 },  // Einzelpreis/Preis
      { width: 8 },   // %
      { width: 15 },  // Summe
      { width: 15 },  // opt. Summe
      { width: 15 },  // Artikelnr.
    ]

    ws4.addRow(["HINWEIS: Alle Preise gelten nur f\u00FCr Laufzeit von 12 Monaten und j\u00E4hrlicher Zahlung im Voraus"])
    ws4.getRow(1).getCell(1).font = { bold: true, size: 9, color: { argb: "FFCC0000" } }
    ws4.mergeCells(1, 1, 1, 7)
    ws4.addRow([])

    // ERP EasyStarter section
    const dlSections = [
      {
        title: "Dienstleistungen - Einmalige Geb\u00FChren",
        groups: [
          {
            name: "ERP EasyStarter",
            items: [
              "ERP EasyStarter Basis Setup",
              "Grundschulung BC Administration",
              "Grundschulung Warenwirtschaft (Einkauf, Verkauf, Lager)",
              "Grundschulung Finanzbuchhaltung",
              "Daten\u00FCbernahme Support",
              "Belegset (zzgl. App NCDT Document Text)",
              "Schulung FIBU Plus",
              "Schulung Anlagen",
              "Schulung Zahlungsverkehr",
              "Schulung Kostenrechnung",
              "Schulung Projekt",
              "Schulung Logistik",
              "Schulung Produktion",
              "Schulung Berechtigungen",
              "Schulung Workflow",
            ],
          },
          {
            name: "NAVAX Packages ERP",
            items: [
              "Sprechstundenpaket (8 h)",
              "Transformation (Upgrade)",
              "Easy ERP Transformation Package",
              "Comfort ERP Transformation",
              "Supreme ERP Transformation",
            ],
          },
          {
            name: "Dienstleistungen ERP (nach Aufwand)",
            items: quoteState.services
              .filter(s => s.category === "ERP" || s.category === "Dienstleistungen ERP")
              .map(s => s.description),
          },
          {
            name: "Dienstleistungen Data Analytics",
            items: [
              "Power BI Package Business Activation",
              "Individuelle Anpassung und Erweiterung des DWH",
              "Individuelle Anpassung und Erweiterungen Power BI",
            ],
          },
          {
            name: "Dienstleistungen AI (nach Aufwand)",
            items: [
              "KI Einf\u00FChrung (1 h Vortrag, online)",
              "KI Workshop (1 LT, vor Ort) zzgl. Reisekosten",
              "KI Pilot exkl. Infrastruktur (Azure Services)",
              "KI Schulung Technologie - KI Grundlagen (Entry)",
              "KI Schulung Technologie - M365 Copilot",
            ],
          },
          {
            name: "Dienstleistungen CRM (nach Aufwand)",
            items: [
              "Systemeinrichtung CRM Umgebung",
              "Prozessbereiche (L\u00F6sungskonzept)",
              "Rollen & Berechtigungen",
              "Daten\u00FCbernahme",
              "Administrator Schulung",
              "Go-Live Betreuung",
            ],
          },
        ],
      },
    ]

    dlSections.forEach(section => {
      const tR = ws4.addRow([section.title])
      tR.getCell(1).font = { bold: true, size: 12, color: { argb: NAVAX_MAGENTA } }
      ws4.mergeCells(tR.number, 1, tR.number, 7)

      const colHdr = ws4.addRow(["", "St\u00FCck", "Einzelpreis", "%", "Summe", "opt. Summe", "Artikelnr."])
      colHdr.eachCell(c => Object.assign(c.style, hStyle))

      section.groups.forEach(group => {
        const gR = ws4.addRow([group.name])
        Object.assign(gR.getCell(1).style, shStyle)
        ws4.mergeCells(gR.number, 1, gR.number, 7)

        group.items.forEach(item => {
          const match = quoteState.services.find(s =>
            s.description.toLowerCase().includes(item.toLowerCase().substring(0, 15)) ||
            item.toLowerCase().includes(s.description.toLowerCase().substring(0, 15))
          )
          const r = ws4.addRow([
            item,
            match ? match.quantity : 0,
            match ? currencyFormat(match.rate) : "10,00",
            match ? `${match.discount}%` : "",
            match ? currencyFormat(match.total) : "- \u20AC",
            "",
            "",
          ])
          r.eachCell(c => Object.assign(c.style, dStyle))
          r.getCell(2).alignment = { horizontal: "center" }
          r.getCell(3).alignment = { horizontal: "right" }
          r.getCell(5).alignment = { horizontal: "right" }
        })

        const stR = ws4.addRow(["Zwischensumme", "", "", "", "- \u20AC", "- \u20AC", ""])
        stR.getCell(1).font = { bold: true, size: 10 }
        Object.assign(stR.getCell(1).style, shStyle)
        ws4.addRow([])
      })
    })

    // Projektkoordination
    const pkR = ws4.addRow(["Projektkoordination"])
    pkR.getCell(1).font = { bold: true, size: 12, color: { argb: NAVAX_MAGENTA } }
    ws4.mergeCells(pkR.number, 1, pkR.number, 7)
    const pkH = ws4.addRow(["", "Pau.", "Preis", "%", "Summe", "opt. Summe", ""])
    pkH.eachCell(c => Object.assign(c.style, hStyle))
    ;["Projektkoordination PM Light (11 %)", "Projektkoordination PM Base (15 %)", "Projektkoordination PM Prime (20 %)"].forEach(pk => {
      const r = ws4.addRow([pk, 0, "", "", "- \u20AC", "", ""])
      r.eachCell(c => Object.assign(c.style, dStyle))
    })
    ws4.addRow(["*Leistungstag = 8 Stunden"]).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }

    // DL Totals
    ws4.addRow([])
    const dlTotalR = ws4.addRow(["Dienstleistungen - Summe | Einmalige Geb\u00FChren", "", "", "", currencyFormat(serviceTotal), "", ""])
    dlTotalR.getCell(1).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
    dlTotalR.getCell(5).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
    dlTotalR.getCell(5).alignment = { horizontal: "right" }

    // ===== Sheet 5: NX Solutions =====
    const ws5 = workbook.addWorksheet("NX Solutions")
    ws5.columns = [
      { width: 45 }, { width: 12 }, { width: 15 }, { width: 8 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 }, { width: 12 }, { width: 15 },
    ]

    ws5.addRow(["NAVAX Solutions - Einmalige Geb\u00FChren"])
    ws5.getRow(1).getCell(1).font = { bold: true, size: 12, color: { argb: NAVAX_MAGENTA } }
    ws5.mergeCells(1, 1, 1, 10)

    ws5.addRow(["Dynamics 365 Business Central NAVAX Solutions"])
    ws5.getRow(2).getCell(1).font = { bold: true, size: 10, color: { argb: NAVAX_DARK } }
    ws5.mergeCells(2, 1, 2, 10)

    const nxH = ws5.addRow(["", "Pauschale", "Einzelpreis", "%", "Summe", "opt. Summe", "Artikelnr.", "Preiskategorie", "Status", "zzgl. DL"])
    nxH.eachCell(c => Object.assign(c.style, hStyle))

    // Add all NAVAX Solutions from PDF
    const nxSolutions = [
      { name: "NVXSQA Swiss QR Billing", cat: 0, art: "NVX000127" },
      { name: "NVXDIV Default Item Variant", cat: 1, art: "NVX000029" },
      { name: "NVXCVG Customer Vendor Group", cat: 1, art: "NVX000059" },
      { name: "NVXAIC Advanced Item Copy", cat: 1, art: "NVX000014" },
      { name: "NVXAPO Adapt Production Order", cat: 1, art: "NVX000016" },
      { name: "NVXEANC EAN Check", cat: 1, art: "NVX000031" },
      { name: "NVXEIT Extended Item Tracking Code", cat: 1, art: "NVX000033" },
      { name: "NVXEP Extended Pages GL", cat: 1, art: "NVX000034" },
      { name: "NVXEPI Extended Pages Inventory", cat: 1, art: "NVX000035" },
      { name: "NVXEPM Extended Pages Manufacturing", cat: 1, art: "NVX000036" },
      { name: "NVXEPP Extended Pages Purchase", cat: 1, art: "NVX000037" },
      { name: "NVXEPR Extended Phys. Inventory", cat: 1, art: "NVX000038" },
      { name: "NVXEPS Extended Pages Sales", cat: 1, art: "NVX000039" },
      { name: "NVXGAN GL Account Name 2", cat: 1, art: "NVX000044" },
      { name: "NVXVMA Variant Mandatory", cat: 1, art: "NVX000049" },
      { name: "NVXEXTE Extended Email", cat: 1, art: "NVX000076" },
      { name: "NVXECL Entry Comment Line", cat: 2, art: "NVX000122" },
      { name: "NVXRPE Reminder per Entry", cat: 2, art: "NVX000053" },
      { name: "NVXIR Inventory Reports", cat: 2, art: "NVX000015" },
      { name: "NVXDISC Discounts 1 - 3", cat: 2, art: "NVX000023" },
      { name: "NVXAPM Advanced Price Management", cat: 2, art: "NVX000025" },
      { name: "NVXBR Batch Release", cat: 2, art: "NVX000041" },
      { name: "NVXCCLC Customer Credit Limit Check", cat: 2, art: "NVX000042" },
      { name: "NVXDMT Data Migration Tool", cat: 3, art: "NVX000021" },
      { name: "NVXEDI EDI Interface", cat: 4, art: "NVX000067" },
      { name: "NVXOSC Ondot ShippingNet Connector", cat: 4, art: "NVX000019" },
    ]

    const priceCats: Record<number, string> = { 0: "kostenfrei", 1: "540,00 \u20AC", 2: "1.530,00 \u20AC", 3: "2.680,00 \u20AC", 4: "auf Anfrage" }

    nxSolutions.forEach(sol => {
      const match = quoteState.solutions.find(s =>
        s.name.toLowerCase().includes(sol.name.toLowerCase().substring(0, 10)) ||
        sol.name.toLowerCase().includes(s.name.toLowerCase().substring(0, 10))
      )
      const price = priceCats[sol.cat] || "auf Anfrage"
      const r = ws5.addRow([
        sol.name,
        match ? match.flatRate : 0,
        price,
        "",
        match ? currencyFormat(match.flatRate) : "- \u20AC",
        "",
        sol.art,
        sol.cat,
        "",
        "",
      ])
      r.eachCell(c => Object.assign(c.style, dStyle))
    })

    ws5.addRow([])
    ws5.addRow(["Preiskategorie 1", "", "540,00 \u20AC"]).getCell(1).font = { bold: true, size: 10 }
    ws5.addRow(["Preiskategorie 2", "", "1.530,00 \u20AC"]).getCell(1).font = { bold: true, size: 10 }
    ws5.addRow(["Preiskategorie 3", "", "2.680,00 \u20AC"]).getCell(1).font = { bold: true, size: 10 }
    ws5.addRow(["Preiskategorie 4", "", "auf Anfrage"]).getCell(1).font = { bold: true, size: 10 }
    ws5.addRow(["Hinweis: PM ist im Solution Price inkl. - muss nicht prozentual mitberechnet werden"]).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }

    const nxTotalR = ws5.addRow(["NAVAX Solutions - Summe | Einmalige Geb\u00FChren", "", "", "", currencyFormat(solutionTotal)])
    nxTotalR.getCell(1).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
    nxTotalR.getCell(5).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }

    // ===== Sheet 6: CSV (Customer Service) =====
    const ws6 = workbook.addWorksheet("CSV")
    ws6.columns = [
      { width: 50 }, { width: 8 }, { width: 18 }, { width: 8 },
      { width: 15 }, { width: 15 }, { width: 15 },
    ]

    ws6.addRow(["NAVAX Customer Service - Monatliche Geb\u00FChren"])
    ws6.getRow(1).getCell(1).font = { bold: true, size: 12, color: { argb: NAVAX_MAGENTA } }
    ws6.mergeCells(1, 1, 1, 7)

    ws6.addRow(["Grundpakete"])
    ws6.getRow(2).getCell(1).font = { bold: true, size: 10, color: { argb: NAVAX_DARK } }

    const csvH = ws6.addRow(["", "St\u00FCck", "Einzelpreis", "%", "Summe", "opt. Summe", "Artikelnr."])
    csvH.eachCell(c => Object.assign(c.style, hStyle))

    const csvProducts = [
      { name: "Essential", price: "300,00 \u20AC", art: "S000071", note: "1 Customer Service Portal User" },
      { name: "Premium inkl. Managed Service 8 h / Monat", price: "2.000,00 \u20AC", art: "S000072+S000073", note: "2 Customer Service Portal User, 8 Std. Managed Service pro Monat" },
    ]

    csvProducts.forEach(prod => {
      const match = quoteState.customerService.find(c =>
        c.package.toLowerCase().includes(prod.name.toLowerCase().substring(0, 8))
      )
      const r = ws6.addRow([
        prod.name,
        match ? match.quantity : 0,
        prod.price,
        "",
        match ? currencyFormat(match.monthlyFee * match.quantity) : "- \u20AC",
        "",
        prod.art,
      ])
      r.eachCell(c => Object.assign(c.style, dStyle))
    })

    ws6.addRow([])
    const addSvcH = ws6.addRow(["Zus\u00E4tzliche Services"])
    addSvcH.getCell(1).font = { bold: true, size: 10, color: { argb: NAVAX_DARK } }
    const addH = ws6.addRow(["", "St\u00FCck", "Einzelpreis", "", "Summe", "opt. Summe", "Artikelnr."])
    addH.eachCell(c => Object.assign(c.style, hStyle))

    const addServices = [
      { name: "Upgrademanagement Service (ERP SaaS) | pro Umgebung", price: "100,00 \u20AC", art: "S000066" },
      { name: "Weitere Customer Service Portal User | 2 Personen", price: "100,00 \u20AC", art: "S000068" },
      { name: "Fernwartungsserver (onPrem only)", price: "100,00 \u20AC", art: "" },
      { name: "Archivierung und Bereithaltung der Software (onPrem only)", price: "Auf Anfrage", art: "S000065" },
    ]

    addServices.forEach(svc => {
      const r = ws6.addRow([svc.name, 0, svc.price, "", "- \u20AC", "", svc.art])
      r.eachCell(c => Object.assign(c.style, dStyle))
    })

    ws6.addRow([])
    const csvTotalR = ws6.addRow(["NAVAX Customer Service - Summe | Monatliche Geb\u00FChren", "", "", "", currencyFormat(csvMonthly)])
    csvTotalR.getCell(1).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }
    csvTotalR.getCell(5).font = { bold: true, size: 11, color: { argb: NAVAX_MAGENTA } }

    // ===== Sheet 7: Legal & Commercial Term Sheet =====
    const ws7 = workbook.addWorksheet("Legal")
    ws7.columns = [{ width: 45 }, { width: 60 }]

    ws7.addRow(["Legal & Commercial Term Sheet"])
    ws7.getRow(1).getCell(1).font = { bold: true, size: 12, color: { argb: NAVAX_MAGENTA } }
    ws7.mergeCells(1, 1, 1, 2)
    ws7.addRow(["Stand 20.01.2025"]).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws7.addRow([])

    const legalTopics: [string, string[]][] = [
      ["Nachl\u00E4sse Lizenzen", [
        `Microsoft Lizenzen: bis zu ${quoteState.legalTerms.nachlassLizenzenMs || 1} % Nachlass m\u00F6glich`,
        `NAVAX Lizenzen: bis zu ${quoteState.legalTerms.nachlassLizenzenNavax || 1.5} % Nachlass m\u00F6glich`,
        "Partner Lizenzen: Kein Nachlass",
      ]],
      ["Nachl\u00E4sse Dienstleistungen", [
        `NAVAX DL: bis zu ${quoteState.legalTerms.nachlassDl || 5} % Nachlass auf den aktuell g\u00FCltigen DL-Listenpreis als Zeilenrabatt direkt im Auftrag`,
        "Partner DL: Kein Nachlass",
      ]],
      ["Reisekosten / \u00DCberstunden, Sonn-/Feiertagsarbeit", [
        "Bevorzugt sind online Termine",
        "Reisekostenpauschale kann verhandelt werden, wenn Gesamtprojekt ab Volumen von 5 k \u20AC.",
      ]],
      ["Verrechnungsmodalit\u00E4ten / Zahlungsfristen", [
        "Anzahlung von 20% obligatorisch",
        `Zahlungsfrist: ${quoteState.legalTerms.zahlungsfrist || "per Rechnungserhalt"}`,
        "Kein Skonto m\u00F6glich",
        "Verl\u00E4ngerung der Zahlungsfrist auf 7 Tage ab RE bei Projektvolumen ab 10.000 \u20AC",
        "Verl\u00E4ngerung der Zahlungsfrist auf 14 Tage ab RE bei Projektvolumen ab 50.000 \u20AC",
        "Verl\u00E4ngerung der Zahlungsfrist auf 31 Tage ab RE ab Projektvolumen ab 100.000 \u20AC",
      ]],
      ["Gew\u00E4hrleistung", [
        "Ausdehnung der Gew\u00E4hrleistungsfrist von 6 Monaten auf maximal 12 Monate bei PL DL-Volumen von mind. 50 k \u20AC m\u00F6glich",
      ]],
      ["Haftungsvolumen inkl. Haftungsausschluss", [
        "Haftung f\u00FCr max. 10% des Projektvolumens ab DL-Projektvolumen von 50 k \u20AC",
        "KEIN Spielraum bei Haftung f\u00FCr herstellerseitige Sch\u00E4den (MS) sowie etwaiger Partnerl\u00F6sungen",
      ]],
      ["Indexierung", ["Abweichung von ITKV auf VPI zul\u00E4ssig"]],
    ]

    legalTopics.forEach(([topic, details]) => {
      const topicR = ws7.addRow([topic])
      Object.assign(topicR.getCell(1).style, shStyle)
      ws7.mergeCells(topicR.number, 1, topicR.number, 2)
      details.forEach(d => {
        const r = ws7.addRow(["", d])
        r.getCell(2).font = { size: 10, color: { argb: DARK_TEXT } }
        r.getCell(2).alignment = { wrapText: true }
      })
      ws7.addRow([])
    })

    // ===== Sheet 8: Reisekostenkalkulation =====
    const ws8 = workbook.addWorksheet("Reisekostenkalkulation")
    ws8.columns = [{ width: 35 }, { width: 25 }, { width: 25 }]

    ws8.addRow(["Reisekostenkalkulation"])
    ws8.getRow(1).getCell(1).font = { bold: true, size: 12, color: { argb: NAVAX_MAGENTA } }
    ws8.mergeCells(1, 1, 1, 3)

    ws8.addRow(["Standard gem. NAVAX DL-Preisliste"]).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws8.addRow(["Reisezeiten: pro angefangener Reisestunde gem. Stundensatz-Kategorien"]).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws8.addRow(["Reisekosten: PKW 0,80 \u20AC / Km - Weitere Verkehrsmittel nach Aufwand"]).getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } }
    ws8.addRow([])

    const travelData: [string, string][] = [
      ["Startort:", quoteState.travelCosts.startort || "xxxx"],
      ["Zielort:", quoteState.travelCosts.zielort || "xxxx"],
      ["Kilometer lt. Google Maps", String(quoteState.travelCosts.kilometer || 0)],
      ["Reisekosten: PKW 0,80 \u20AC / Km", currencyFormat((quoteState.travelCosts.kilometer || 0) * 0.80)],
      ["Kunden Stundensatz:", "295,00 \u20AC"],
      ["Gesamtsumme Reisekosten (einfach):", currencyFormat((quoteState.travelCosts.kilometer || 0) * 0.80)],
      ["Hin- & R\u00FCckfahrt:", currencyFormat((quoteState.travelCosts.kilometer || 0) * 0.80 * 2)],
    ]

    travelData.forEach(([label, value]) => {
      const r = ws8.addRow([label, value])
      r.getCell(1).font = { bold: true, size: 10, color: { argb: DARK_TEXT } }
      r.getCell(2).font = { size: 10, color: { argb: DARK_TEXT } }
      r.getCell(2).alignment = { horizontal: "right" }
    })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    const filename = `Angebotskalkulation_${(quoteState.header.unternehmensname || "Entwurf").replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, "_")}.xlsx`

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Excel generation error:", error)
    return NextResponse.json({ error: "Excel-Generierung fehlgeschlagen" }, { status: 500 })
  }
}
