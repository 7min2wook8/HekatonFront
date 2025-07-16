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
import { Loader2 } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setIsSubmitting(true)

    try {
       
        // 로그인 성공 시 auth-context의 login 함수 호출
        // 이 함수는 세션을 저장하고 사용자 정보를 업데이트합니다.
        const result = await login(formData.username, formData.password)
        // 로그인 성공 시 홈으로 이동
        if (result.success) {
          router.push("/")
        } else {
          setError(result.message)
        }
       
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 데모용 계정 정보 자동 입력
  // const fillDemoAccount = () => {
  //   setFormData({
  //     email: "minwook@example.com",
  //     password: "password123",
  //   })
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">로그인</CardTitle>
              <p className="text-gray-600">이퀄로컬에 오신 것을 환영합니다</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 데모 계정 안내 */}
              {/* <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">데모 계정으로 체험해보세요!</h4>
                <p className="text-sm text-blue-700 mb-3">
                  이메일: minwook@example.com
                  <br />
                  비밀번호: password123
                </p>
                <Button variant="outline" size="sm" onClick={fillDemoAccount} className="w-full bg-transparent">
                  데모 계정 정보 입력
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )} */}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">아이디</Label>
                  <Input
                    id="username"
                    type="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="아이디를 입력하세요"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="비밀번호를 입력하세요"
                    required
                    disabled={isSubmitting}
                  />
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
                  <Link href="/signup" className="text-blue-600 hover:underline">
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

      <Footer />
    </div>
  )
}
