"use client"

import type React from "react"
import { useAppStatus } from "@/contexts/app-status-context"
import GatewayDownPage from "@/components/gateway-down-page"

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isGatewayDown } = useAppStatus()

  if (isGatewayDown) {
    return <GatewayDownPage />
  }

  return <>{children}</>
}