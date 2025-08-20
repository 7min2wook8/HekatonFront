"use client"

import { createContext, useState, useContext, ReactNode, useCallback } from "react"
import { API_GATEWAY_URL } from "@/src/config"

interface AppStatusContextType {
  isGatewayDown: boolean
  setGatewayDown: (isDown: boolean) => void
  checkGatewayStatus: () => Promise<void>
}

const AppStatusContext = createContext<AppStatusContextType | undefined>(undefined)

// 게이트웨이 상태를 확인할 수 있는 가벼운 엔드포인트 (예: /health)
const HEALTH_CHECK_URL = `${API_GATEWAY_URL}/health`

export function AppStatusProvider({ children }: { children: ReactNode }) {
  const [isGatewayDown, setIsGatewayDown] = useState(false)

  const setGatewayDown = useCallback((isDown: boolean) => {
    setIsGatewayDown(isDown)
  }, [])

  // "다시 시도" 버튼 클릭 시 호출될 함수
  const checkGatewayStatus = useCallback(async () => {
    try {
      // 이 요청은 서버가 살아있는지만 확인하는 용도입니다.
      await fetch(HEALTH_CHECK_URL)
      // fetch가 성공하면 (HTTP 오류가 발생하더라도) 서버는 연결 가능한 상태입니다.
      setGatewayDown(false)
    } catch (error) {
      // TypeError는 네트워크 수준의 오류를 의미합니다.
      if (error instanceof TypeError) {
        setGatewayDown(true)
      }
    }
  }, [setGatewayDown])

  const value = { isGatewayDown, setGatewayDown, checkGatewayStatus }

  return <AppStatusContext.Provider value={value}>{children}</AppStatusContext.Provider>
}

export function useAppStatus() {
  const context = useContext(AppStatusContext)
  if (context === undefined) {
    throw new Error("useAppStatus must be used within an AppStatusProvider")
  }
  return context
}