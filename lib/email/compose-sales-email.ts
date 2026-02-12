import type { QuoteState } from "@/lib/store/types"

/**
 * Builds a mailto: link for sending the quote summary to Sales Support.
 * Subject = Angebotstitel, body = structured summary asking sales-support
 * to create the official PDF offer.
 */
export function composeSalesEmail(
  quoteState: QuoteState,
  salesEmail = "sales-support@navax.com"
): string {
  const h = quoteState.header
  const title = h.angebotstitel || "Angebotskalkulation"
  const customer = h.unternehmensname || "Kunde"

  const subject = encodeURIComponent(
    `Angebotskalkulation: ${title} - ${customer}`
  )

  const licenseSummary = quoteState.licenses.length > 0
    ? quoteState.licenses
        .map(
          (l) =>
            `  - ${l.product} (${l.quantity}x) - ${l.total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}${l.discount > 0 ? ` (${l.discount}% Rabatt)` : ""}`
        )
        .join("\n")
    : "  Keine Lizenzen"

  const serviceSummary = quoteState.services.length > 0
    ? quoteState.services
        .map(
          (s) =>
            `  - ${s.description} (${s.quantity} ${s.unit}) - ${s.total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}${s.discount > 0 ? ` (${s.discount}% Rabatt)` : ""}`
        )
        .join("\n")
    : "  Keine Dienstleistungen"

  const solutionSummary = quoteState.solutions.length > 0
    ? quoteState.solutions
        .map(
          (s) =>
            `  - ${s.name} (Preiskategorie ${s.priceCategory}) - ${s.flatRate.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}`
        )
        .join("\n")
    : "  Keine NX Solutions"

  const csSummary = quoteState.customerService.length > 0
    ? quoteState.customerService
        .map(
          (c) =>
            `  - ${c.package}: ${c.description} - ${c.monthlyFee.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}/Monat`
        )
        .join("\n")
    : "  Kein Customer Service"

  const licTotal = quoteState.licenses.reduce((sum, l) => sum + l.total, 0)
  const dlTotal = quoteState.services.reduce((sum, s) => sum + s.total, 0)
  const solTotal = quoteState.solutions.reduce((sum, s) => sum + s.flatRate, 0)
  const csMonthly = quoteState.customerService.reduce((sum, c) => sum + c.monthlyFee * c.quantity, 0)
  const grandTotal = licTotal + dlTotal + solTotal

  const body = encodeURIComponent(
    `Hallo Sales-Support Team,

anbei die Zusammenfassung der Angebotskalkulation. Bitte erstellt daraus das offizielle Angebot im NAVAX PDF-Format.

Die ausgefuellte Excel-Datei ist diesem E-Mail als Anhang beigefuegt.

============================================
ANGEBOTSKALKULATION - ZUSAMMENFASSUNG
============================================

Kunde: ${customer}
Angebotstitel: ${title}
Mandant: ${h.angebotImMandant || "-"}
Sprache: ${h.sprache || "-"}
Kostenstelle: ${h.kostenstelle || "-"}
Kostentraeger: ${h.kostentraeger || "-"}
Projektverantwortlicher: ${h.projektverantwortlicher || "-"}
Lizenzart: ${h.lizenzart || "-"}
Lizenzabrechnung: ${h.lizenzabrechnung || "-"}
Angebot gueltig bis: ${h.angebotGueltigBis || "-"}
Ansprechpartner Kunde: ${h.ansprechpartnerKunde || "-"}

--------------------------------------------
LIZENZEN (${quoteState.licenses.length} Positionen)
--------------------------------------------
${licenseSummary}
Zwischensumme Lizenzen: ${licTotal.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}

--------------------------------------------
DIENSTLEISTUNGEN (${quoteState.services.length} Positionen)
--------------------------------------------
${serviceSummary}
Zwischensumme Dienstleistungen: ${dlTotal.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}

--------------------------------------------
NX SOLUTIONS (${quoteState.solutions.length} Positionen)
--------------------------------------------
${solutionSummary}
Zwischensumme Solutions: ${solTotal.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}

--------------------------------------------
NAVAX CUSTOMER SERVICE
--------------------------------------------
${csSummary}
Monatliche Gebuehren: ${csMonthly.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}/Monat

============================================
GESAMTSUMME (einmalig): ${grandTotal.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
Monatliche Gebuehren: ${csMonthly.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}/Monat
============================================

Bitte das offizielle Angebot im NAVAX PDF-Format erstellen und zur Freigabe zuruecksenden.

Vielen Dank!
${h.projektverantwortlicher || h.eingereichtVon || ""}
`
  )

  return `mailto:${salesEmail}?subject=${subject}&body=${body}`
}
