"use client"

import { AppShell } from "@/components/layout/app-shell"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function Page() {
  return (
    <AppShell>
      <ChatInterface />
    </AppShell>
  )
}
