import { NextResponse } from "next/server"
import type { QuoteState } from "@/lib/store/types"

export async function POST(req: Request) {
  try {
    const { quoteState } = (await req.json()) as { quoteState: QuoteState }

    // Dynamic import to avoid bundling issues
    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()

    // ── Sheet 1: Zusammenfassung ──
    const summary = workbook.addWorksheet("Zusammenfassung")
    summary.columns = [
      { header: "Feld", key: "field", width: 30 },
      { header: "Wert", key: "value", width: 50 },
    ]

    // Header styles
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 11, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF79217A" } },
      alignment: { horizontal: "left", vertical: "middle" },
    }

    summary.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    const headerFields = [
      ["Eingereicht von", quoteState.header.eingereichtVon || ""],
      ["Eingereicht am", quoteState.header.eingereichtAm || new Date().toLocaleDateString("de-AT")],
      ["Unternehmensname", quoteState.header.unternehmensname || ""],
      ["Verk. an CRM Link", quoteState.header.verkaufAnCrmLink || ""],
      ["Debitornr. (INA)", quoteState.header.debitornrIna || ""],
      ["Sprache", quoteState.header.sprache || "DE"],
      ["Projektnr.", quoteState.header.projektnr || ""],
      ["Projektart", quoteState.header.projektart || ""],
      ["Kostenstelle", quoteState.header.kostenstelle || ""],
      ["Kostentraeger", quoteState.header.kostentraeger || ""],
      ["Projektverantwortlicher", quoteState.header.projektverantwortlicher || ""],
      ["Angebot im Mandant", quoteState.header.angebotImMandant || ""],
      ["Ansprechpartner Kunde", quoteState.header.ansprechpartnerKunde || ""],
      ["Angebot gueltig bis", quoteState.header.angebotGueltigBis || ""],
      ["Registerkarte DL (Einheit)", quoteState.header.registerkarteDlEinheit || ""],
      ["Lizenzart", quoteState.header.lizenzart || ""],
      ["Lizenzabrechnung", quoteState.header.lizenzabrechnung || ""],
      ["Angebotstitel", quoteState.header.angebotstitel || ""],
    ]

    headerFields.forEach(([field, value]) => {
      summary.addRow({ field, value })
    })

    // Add summary totals
    summary.addRow({})
    const summaryHeader = summary.addRow({ field: "ZUSAMMENFASSUNG", value: "" })
    summaryHeader.getCell(1).style = {
      font: { bold: true, size: 12 },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E8E8" } },
    }

    const licenseTotal = quoteState.licenses.reduce((sum, l) => sum + l.total, 0)
    const serviceTotal = quoteState.services.reduce((sum, s) => sum + s.total, 0)
    const solutionTotal = quoteState.solutions.reduce((sum, s) => sum + s.flatRate, 0)
    const csvTotal = quoteState.customerService.reduce((sum, c) => sum + c.monthlyFee * c.quantity, 0)
    const grandTotal = licenseTotal + serviceTotal + solutionTotal

    summary.addRow({ field: "Lizenzen (gesamt)", value: `${licenseTotal.toFixed(2)} EUR` })
    summary.addRow({ field: "Dienstleistungen (gesamt)", value: `${serviceTotal.toFixed(2)} EUR` })
    summary.addRow({ field: "NAVAX Solutions (gesamt)", value: `${solutionTotal.toFixed(2)} EUR` })
    summary.addRow({ field: "Customer Service (monatl.)", value: `${csvTotal.toFixed(2)} EUR/Monat` })
    summary.addRow({})
    const totalRow = summary.addRow({ field: "GESAMTSUMME (einmalig)", value: `${grandTotal.toFixed(2)} EUR` })
    totalRow.getCell(1).font = { bold: true, size: 12 }
    totalRow.getCell(2).font = { bold: true, size: 12 }

    // ── Sheet 2: Angebotsanfrage INA ──
    const ina = workbook.addWorksheet("Angebotsanfrage INA")
    ina.columns = [
      { header: "Pos.", key: "pos", width: 8 },
      { header: "Art", key: "art", width: 15 },
      { header: "Beschreibung", key: "beschreibung", width: 50 },
      { header: "Menge", key: "menge", width: 10 },
      { header: "Einheit", key: "einheit", width: 10 },
      { header: "VK-Preis Einzelpreis", key: "einzelpreis", width: 20 },
      { header: "VK-Preis Summe", key: "summe", width: 18 },
      { header: "Rabatt %", key: "rabatt", width: 10 },
      { header: "Abrechnung", key: "abrechnung", width: 15 },
    ]
    ina.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    // ── Sheet 3: LIZ (Lizenzen) ──
    const liz = workbook.addWorksheet("LIZ")
    liz.columns = [
      { header: "Kategorie", key: "category", width: 25 },
      { header: "Produkt", key: "product", width: 40 },
      { header: "Stueck", key: "quantity", width: 10 },
      { header: "Einzelpreis EUR", key: "unitPrice", width: 18 },
      { header: "Rabatt %", key: "discount", width: 10 },
      { header: "Summe EUR", key: "total", width: 15 },
      { header: "Optional", key: "optional", width: 10 },
      { header: "Artikelnr.", key: "articleNr", width: 15 },
    ]
    liz.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    quoteState.licenses.forEach((license, i) => {
      liz.addRow({
        category: license.category,
        product: license.product,
        quantity: license.quantity,
        unitPrice: license.unitPrice,
        discount: license.discount,
        total: license.total,
        optional: license.optional ? "ja" : "",
        articleNr: license.articleNr,
      })
    })

    // ── Sheet 4: DL (Dienstleistungen) ──
    const dl = workbook.addWorksheet("DL")
    dl.columns = [
      { header: "Kategorie", key: "category", width: 25 },
      { header: "Beschreibung", key: "description", width: 45 },
      { header: "Einheit", key: "unit", width: 10 },
      { header: "Anzahl", key: "quantity", width: 10 },
      { header: "Satz EUR", key: "rate", width: 15 },
      { header: "Rabatt %", key: "discount", width: 10 },
      { header: "Summe EUR", key: "total", width: 15 },
      { header: "Optional", key: "optional", width: 10 },
    ]
    dl.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    quoteState.services.forEach((service) => {
      dl.addRow({
        category: service.category,
        description: service.description,
        unit: service.unit,
        quantity: service.quantity,
        rate: service.rate,
        discount: service.discount,
        total: service.total,
        optional: service.optional ? "ja" : "",
      })
    })

    // ── Sheet 5: NX Solutions ──
    const nx = workbook.addWorksheet("NX Solutions")
    nx.columns = [
      { header: "Solution", key: "name", width: 45 },
      { header: "Preiskategorie", key: "priceCategory", width: 15 },
      { header: "Pauschale EUR", key: "flatRate", width: 15 },
      { header: "zzgl. DL (Tage)", key: "additionalDl", width: 15 },
      { header: "Artikelnr.", key: "articleNr", width: 15 },
    ]
    nx.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    quoteState.solutions.forEach((solution) => {
      nx.addRow({
        name: solution.name,
        priceCategory: solution.priceCategory,
        flatRate: solution.flatRate > 0 ? solution.flatRate : "auf Anfrage",
        additionalDl: solution.additionalDl,
        articleNr: solution.articleNr,
      })
    })

    // ── Sheet 6: CSV (Customer Service) ──
    const csv = workbook.addWorksheet("CSV")
    csv.columns = [
      { header: "Paket", key: "package", width: 25 },
      { header: "Beschreibung", key: "description", width: 45 },
      { header: "Monatl. Gebuehr EUR", key: "monthlyFee", width: 20 },
      { header: "Anzahl", key: "quantity", width: 10 },
    ]
    csv.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    quoteState.customerService.forEach((cs) => {
      csv.addRow({
        package: cs.package,
        description: cs.description,
        monthlyFee: cs.monthlyFee,
        quantity: cs.quantity,
      })
    })

    // ── Sheet 7: Legal & Commercial Terms ──
    const legal = workbook.addWorksheet("Legal")
    legal.columns = [
      { header: "Bedingung", key: "field", width: 35 },
      { header: "Wert", key: "value", width: 30 },
    ]
    legal.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    legal.addRow({ field: "Nachlass Lizenzen (MS)", value: `${quoteState.legalTerms.nachlassLizenzenMs || 0}%` })
    legal.addRow({ field: "Nachlass Lizenzen (NAVAX)", value: `${quoteState.legalTerms.nachlassLizenzenNavax || 0}%` })
    legal.addRow({ field: "Nachlass DL", value: `${quoteState.legalTerms.nachlassDl || 0}%` })
    legal.addRow({ field: "Zahlungsfrist", value: quoteState.legalTerms.zahlungsfrist || "30 Tage" })

    // ── Sheet 8: Reisekostenkalkulation ──
    const travel = workbook.addWorksheet("Reisekostenkalkulation")
    travel.columns = [
      { header: "Feld", key: "field", width: 30 },
      { header: "Wert", key: "value", width: 30 },
    ]
    travel.getRow(1).eachCell((cell) => {
      Object.assign(cell.style, headerStyle)
    })

    travel.addRow({ field: "Startort", value: quoteState.travelCosts.startort || "" })
    travel.addRow({ field: "Zielort", value: quoteState.travelCosts.zielort || "" })
    travel.addRow({ field: "Kilometer", value: quoteState.travelCosts.kilometer || 0 })
    travel.addRow({ field: "Kosten PKW (0,80 EUR/km)", value: ((quoteState.travelCosts.kilometer || 0) * 0.8).toFixed(2) + " EUR" })

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Angebotskalkulation_${quoteState.header.unternehmensname || "Entwurf"}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Excel generation error:", error)
    return NextResponse.json({ error: "Excel-Generierung fehlgeschlagen" }, { status: 500 })
  }
}
