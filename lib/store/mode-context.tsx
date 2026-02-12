"use client"

import * as React from "react"

type AppMode = "demo" | "live"

interface ModeContextValue {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

const ModeContext = React.createContext<ModeContextValue>({
  mode: "demo",
  setMode: () => {},
})

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<AppMode>("demo")
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return React.useContext(ModeContext)
}
