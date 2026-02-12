"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { VoiceOrb } from "./voice-orb"
import { Button } from "@/components/ui/button"
import { X, Mic, MicOff, Send } from "lucide-react"

interface VoiceAgentOverlayProps {
  open: boolean
  onClose: () => void
  onSendMessage: (text: string) => void
}

type Phase = "ready" | "listening" | "done"

export function VoiceAgentOverlay({
  open,
  onClose,
  onSendMessage,
}: VoiceAgentOverlayProps) {
  const [phase, setPhase] = React.useState<Phase>("ready")
  const [transcript, setTranscript] = React.useState("")
  const [audioLevel, setAudioLevel] = React.useState(0)

  const recognitionRef = React.useRef<SpeechRecognition | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const levelAnimRef = React.useRef<number>(0)

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
      // Fallback: fake audio level
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

  // Reset state when overlay closes
  React.useEffect(() => {
    if (!open) {
      stopAudioLevel()
      recognitionRef.current?.stop()
      setPhase("ready")
      setTranscript("")
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
        // On error, just stop listening
        stopListeningOnly()
      }

      recognition.onend = () => {
        // Speech recognition ended naturally (e.g. silence timeout)
        stopAudioLevel()
        setPhase((prev) => (prev === "listening" ? "done" : prev))
      }

      recognition.start()
    } else {
      // No SpeechRecognition available
      stopAudioLevel()
      setPhase("ready")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAudioLevel, stopAudioLevel])

  const stopListeningOnly = React.useCallback(() => {
    recognitionRef.current?.stop()
    stopAudioLevel()
    setPhase("done")
  }, [stopAudioLevel])

  const handleSend = React.useCallback(() => {
    const text = transcript.trim()
    if (!text) return
    onSendMessage(text)
    onClose()
  }, [transcript, onSendMessage, onClose])

  const handleOrbClick = React.useCallback(() => {
    if (phase === "ready") {
      startListening()
    } else if (phase === "listening") {
      stopListeningOnly()
    } else if (phase === "done") {
      // Restart listening
      startListening()
    }
  }, [phase, startListening, stopListeningOnly])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              phase === "listening" && "bg-primary animate-pulse",
              phase === "done" && "bg-success",
              phase === "ready" && "bg-muted-foreground/40"
            )}
          />
          <span className="text-sm font-medium text-muted-foreground">
            {phase === "ready" && "Bereit -- Klicke auf den Orb um zu starten"}
            {phase === "listening" && "Ich hoere zu..."}
            {phase === "done" && "Aufnahme beendet -- Nachricht absenden oder erneut aufnehmen"}
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
      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-6 px-8 py-6">
        {/* Orb */}
        <button
          onClick={handleOrbClick}
          className="relative cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
          aria-label={
            phase === "ready"
              ? "Aufnahme starten"
              : phase === "listening"
                ? "Aufnahme stoppen"
                : "Erneut aufnehmen"
          }
        >
          <VoiceOrb
            state={phase === "listening" ? "listening" : "idle"}
            audioLevel={audioLevel}
          />
          {(phase === "ready" || phase === "listening" || phase === "done") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {phase === "listening" ? (
                <MicOff className="h-10 w-10 text-white/90" />
              ) : (
                <Mic className="h-10 w-10 text-white/70" />
              )}
            </div>
          )}
        </button>

        {/* Transcript */}
        <div className="w-full max-w-lg text-center shrink-0">
          {phase === "listening" && transcript && (
            <p className="text-lg text-foreground leading-relaxed animate-in fade-in">
              {'"'}{transcript}{'"'}
            </p>
          )}
          {phase === "listening" && !transcript && (
            <p className="text-sm text-muted-foreground">
              Sprich jetzt -- beschreibe was du brauchst...
            </p>
          )}
          {phase === "done" && transcript && (
            <p className="text-lg text-foreground leading-relaxed">
              {'"'}{transcript}{'"'}
            </p>
          )}
          {phase === "done" && !transcript && (
            <p className="text-sm text-muted-foreground">
              Keine Sprache erkannt. Klicke auf den Orb um es erneut zu versuchen.
            </p>
          )}
        </div>

        {/* Send button */}
        {phase === "done" && transcript.trim() && (
          <Button
            size="lg"
            onClick={handleSend}
            className="gap-2 rounded-xl animate-in fade-in slide-in-from-bottom duration-300"
          >
            <Send className="h-5 w-5" />
            Nachricht absenden
          </Button>
        )}
      </div>
    </div>
  )
}
