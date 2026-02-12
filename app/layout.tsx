import React from "react"
import type { Metadata } from 'next'
import { Inter, DM_Sans, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _heading = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading' })
const _mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'NAVAX',
  description: 'NAVAX - Future-proof business solutions based on Microsoft technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} ${_heading.variable} ${_mono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
