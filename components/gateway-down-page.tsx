"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerCrash, RefreshCw } from "lucide-react"
import { useAppStatus } from "@/contexts/app-status-context"
import { useState } from "react"

export default function GatewayDownPage() {
  const { checkGatewayStatus } = useAppStatus()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    await checkGatewayStatus()
    // 2초 후 버튼을 다시 활성화하여 연속 클릭을 방지합니다.
    setTimeout(() => setIsRetrying(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-red-100 rounded-full p-4 w-fit">
            <ServerCrash className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mt-4">서비스에 연결할 수 없습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            현재 서버 점검 중이거나 네트워크에 문제가 발생하여 서비스에 접속할 수 없습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <Button onClick={handleRetry} disabled={isRetrying} className="w-full">
            {isRetrying ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {isRetrying ? "확인 중..." : "다시 시도"}
          </Button>
          <p className="text-xs text-gray-500">문제가 지속될 경우 고객센터로 문의해 주세요.</p>
        </CardContent>
      </Card>
    </div>
  )
}