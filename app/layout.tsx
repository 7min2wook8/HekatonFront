import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider, TeamProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "이퀄로컬 - 공모전 플랫폼",
  description: "공모전과 팀 매칭을 통해 여러분의 꿈을 실현해보세요",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <TeamProvider>  {/* ✅ 추가 */}
          <AuthProvider>{children}</AuthProvider>
        </TeamProvider>
        <Toaster />
      </body>
    </html>
  )
}
