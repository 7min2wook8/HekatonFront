"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Mail, Globe, GraduationCap, Briefcase, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth, type Profile } from "@/contexts/auth-context"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { getOtherUserProfile } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = params.userId as string

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      setIsLoading(true)
      setError(null)

      try {
        const result = await getOtherUserProfile(userId)

        if (result?.success && result.otherUserProfile) {
          setProfile(result.otherUserProfile)
        } else {
          setError(result?.message || "프로필을 불러올 수 없습니다.")
        }
      } catch (err) {
        setError("프로필을 불러오는 중 오류가 발생했습니다.")
        console.error("프로필 로딩 오류:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId, getOtherUserProfile])

  const handleBack = () => {
    router.back()
  }

  const handleRetry = () => {
    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getOtherUserProfile(userId)

        if (result?.success && result.otherUserProfile) {
          setProfile(result.otherUserProfile)
        } else {
          setError(result?.message || "프로필을 불러올 수 없습니다.")
        }
      } catch (err) {
        setError("프로필을 불러오는 중 오류가 발생했습니다.")
        console.error("프로필 로딩 오류:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Profile Card Skeleton */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse mx-auto md:mx-0" />
                <div className="flex-1 space-y-4">
                  <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">프로필을 불러올 수 없습니다</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleBack}>
                뒤로가기
              </Button>
              <Button onClick={handleRetry}>다시 시도</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">프로필이 없습니다</h3>
            <p className="text-gray-600 mb-4">요청하신 사용자의 프로필을 찾을 수 없습니다.</p>
            <Button variant="outline" onClick={handleBack}>
              뒤로가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">프로필</h1>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex justify-center md:justify-start">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.profileImageUrl || "/placeholder.svg"} alt={profile.fullName} />
                  <AvatarFallback className="text-2xl">
                    {profile.fullName ? profile.fullName.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.fullName || "이름 없음"}</h2>

                {profile.bio && <p className="text-gray-600 mb-4 leading-relaxed">{profile.bio}</p>}

                {profile.portfolioUrl && (
                  <div className="flex justify-center md:justify-start">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        포트폴리오 보기
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Education */}
          {profile.education && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  학력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.education}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experience && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  경력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.experience}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>보유 스킬</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill.skillName}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">연락하고 싶으신가요?</h3>
                <p className="text-gray-600 mb-4">팀 매칭을 통해 이 사용자와 연결될 수 있습니다.</p>
                <Button onClick={handleBack}>팀 매칭으로 돌아가기</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State for Missing Information */}
        {!profile.education && !profile.experience && (!profile.skills || profile.skills.length === 0) && (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">추가 정보가 없습니다</h3>
              <p className="text-gray-600">이 사용자는 아직 상세한 프로필 정보를 등록하지 않았습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
