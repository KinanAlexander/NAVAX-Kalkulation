import React from "react"
import type { Metadata } from 'next'
import { Inter, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { ModeProvider } from "@/lib/store/mode-context"
import { Toaster } from "sonner"

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _heading = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading' })
const _mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'NAVAX Angebotskalkulation',
  description: 'KI-gestuetzter Angebotsassistent fuer NAVAX Sales-Berater',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_heading.variable} ${_mono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ModeProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ModeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
