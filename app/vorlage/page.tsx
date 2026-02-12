"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/ds/page-header"
import { FileUpload } from "@/components/ds/file-upload"
import { AlertBanner } from "@/components/ds/alert-banner"
import { StatusBadge } from "@/components/ds/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  saveTemplate,
  getTemplateMeta,
  removeTemplate,
} from "@/lib/store/quote-store"
import type { TemplateInfo } from "@/lib/store/types"
import {
  FileSpreadsheet,
  Trash2,
  Upload,
  CheckCircle2,
  Info,
} from "lucide-react"
import { toast } from "sonner"

export default function VorlagePage() {
  const [templateMeta, setTemplateMeta] = React.useState<Omit<
    TemplateInfo,
    "fileData"
  > | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  React.useEffect(() => {
    setTemplateMeta(getTemplateMeta())
  }, [])

  const handleFileUpload = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      toast.error("Bitte lade eine Excel-Datei (.xlsx) hoch.")
      return
    }

    setIsUploading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )

      const template: TemplateInfo = {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        sheetCount: 8, // NAVAX standard
        fieldCount: 150,
        fileData: base64,
      }

      saveTemplate(template)
      const { fileData: _, ...meta } = template
      setTemplateMeta(meta)
      toast.success("Vorlage erfolgreich hochgeladen!")
    } catch {
      toast.error("Fehler beim Hochladen der Vorlage.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveTemplate = () => {
    removeTemplate()
    setTemplateMeta(null)
    toast.success("Vorlage entfernt.")
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <PageHeader
            title="Excel-Vorlage verwalten"
            description="Lade deine Angebotskalkulations-Vorlage hoch. Diese wird als Basis fuer alle generierten Angebote verwendet."
          />

          <AlertBanner variant="muted" icon={<Info className="h-4 w-4" />}>
            <p>
              Die Vorlage muss nur einmal hochgeladen werden. Bei einer neuen
              Version kannst du die Datei einfach ersetzen.
            </p>
          </AlertBanner>

          {templateMeta ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-heading">
                    Aktuelle Vorlage
                  </CardTitle>
                  <StatusBadge status="success">Aktiv</StatusBadge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {templateMeta.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hochgeladen am{" "}
                        {new Date(templateMeta.uploadedAt).toLocaleDateString(
                          "de-AT",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">
                        Arbeitsblaetter
                      </p>
                      <p className="text-lg font-semibold font-mono text-foreground">
                        {templateMeta.sheetCount}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">
                        Felder (geschaetzt)
                      </p>
                      <p className="text-lg font-semibold font-mono text-foreground">
                        ~{templateMeta.fieldCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveTemplate}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Entfernen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">
                {templateMeta
                  ? "Vorlage ersetzen"
                  : "Vorlage hochladen"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".xlsx,.xls"
                label={
                  isUploading
                    ? "Wird hochgeladen..."
                    : templateMeta
                      ? "Neue Vorlage hochladen"
                      : "Angebotskalkulation.xlsx hochladen"
                }
                description="Excel-Datei (.xlsx) per Drag & Drop oder Klick hochladen"
                onFilesSelected={handleFileUpload}
              />
              {templateMeta && (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">
                    Die aktuelle Vorlage wird beim Hochladen einer neuen Datei automatisch ersetzt.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">
                Unterstuetzte Struktur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Zusammenfassung (Kopfdaten)",
                  "Angebotsanfrage INA",
                  "LIZ (Lizenzen)",
                  "DL (Dienstleistungen)",
                  "NX Solutions",
                  "CSV (Customer Service)",
                  "Legal & Commercial Terms",
                  "Reisekostenkalkulation",
                ].map((sheet) => (
                  <div
                    key={sheet}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 shrink-0 text-secondary" />
                    {sheet}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
