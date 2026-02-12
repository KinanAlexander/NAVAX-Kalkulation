"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface VoiceOrbProps {
  state: "idle" | "listening" | "processing" | "speaking"
  audioLevel?: number // 0-1
  className?: string
}

export function VoiceOrb({ state, audioLevel = 0, className }: VoiceOrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const animRef = React.useRef<number>(0)
  const timeRef = React.useRef(0)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 280
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const baseRadius = 80

    function draw() {
      if (!ctx) return
      timeRef.current += 0.015
      const t = timeRef.current

      ctx.clearRect(0, 0, size, size)

      // Dynamic radius based on state and audio
      let radiusMultiplier = 1
      let pulseSpeed = 1
      let glowIntensity = 0.3

      if (state === "listening") {
        radiusMultiplier = 1 + audioLevel * 0.35
        pulseSpeed = 2
        glowIntensity = 0.4 + audioLevel * 0.3
      } else if (state === "processing") {
        radiusMultiplier = 1 + Math.sin(t * 3) * 0.15
        pulseSpeed = 3
        glowIntensity = 0.5
      } else if (state === "speaking") {
        radiusMultiplier = 1 + audioLevel * 0.25
        pulseSpeed = 1.5
        glowIntensity = 0.5 + audioLevel * 0.2
      }

      const radius = baseRadius * radiusMultiplier

      // Outer glow rings
      for (let i = 3; i > 0; i--) {
        const ringRadius = radius + i * 18 + Math.sin(t * pulseSpeed + i) * 6
        const alpha = glowIntensity * (0.08 / i)
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.fillStyle =
          state === "listening"
            ? `hsla(299, 57%, 30%, ${alpha})`
            : state === "processing"
              ? `hsla(38, 92%, 50%, ${alpha})`
              : state === "speaking"
                ? `hsla(180, 100%, 22%, ${alpha})`
                : `hsla(299, 57%, 30%, ${alpha * 0.5})`
        ctx.fill()
      }

      // Main orb with morphing shape
      const points = 128
      ctx.beginPath()
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2
        const noise1 = Math.sin(angle * 3 + t * pulseSpeed) * (state === "idle" ? 2 : 4 + audioLevel * 8)
        const noise2 = Math.cos(angle * 5 + t * 1.7) * (state === "idle" ? 1 : 3 + audioLevel * 5)
        const noise3 = Math.sin(angle * 7 + t * 2.3) * (state === "idle" ? 0.5 : 2 + audioLevel * 3)
        const r = radius + noise1 + noise2 + noise3
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      // Gradient fill
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius * 1.3
      )

      if (state === "listening") {
        gradient.addColorStop(0, "hsla(299, 70%, 55%, 0.95)")
        gradient.addColorStop(0.5, "hsla(299, 57%, 35%, 0.9)")
        gradient.addColorStop(1, "hsla(299, 57%, 20%, 0.85)")
      } else if (state === "processing") {
        const shift = (Math.sin(t * 2) + 1) / 2
        gradient.addColorStop(0, `hsla(${38 + shift * 20}, 92%, 55%, 0.95)`)
        gradient.addColorStop(0.5, `hsla(${30 + shift * 30}, 80%, 40%, 0.9)`)
        gradient.addColorStop(1, `hsla(${299 - shift * 60}, 57%, 30%, 0.85)`)
      } else if (state === "speaking") {
        gradient.addColorStop(0, "hsla(180, 80%, 40%, 0.95)")
        gradient.addColorStop(0.5, "hsla(180, 100%, 28%, 0.9)")
        gradient.addColorStop(1, "hsla(299, 50%, 30%, 0.85)")
      } else {
        gradient.addColorStop(0, "hsla(299, 50%, 45%, 0.7)")
        gradient.addColorStop(0.5, "hsla(299, 57%, 30%, 0.6)")
        gradient.addColorStop(1, "hsla(299, 57%, 20%, 0.5)")
      }

      ctx.fillStyle = gradient
      ctx.fill()

      // Inner highlight
      const innerGradient = ctx.createRadialGradient(
        centerX - radius * 0.2,
        centerY - radius * 0.25,
        0,
        centerX,
        centerY,
        radius * 0.7
      )
      innerGradient.addColorStop(0, "hsla(0, 0%, 100%, 0.25)")
      innerGradient.addColorStop(1, "hsla(0, 0%, 100%, 0)")
      ctx.fillStyle = innerGradient
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [state, audioLevel])

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <canvas
        ref={canvasRef}
        className="transition-transform duration-300"
        style={{ width: 280, height: 280 }}
      />
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {state === "processing" && (
          <svg className="h-8 w-8 animate-spin text-white/80" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
      </div>
    </div>
  )
}
