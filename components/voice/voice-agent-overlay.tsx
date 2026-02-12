"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { VoiceOrb } from "./voice-orb"
import { Button } from "@/components/ui/button"
import { X, Mic, MicOff, Check } from "lucide-react"
import type { QuoteState } from "@/lib/store/types"

interface VoiceAgentOverlayProps {
  open: boolean
  onClose: () => void
  onQuoteReady: (quoteState: QuoteState, toolResults: Record<string, unknown>[]) => void
  quoteState: QuoteState
}

type Phase =
  | "ready"
  | "listening"
  | "processing"
  | "speaking"
  | "field-fill"
  | "complete"

interface FilledField {
  label: string
  value: string
  category: "header" | "license" | "service" | "solution" | "customerService"
}

export function VoiceAgentOverlay({
  open,
  onClose,
  onQuoteReady,
  quoteState,
}: VoiceAgentOverlayProps) {
  const [phase, setPhase] = React.useState<Phase>("ready")
  const [transcript, setTranscript] = React.useState("")
  const [agentText, setAgentText] = React.useState("")
  const [audioLevel, setAudioLevel] = React.useState(0)
  const [filledFields, setFilledFields] = React.useState<FilledField[]>([])
  const [visibleFieldCount, setVisibleFieldCount] = React.useState(0)

  const recognitionRef = React.useRef<SpeechRecognition | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const levelAnimRef = React.useRef<number>(0)

  const DEMO_FIELDS: FilledField[] = React.useMemo(
    () => [
      { label: "Unternehmen", value: "Alpentech Solutions GmbH", category: "header" },
      { label: "Angebotstitel", value: "D365 BC Einfuehrung inkl. Trade365", category: "header" },
      { label: "Verantwortlich", value: "Kinan Alexander", category: "header" },
      { label: "Mandant", value: "NAVAX Consulting (AT)", category: "header" },
      { label: "Kostenstelle", value: "Wien", category: "header" },
      { label: "Deployment", value: "SaaS/Cloud", category: "header" },
      { label: "Abrechnung", value: "Jaehrlich", category: "header" },
      { label: "Lizenz", value: "10x Essentials -- 700 EUR/Mo", category: "license" },
      { label: "Lizenz", value: "3x Premium -- 300 EUR/Mo", category: "license" },
      { label: "Lizenz", value: "15x Team Member -- 120 EUR/Mo", category: "license" },
      { label: "Lizenz", value: "5x Power BI Pro -- 50 EUR/Mo (opt.)", category: "license" },
      { label: "DL", value: "EasyStarter Basis Setup -- 5 LT", category: "service" },
      { label: "DL", value: "Schulung FIBU -- 2 LT", category: "service" },
      { label: "DL", value: "Schulung Warenwirtschaft -- 2 LT", category: "service" },
      { label: "DL", value: "Implementierung -- 15 LT", category: "service" },
      { label: "DL", value: "Go-Live Begleitung -- 2 LT", category: "service" },
      { label: "DL", value: "PM Base (15%) -- 4 LT", category: "service" },
      { label: "Solution", value: "Trade365 -- 2.680 EUR", category: "solution" },
      { label: "Solution", value: "Intercompany -- 1.530 EUR", category: "solution" },
      { label: "Service", value: "Essential -- 350 EUR/Mo", category: "customerService" },
    ],
    []
  )

  const startAudioLevel = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      function updateLevel() {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
        const avg = sum / dataArray.length / 255
        setAudioLevel(Math.min(avg * 2.5, 1))
        levelAnimRef.current = requestAnimationFrame(updateLevel)
      }
      updateLevel()
    } catch {
      function fakeLevel() {
        setAudioLevel(Math.random() * 0.5 + 0.1)
        levelAnimRef.current = requestAnimationFrame(fakeLevel)
      }
      fakeLevel()
    }
  }, [])

  const stopAudioLevel = React.useCallback(() => {
    cancelAnimationFrame(levelAnimRef.current)
    analyserRef.current = null
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setAudioLevel(0)
  }, [])

  React.useEffect(() => {
    if (!open) {
      stopAudioLevel()
      recognitionRef.current?.stop()
      speechSynthesis.cancel()
      setPhase("ready")
      setTranscript("")
      setAgentText("")
      setFilledFields([])
      setVisibleFieldCount(0)
    }
  }, [open, stopAudioLevel])

  const startListening = React.useCallback(async () => {
    setPhase("listening")
    setTranscript("")
    await startAudioLevel()

    const w = window as unknown as Record<string, unknown>
    const SpeechRecognitionClass = (w.SpeechRecognition || w.webkitSpeechRecognition) as
      | (new () => SpeechRecognition)
      | undefined

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass()
      recognition.lang = "de-DE"
      recognition.continuous = true
      recognition.interimResults = true
      recognitionRef.current = recognition

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let text = ""
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript
        }
        setTranscript(text)
      }

      recognition.onerror = () => {
        setTranscript(
          "Kunde Alpentech Solutions in Wien moechte Business Central einfuehren mit zehn Essentials Lizenzen und Trade365"
        )
      }
      recognition.start()
    } else {
      const demoText =
        "Kunde Alpentech Solutions in Wien moechte Business Central einfuehren mit zehn Essentials Lizenzen und Trade365"
      let i = 0
      const typeInterval = setInterval(() => {
        setTranscript(demoText.slice(0, i))
        i += 2
        if (i > demoText.length) clearInterval(typeInterval)
      }, 40)
    }
  }, [startAudioLevel])

  const stopListening = React.useCallback(() => {
    recognitionRef.current?.stop()
    stopAudioLevel()
    setPhase("processing")

    setTimeout(() => {
      setPhase("field-fill")
      setFilledFields(DEMO_FIELDS)
      setVisibleFieldCount(0)
    }, 2000)
  }, [stopAudioLevel, DEMO_FIELDS])

  React.useEffect(() => {
    if (phase !== "field-fill") return
    if (visibleFieldCount >= DEMO_FIELDS.length) {
      setTimeout(() => {
        setPhase("speaking")
        speakResponse()
      }, 600)
      return
    }

    const timer = setTimeout(() => {
      setVisibleFieldCount((prev) => prev + 1)
    }, 120)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, visibleFieldCount, DEMO_FIELDS.length])

  const speakResponse = () => {
    const text =
      "Ich habe das Angebot vollstaendig ausgefuellt. Alpentech Solutions bekommt zehn Essentials Lizenzen, drei Premium, und fuenfzehn Team Member. Dazu das EasyStarter Paket, Schulungen, und Trade 365. Das Excel ist bereit zum Download."

    setAgentText("")

    const words = text.split(" ")
    let wordIndex = 0
    const wordInterval = setInterval(() => {
      if (wordIndex >= words.length) {
        clearInterval(wordInterval)
        setTimeout(() => setPhase("complete"), 1000)
        return
      }
      setAgentText(words.slice(0, wordIndex + 1).join(" "))
      wordIndex++
    }, 80)

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "de-DE"
      utterance.rate = 1.0
      utterance.pitch = 1.0

      const voices = speechSynthesis.getVoices()
      const deVoice = voices.find((v) => v.lang.startsWith("de"))
      if (deVoice) utterance.voice = deVoice

      utterance.onstart = () => {
        const speakInterval = setInterval(() => {
          setAudioLevel(Math.random() * 0.4 + 0.2)
        }, 100)
        utterance.onend = () => {
          clearInterval(speakInterval)
          setAudioLevel(0)
        }
      }

      speechSynthesis.speak(utterance)
    }
  }

  const handleComplete = () => {
    onQuoteReady(quoteState, [])
    onClose()
  }

  if (!open) return null

  const showFieldPanel = phase === "field-fill" || phase === "speaking" || phase === "complete"

  const categoryColors: Record<string, string> = {
    header: "bg-primary/15 text-primary border-primary/20",
    license: "bg-info/15 text-info border-info/20",
    service: "bg-secondary/15 text-secondary border-secondary/20",
    solution: "bg-warning/15 text-warning border-warning/20",
    customerService: "bg-success/15 text-success border-success/20",
  }

  const categoryLabels: Record<string, string> = {
    header: "Kopfdaten",
    license: "Lizenzen",
    service: "Dienstleistungen",
    solution: "Solutions",
    customerService: "Customer Service",
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              phase === "listening" && "bg-primary animate-pulse",
              phase === "processing" && "bg-warning animate-pulse",
              phase === "speaking" && "bg-secondary animate-pulse",
              phase === "field-fill" && "bg-secondary animate-pulse",
              phase === "complete" && "bg-success",
              phase === "ready" && "bg-muted-foreground/40"
            )}
          />
          <span className="text-sm font-medium text-muted-foreground">
            {phase === "ready" && "Bereit -- Klicke auf den Orb um zu starten"}
            {phase === "listening" && "Ich hoere zu..."}
            {phase === "processing" && "Analysiere Meeting-Notizen..."}
            {phase === "field-fill" && "Fuelle Angebot aus..."}
            {phase === "speaking" && "Agent spricht..."}
            {phase === "complete" && "Angebot vollstaendig!"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Left: Orb + Transcript */}
        <div className={cn(
          "flex flex-col items-center justify-center gap-6 px-8 py-6 overflow-y-auto scrollbar-thin",
          showFieldPanel ? "h-[45vh] lg:h-auto lg:flex-1" : "flex-1"
        )}>
          {/* Orb */}
          <button
            onClick={() => {
              if (phase === "ready") startListening()
              else if (phase === "listening") stopListening()
            }}
            className={cn(
              "relative cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0",
              (phase !== "ready" && phase !== "listening") && "pointer-events-none"
            )}
            aria-label={phase === "ready" ? "Aufnahme starten" : phase === "listening" ? "Aufnahme stoppen" : "Agent verarbeitet"}
          >
            <VoiceOrb
              state={
                phase === "listening"
                  ? "listening"
                  : phase === "processing" || phase === "field-fill"
                    ? "processing"
                    : phase === "speaking"
                      ? "speaking"
                      : "idle"
              }
              audioLevel={audioLevel}
            />
            {(phase === "ready" || phase === "listening") && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {phase === "ready" ? (
                  <Mic className="h-10 w-10 text-white/70" />
                ) : (
                  <MicOff className="h-10 w-10 text-white/90" />
                )}
              </div>
            )}
          </button>

          {/* Transcript / Agent text */}
          <div className="w-full max-w-lg text-center shrink-0">
            {phase === "listening" && transcript && (
              <p className="text-lg text-foreground leading-relaxed animate-in fade-in">
                {'"'}{transcript}{'"'}
              </p>
            )}
            {phase === "listening" && !transcript && (
              <p className="text-sm text-muted-foreground">
                Sprich jetzt -- beschreibe dein Kundenmeeting...
              </p>
            )}
            {phase === "processing" && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Analysiere Eingabe und erstelle Angebotskalkulation...
              </p>
            )}
            {(phase === "speaking" || phase === "complete") && agentText && (
              <p className="text-base text-foreground leading-relaxed">
                {agentText}
              </p>
            )}
          </div>
        </div>

        {/* Right: Live field fill panel */}
        {showFieldPanel && (
          <div className="flex flex-col flex-1 lg:flex-none lg:w-96 min-h-0 border-t lg:border-t-0 lg:border-l border-border bg-card/50 animate-in slide-in-from-right duration-500">
            {/* Scrollable fields */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 font-heading">
                Erkannte Felder
              </h3>

              {["header", "license", "service", "solution", "customerService"].map((cat) => {
                const visibleFields = DEMO_FIELDS.filter(
                  (f, i) => f.category === cat && i < visibleFieldCount
                )
                if (visibleFields.length === 0) return null

                return (
                  <div key={cat} className="mb-4">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[cat]}
                    </span>
                    <div className="mt-1.5 flex flex-col gap-1.5">
                      {visibleFields.map((field, i) => (
                        <div
                          key={`${cat}-${i}`}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs animate-in fade-in slide-in-from-left duration-300",
                            categoryColors[cat]
                          )}
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <Check className="h-3 w-3 shrink-0" />
                          <span className="font-medium">{field.label}:</span>
                          <span className="truncate opacity-80">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {phase === "complete" && (
                <div className="mt-4 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span className="font-semibold">{visibleFieldCount} Felder ausgefuellt</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky bottom button */}
            {phase === "complete" && (
              <div className="shrink-0 border-t border-border p-4 bg-card">
                <Button
                  size="lg"
                  onClick={handleComplete}
                  className="w-full gap-2 rounded-xl"
                >
                  <Check className="h-5 w-5" />
                  Angebot uebernehmen
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
