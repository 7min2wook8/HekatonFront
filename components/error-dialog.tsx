"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, HelpCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "auth" | "network" | "validation" | "general"
  onRetry?: () => void
  showHelp?: boolean
}

export default function ErrorDialog({
  isOpen,
  onClose,
  title,
  message,
  type = "general",
  onRetry,
  showHelp = false,
}: ErrorDialogProps) {
  const getErrorIcon = () => {
    switch (type) {
      case "auth":
        return <AlertTriangle className="w-12 h-12 text-red-500" />
      case "network":
        return <RefreshCw className="w-12 h-12 text-orange-500" />
      case "validation":
        return <HelpCircle className="w-12 h-12 text-yellow-500" />
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />
    }
  }

  const getErrorColor = () => {
    switch (type) {
      case "auth":
        return "border-red-200 bg-red-50"
      case "network":
        return "border-orange-200 bg-orange-50"
      case "validation":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-red-200 bg-red-50"
    }
  }

  const getSuggestions = () => {
    switch (type) {
      case "auth":
        if (title.includes("존재하지 않는")) {
          return ["이메일 주소를 다시 확인해주세요", "다른 이메일로 가입했는지 확인해보세요", "회원가입을 진행해주세요"]
        } else if (title.includes("잠겼습니다")) {
          return ["10분 후 다시 시도해주세요", "비밀번호 찾기를 이용해보세요", "고객센터에 문의해주세요"]
        } else if (title.includes("이메일 인증")) {
          return ["이메일함을 확인해주세요", "스팸함도 확인해보세요", "인증 이메일을 다시 요청해보세요"]
        } else {
          return [
            "이메일 주소를 다시 확인해주세요",
            "비밀번호를 정확히 입력했는지 확인해주세요",
            "Caps Lock이 켜져있지 않은지 확인해주세요",
          ]
        }
      case "network":
        if (title.includes("점검")) {
          return ["공지사항을 확인해주세요", "잠시 후 다시 시도해주세요", "점검 완료 시간을 확인해보세요"]
        } else {
          return ["인터넷 연결 상태를 확인해주세요", "잠시 후 다시 시도해주세요", "브라우저를 새로고침해보세요"]
        }
      case "validation":
        return ["이메일함을 확인해주세요", "스팸함도 확인해보세요", "인증 이메일을 다시 요청해보세요"]
      default:
        return ["잠시 후 다시 시도해주세요", "문제가 지속되면 고객센터에 문의해주세요"]
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{title}</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          {/* 에러 아이콘 */}
          <div className="flex justify-center">{getErrorIcon()}</div>

          {/* 에러 제목 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* 해결 방법 제안 */}
          <div className={`p-4 rounded-lg ${getErrorColor()}`}>
            <h3 className="font-medium text-gray-900 mb-2">해결 방법을 확인해보세요</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
            )}

            {type === "auth" && (
              <div className="flex gap-2">
                {title.includes("존재하지 않는") ? (
                  <Link href="/signup/terms" className="flex-1">
                    <Button className="w-full">
                      회원가입하기
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/forgot-password" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      비밀번호 찾기
                    </Button>
                  </Link>
                )}
                {!title.includes("존재하지 않는") && (
                  <Link href="/signup/terms" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      회원가입
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {type === "validation" && (
              <Button variant="outline" className="w-full bg-transparent">
                인증 이메일 재발송
              </Button>
            )}

            {showHelp && (
              <Link href="/help">
                <Button variant="outline" className="w-full bg-transparent">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  도움말 보기
                </Button>
              </Link>
            )}

            <Button variant="ghost" onClick={onClose} className="w-full">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
