"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  Share2,
  Heart,
  MessageSquare,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  User,
  Send,
} from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"

// 더미 공모전 데이터
const contestData = {
  id: 1,
  title: "2025 스타트업 아이디어 공모전",
  description: `혁신적인 스타트업 아이디어로 미래를 바꿔보세요!

이번 공모전은 창의적이고 실현 가능한 스타트업 아이디어를 발굴하고 지원하기 위해 마련되었습니다. 
기술, 사회, 환경 등 다양한 분야의 아이디어를 환영하며, 선정된 팀에게는 창업 지원금과 멘토링을 제공합니다.

**주요 특징:**
- 실무진과의 1:1 멘토링 제공
- 투자자 네트워킹 기회
- 창업 교육 프로그램 참여 가능
- 사업화 지원금 최대 1억원

**심사 기준:**
1. 아이디어의 창의성 및 독창성 (30%)
2. 시장성 및 사업성 (30%)
3. 기술적 실현 가능성 (25%)
4. 팀 구성 및 실행력 (15%)`,
  category: "창업",
  region: "서울",
  startDate: "2025-01-01",
  deadline: "2025-02-28",
  image: "/placeholder.svg?height=400&width=800",
  participants: 156,
  maxParticipants: 200,
  prize: "1등 5,000만원, 2등 3,000만원, 3등 2,000만원",
  status: "모집중",
  eligibility: ["대학생", "대학원생", "직장인", "창업자"],
  requirements: `- 팀 구성: 2-4명 (개인 참가 가능)
- 사업계획서 제출 (PPT 20페이지 이내)
- 프로토타입 또는 MVP 제출 (선택사항)
- 발표 자료 준비 (결선 진출 시)`,
  submissionFormat: `**제출 서류:**
1. 참가신청서
2. 사업계획서 (PPT 형식, 20페이지 이내)
3. 팀원 소개서
4. 프로토타입 또는 데모 영상 (선택)

**제출 방법:**
- 이메일 제출: contest@equallocal.com
- 제출 기한: 2025년 2월 28일 23:59까지`,
  organizer: {
    name: "이퀄로컬",
    email: "contest@equallocal.com",
    phone: "02-1234-5678",
    website: "https://equallocal.com",
  },
  tags: ["스타트업", "창업", "아이디어", "혁신", "투자"],
  isLiked: false,
  likeCount: 89,
  viewCount: 1234,
}

// 더미 팀 모집 게시글
const teamPosts = [
  {
    id: 1,
    title: "개발자 1명 구합니다! (React, Node.js)",
    author: "김창업",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    content: "AI 기반 헬스케어 서비스 아이디어로 참가할 예정입니다. 프론트엔드 개발 가능한 분 구해요!",
    skills: ["React", "Node.js", "TypeScript"],
    teamSize: "3/4명",
    createdAt: "2시간 전",
    replies: 5,
  },
  {
    id: 2,
    title: "디자이너 구해요! UI/UX 전문가 환영",
    author: "박혁신",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    content: "친환경 배달 서비스 아이디어입니다. 사용자 경험을 중시하는 디자이너분과 함께하고 싶어요.",
    skills: ["UI/UX", "Figma", "Prototyping"],
    teamSize: "2/4명",
    createdAt: "5시간 전",
    replies: 3,
  },
  {
    id: 3,
    title: "마케팅 전문가 모집",
    author: "이비즈",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    content: "B2B SaaS 아이디어로 참가합니다. 마케팅 전략 수립과 실행 경험이 있는 분 찾아요!",
    skills: ["마케팅", "SEO", "콘텐츠"],
    teamSize: "3/4명",
    createdAt: "1일 전",
    replies: 8,
  },
]

// 관련 공모전
const relatedContests = [
  {
    id: 2,
    title: "AI 혁신 아이디어 공모전",
    category: "IT",
    deadline: "2025-04-20",
    image: "/placeholder.svg?height=150&width=200",
    participants: 89,
  },
  {
    id: 3,
    title: "사회혁신 아이디어 공모전",
    category: "사회",
    deadline: "2025-03-18",
    image: "/placeholder.svg?height=150&width=200",
    participants: 67,
  },
]

