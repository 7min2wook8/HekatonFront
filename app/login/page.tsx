"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ErrorDialog from "@/components/error-dialog"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [errorType, setErrorType] = useState<"auth" | "network" | "validation" | "general" | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorDialogData, setErrorDialogData] = useState({
    title: "",
    message: "",
    type: "general" as "auth" | "network" | "validation" | "general",
  })
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrorType(null)
    setIsSubmitting(true)

    try {
      const result = await login(formData.id, formData.password)

      if (result.success) {
        router.push("/")
      } else {
        setAttemptCount((prev) => prev + 1)
        handleLoginError(result.message)
      }
    } catch (error) {
      setAttemptCount((prev) => prev + 1)
      handleLoginError("네트워크 연결을 확인하고 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginError = (message: string) => {
    if (message.includes("아이디") || message.includes("비밀번호") || message.includes("올바르지 않습니다")) {
      setError("입력하신 아이디 또는 비밀번호가 올바르지 않습니다.")
      setErrorType("auth")
    } else if (message.includes("계정") && message.includes("존재하지")) {
      setError("존재하지 않는 계정입니다. 아이디를 확인해주세요.")
      setErrorType("auth")
    } else if (message.includes("계정") && message.includes("잠금")) {
      setError("보안을 위해 계정이 일시적으로 잠겼습니다. 잠시 후 다시 시도해주세요.")
      setErrorType("validation")
    } else if (message.includes("이메일") && message.includes("인증")) {
      setError("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.")
      setErrorType("validation")
    } else if (message.includes("네트워크") || message.includes("연결") || message.includes("서버")) {
      setError("네트워크 연결을 확인하고 다시 시도해주세요.")
      setErrorType("network")
    } else if (message.includes("점검")) {
      setError("현재 서비스 점검 중입니다. 잠시 후 다시 이용해주세요.")
      setErrorType("network")
    } else {
      setError(message || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      setErrorType("general")
    }
  }

  const handleRetry = () => {
    setShowErrorDialog(false)
    setError("")
    // 폼 포커스
    document.getElementById("email")?.focus()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 에러 메시지 표시 */}
              {error && (
                <Alert
                  variant={errorType === "network" ? "destructive" : "default"}
                  className={`
                  ${errorType === "auth" ? "border-red-200 bg-red-50" : ""}
                  ${errorType === "network" ? "border-red-200 bg-red-50" : ""}
                  ${errorType === "validation" ? "border-yellow-200 bg-yellow-50" : ""}
                `}
                >
                  <AlertDescription className="flex items-center justify-between">
                    <span
                      className={`
                      ${errorType === "auth" ? "text-red-700" : ""}
                      ${errorType === "network" ? "text-red-700" : ""}
                      ${errorType === "validation" ? "text-yellow-700" : ""}
                    `}
                    >
                      {error}
                    </span>
                    {attemptCount >= 3 && errorType === "auth" && (
                      <Link href="/forgot-password" className="text-sm underline hover:no-underline ml-2">
                        비밀번호 찾기
                      </Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">아이디</Label>
                  <Input
                    id="text"
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="아이디를 입력하세요"
                    required
                    disabled={isSubmitting}
                    className={attemptCount > 0 && errorType === "auth" ? "border-red-300 focus:border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="비밀번호를 입력하세요"
                      required
                      disabled={isSubmitting}
                      className={`pr-10 ${attemptCount > 0 && errorType === "auth" ? "border-red-300 focus:border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </Button>
              </form>

              <Separator />

              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600">간편 인증</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    구글로 로그인 (준비중)
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    카카오로 로그인 (준비중)
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    네이버로 로그인 (준비중)
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{" "}
                  <Link href="/signup/terms" className="text-blue-600 hover:underline">
                    회원가입
                  </Link>
                </p>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title={errorDialogData.title}
        message={errorDialogData.message}
        type={errorDialogData.type}
        onRetry={handleRetry}
        showHelp={attemptCount >= 3}
      />

      <Footer />
    </div>
  )
}
