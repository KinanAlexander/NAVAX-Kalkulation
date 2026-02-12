"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Send, Mic, MicOff, Paperclip, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (text: string) => void
  onFileUpload?: (file: File) => void
  disabled?: boolean
  className?: string
}

export function ChatInput({ onSend, onFileUpload, disabled, className }: ChatInputProps) {
  const [input, setInput] = React.useState("")
  const [isListening, setIsListening] = React.useState(false)
  const [speechSupported, setSpeechSupported] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const recognitionRef = React.useRef<ReturnType<typeof createSpeechRecognition> | null>(null)

  React.useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition))
  }, [])

  function createSpeechRecognition() {
    const w = window as unknown as Record<string, unknown>
    const SpeechRecognition = (w.SpeechRecognition || w.webkitSpeechRecognition) as
      | (new () => SpeechRecognition)
      | undefined
    if (!SpeechRecognition) return null
    const recognition = new SpeechRecognition()
    recognition.lang = "de-DE"
    recognition.continuous = true
    recognition.interimResults = true
    return recognition
  }

  const toggleSpeech = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = createSpeechRecognition()
    if (!recognition) return

    recognitionRef.current = recognition

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ""
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput((prev) => {
        // Replace any previous speech content with updated transcript
        const base = prev.includes("[...]") ? prev.split("[...]")[0] : prev
        return base + transcript
      })
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-end gap-2 rounded-xl border border-border bg-card p-3", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Datei anhaengen"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,.csv"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Datei hochladen"
      />

      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onInput={handleTextareaInput}
        onKeyDown={handleKeyDown}
        placeholder="Beschreibe dein Meeting oder stelle eine Frage..."
        className="min-h-[36px] max-h-[200px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        rows={1}
        disabled={disabled}
      />

      {speechSupported && (
        <Button
          type="button"
          variant={isListening ? "default" : "ghost"}
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0",
            isListening
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={toggleSpeech}
          aria-label={isListening ? "Aufnahme stoppen" : "Spracheingabe starten"}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}

      <Button
        type="submit"
        size="icon"
        className="h-9 w-9 shrink-0"
        disabled={disabled || !input.trim()}
        aria-label="Nachricht senden"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  )
}