export default function ContestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [contest, setContest] = useState(contestData)
  const [isLoading, setIsLoading] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showLikeNotification, setShowLikeNotification] = useState(false)

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.warning("로그인이 필요합니다.")
      router.push("/login")
      return
    }

    const newIsLiked = !contest.isLiked

    // Local Storage Logic
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated or user ID not available.");
      }
      const localStorageKey = `favoriteContests_${user.id}`;
      const storedFavorites = localStorage.getItem(localStorageKey);
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (newIsLiked) {
        // Add to favorites
        const newFavorite = {
          id: contest.id,
          title: `${contest.title} (${contest.category})`,
          organizer: contest.organizer.name,
          region: contest.region,
          dDay: getDaysLeft(),
          period: `${contest.startDate} ~ ${contest.deadline}`,
        };
        const exists = favorites.some((fav: any) => fav.id === newFavorite.id);
        if (!exists) {
          favorites.push(newFavorite);
        }
      } else {
        // Remove from favorites
        favorites = favorites.filter((fav: any) => fav.id !== contest.id);
      }

      localStorage.setItem(localStorageKey, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to update favorites in localStorage", error);
      toast.error("즐겨찾기 업데이트에 실패했습니다.");
    }

    // UI State Update
    setContest((prev) => ({
      ...prev,
      isLiked: newIsLiked,
      likeCount: newIsLiked ? prev.likeCount + 1 : prev.likeCount - 1,
    }))
  }

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    setShowApplicationForm(true)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: contest.title,
          text: contest.description.slice(0, 100) + "...",
          url: window.location.href,
        })
      } catch (error) {
        console.log("공유 실패:", error)
      }
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href)
      alert("링크가 클립보드에 복사되었습니다!")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "모집중":
        return "bg-green-100 text-green-800"
      case "마감임박":
        return "bg-yellow-100 text-yellow-800"
      case "마감":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysLeft = () => {
    const deadline = new Date(contest.deadline)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysLeft = getDaysLeft()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link href="/contests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              공모전 목록으로
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 공모전 헤더 */}
            <Card>
              <div className="relative">
                <img
                  src={contest.image || "/placeholder.svg"}
                  alt={contest.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge>{contest.category}</Badge>
                  <Badge className={getStatusColor(contest.status)}>{contest.status}</Badge>
                </div>
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleLike} className="bg-white/90 hover:bg-white">
                      <Heart className={`w-4 h-4 mr-1 ${contest.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      {contest.likeCount}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleShare} className="bg-white/90 hover:bg-white">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {showLikeNotification && (
                    <div className="bg-black text-white text-xs px-2 py-1 rounded-md">
                      즐겨찾기에 추가되었습니다!
                    </div>
                  )}
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{contest.title}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {contest.region}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {contest.participants}/{contest.maxParticipants}명 참여
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {contest.startDate} ~ {contest.deadline}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* 탭 콘텐츠 */}
            <Tabs defaultValue="description" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">상세정보</TabsTrigger>
                <TabsTrigger value="requirements">참가요건</TabsTrigger>
                <TabsTrigger value="teams">팀 모집</TabsTrigger>
                <TabsTrigger value="related">관련 공모전</TabsTrigger>
              </TabsList>

              {/* 상세정보 탭 */}
              <TabsContent value="description">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">{contest.description}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 참가요건 탭 */}
              <TabsContent value="requirements">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        참가 자격
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {contest.eligibility.map((eligibility) => (
                          <Badge key={eligibility} variant="secondary">
                            {eligibility}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                        참가 요구사항
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-line text-gray-700">{contest.requirements}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Send className="w-5 h-5 mr-2 text-purple-600" />
                        제출 형식
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-line text-gray-700">{contest.submissionFormat}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* 팀 모집 탭 */}
              <TabsContent value="teams">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">팀원 모집 게시글</h3>
                    <Button size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      팀원 모집하기
                    </Button>
                  </div>

                  {teamPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.author} />
                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{post.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="w-4 h-4" />
                                {post.teamSize}
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-2">{post.content}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {post.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{post.createdAt}</span>
                                <div className="flex items-center">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {post.replies}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 관련 공모전 탭 */}
              <TabsContent value="related">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedContests.map((relatedContest) => (
                    <Card key={relatedContest.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        <img
                          src={relatedContest.image || "/placeholder.svg"}
                          alt={relatedContest.title}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-2 left-2">{relatedContest.category}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2 line-clamp-2">{relatedContest.title}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {relatedContest.deadline}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {relatedContest.participants}명
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 마감 정보 */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Clock className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">D-{daysLeft > 0 ? daysLeft : 0}</div>
                  <div className="text-sm text-gray-600">{daysLeft > 0 ? `${daysLeft}일 남음` : "마감"}</div>
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-gray-600 space-y-1">
                  <div>마감일: {contest.deadline}</div>
                  <div>조회수: {contest.viewCount.toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            {/* 상금 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  상금/혜택
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 whitespace-pre-line">{contest.prize}</div>
              </CardContent>
            </Card>

            {/* 주최자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  주최자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{contest.organizer.name}</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${contest.organizer.email}`} className="text-blue-600 hover:underline">
                      {contest.organizer.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{contest.organizer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={contest.organizer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      웹사이트 방문
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 태그 */}
            <Card>
              <CardHeader>
                <CardTitle>태그</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contest.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 지원하기 버튼 */}
            <Card>
              <CardContent className="p-4">
                <Button className="w-full" size="lg" onClick={handleApply} disabled={daysLeft <= 0}>
                  {daysLeft <= 0 ? "마감된 공모전" : "지원하기"}
                </Button>
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center mt-2">지원하려면 로그인이 필요합니다</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
