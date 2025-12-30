"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import type { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  )
}
