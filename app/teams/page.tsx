"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, MapPin, Calendar, Plus, MessageSquare, Star, Filter, UserPlus, Clock, Trophy, Eye } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"

// 더미 팀 데이터
const teams = [
  {
    id: 1,
    name: "AI 혁신팀",
    description: "AI 기반 헬스케어 솔루션을 개발하는 팀입니다. 머신러닝과 의료 데이터 분석에 관심있는 분들과 함께하고 싶어요.",
    contest: "2025 스타트업 아이디어 공모전",
    contestId: 1,
    leader: {
      name: "김혁신",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "팀장",
      experience: "AI 개발 3년"
    },
    members: [
      { name: "이개발", role: "백엔드 개발자", skills: ["Python", "Django", "ML"] },
      { name: "박디자인", role: "UI/UX 디자이너", skills: ["Figma", "Sketch"] }
    ],
    neededRoles: ["프론트엔드 개발자", "데이터 사이언티스트"],
    skills: ["Python", "React", "TensorFlow", "UI/UX"],
    location: "서울",
    maxMembers: 5,
    currentMembers: 3,
    createdAt: "2025-01-20",
    status: "모집중",
    rating: 4.8,
    applications: 12
  },
  {
    id: 2,
    name: "그린테크 솔루션",
    description: "친환경 기술로 지속가능한 미래를 만들어가는 팀입니다. 환경 문제에 관심있고 기술적 해결책을 찾고 싶은 분들 환영합니다.",
    contest: "환경보호 캠페인 공모전",
    contestId: 3,
    leader: {
      name: "최환경",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "팀장",
      experience: "환경공학 5년"
    },
    members: [
      { name: "정마케팅", role: "마케터", skills: ["디지털마케팅", "SNS"] }
    ],
    neededRoles: ["개발자", "디자이너", "기획자"],
    skills: ["환경공학", "마케팅", "React", "Node.js"],
    location: "부산",
    maxMembers: 4,
    currentMembers: 2,
    createdAt: "2025-01-18",
    status: "모집중",
    rating: 4.5,
    applications: 8
  },
  {
    id: 3,
    name: "모바일 이노베이터",
    description: "혁신적인 모바일 앱으로 사용자 경험을 혁신하고자 하는 팀입니다. 모바일 개발과 UX에 열정있는 분들과 함께해요.",
    contest: "모바일 앱 개발 공모전",
    contestId: 3,
    leader: {
      name: "박모바일",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "팀장",
      experience: "모바일 개발 4년"
    },
    members: [
      { name: "김플러터", role: "모바일 개발자", skills: ["Flutter", "Dart"] },
      { name: "이UX", role: "UX 디자이너", skills: ["Figma", "Prototyping"] },
      { name: "정기획", role: "기획자", skills: ["기획", "분석"] }
    ],
    neededRoles: ["백엔드 개발자"],
    skills: ["Flutter", "React Native", "UI/UX", "Node.js"],
    location: "대구",
    maxMembers: 5,
    currentMembers: 4,
    createdAt: "2025-01-15",
    status: "마감임박",
    rating: 4.9,
    applications: 25
  }
]

// 더미 개인 프로필 데이터
const individuals = [
  {
    id: 1,
    name: "김개발자",
    avatar: "/placeholder.svg?height=60&width=60",
    role: "풀스택 개발자",
    experience: "3년",
    skills: ["React", "Node.js", "Python", "AWS"],
    location: "서울",
    bio: "웹 개발 3년차로 프론트엔드와 백엔드 모두 가능합니다. 스타트업 경험이 있어 빠른 개발과 협업에 자신있어요.",
    interests: ["AI", "핀테크", "헬스케어"],
    portfolio: "https://github.com/kimdev",
    rating: 4.7,
    completedProjects: 8,
    isAvailable: true
  },
  {
    id: 2,
    name: "이디자이너",
    avatar: "/placeholder.svg?height=60&width=60",
    role: "UI/UX 디자이너",
    experience: "2년",
    skills: ["Figma", "Sketch", "Prototyping", "User Research"],
    location: "부산",
    bio: "사용자 중심의 디자인을 추구하는 UI/UX 디자이너입니다. 다양한 프로젝트 경험을 통해 실무 감각을 키워왔어요.",
    interests: ["모바일앱", "웹서비스", "브랜딩"],
    portfolio: "https://behance.net/leedesigner",
    rating: 4.8,
    completedProjects: 12,
    isAvailable: true
  },
  {
    id: 3,
    name: "박마케터",
    avatar: "/placeholder.svg?height=60&width=60",
    role: "디지털 마케터",
    experience: "4년",
    skills: ["SEO", "SNS마케팅", "콘텐츠마케팅", "데이터분석"],
    location: "서울",
    bio: "데이터 기반 마케팅 전략 수립과 실행에 전문성을 가지고 있습니다. 스타트업부터 대기업까지 다양한 경험이 있어요.",
    interests: ["이커머스", "SaaS", "브랜딩"],
    portfolio: "https://linkedin.com/in/parkmarketer",
    rating: 4.6,
    completedProjects: 15,
    isAvailable: false
  }
]

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("teams")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("전체")
  const [selectedSkill, setSelectedSkill] = useState("전체")
  const [selectedStatus, setSelectedStatus] = useState("전체")

  const filteredTeams = teams.filter(team => {
    return (
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (selectedLocation === "전체" || team.location === selectedLocation) &&
    (selectedSkill === "전체" || team.skills.includes(selectedSkill)) &&
    (selectedStatus === "전체" || team.status === selectedStatus)
  })

  const filteredIndividuals = individuals.filter(person => {
    return (
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.bio.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (selectedLocation === "전체" || person.location === selectedLocation) &&
    (selectedSkill === "전체" || person.skills.includes(selectedSkill))
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "모집중":
        return "bg-green-100 text-green-800"
      case "마감임박":
        return "bg-yellow-100 text-yellow-800"
      case "모집완료":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">팀 매칭</h1>
            <p className="text-gray-600 mt-2">완벽한 팀을 찾거나 팀원을 모집해보세요</p>
          </div>
          <div className="flex gap-2">
            <Link href="/teams/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                팀 만들기
              </Button>
            </Link>
            <Link href="/mypage/profile">
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                프로필 등록
              </Button>
            </Link>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* 검색 */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="팀명, 역할, 기술스택 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 지역 필터 */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 지역</SelectItem>
                  <SelectItem value="서울">서울</SelectItem>
                  <SelectItem value="부산">부산</SelectItem>
                  <SelectItem value="대구">대구</SelectItem>
                  <SelectItem value="인천">인천</SelectItem>
                  <SelectItem value="광주">광주</SelectItem>
                  <SelectItem value="대전">대전</SelectItem>
                </SelectContent>
              </Select>

              {/* 기술스택 필터 */}
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="기술스택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 기술</SelectItem>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Node.js">Node.js</SelectItem>
                  <SelectItem value="UI/UX">UI/UX</SelectItem>
                  <SelectItem value="Flutter">Flutter</SelectItem>
                  <SelectItem value="마케팅">마케팅</SelectItem>
                </SelectContent>
              </Select>

              {/* 상태 필터 (팀 탭에서만) */}
              {activeTab === "teams" && (
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="모집상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체 상태</SelectItem>
                    <SelectItem value="모집중">모집중</SelectItem>
                    <SelectItem value="마감임박">마감임박</SelectItem>
                    <SelectItem value="모집완료">모집완료</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              팀 찾기 ({filteredTeams.length})
            </TabsTrigger>
            <TabsTrigger value="individuals" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              팀원 찾기 ({filteredIndividuals.length})
            </TabsTrigger>
          </TabsList>

          {/* 팀 찾기 탭 */}
          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{team.name}</CardTitle>
                          <Badge className={getStatusColor(team.status)}>
                            {team.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Trophy className="w-4 h-4 mr-1" />
                            {team.contest}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {team.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {team.currentMembers}/{team.maxMembers}명
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {team.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm line-clamp-3">{team.description}</p>

                    {/* 팀장 정보 */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={team.leader.avatar || "/placeholder.svg"} alt={team.leader.name} />
                        <AvatarFallback>{team.leader.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{team.leader.name}</div>
                        <div className="text-xs text-gray-600">{team.leader.experience}</div>
                      </div>
                    </div>

                    {/* 필요한 역할 */}
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-2">모집 중인 역할</div>
                      <div className="flex flex-wrap gap-1">
                        {team.neededRoles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 기술 스택 */}
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-2">기술 스택</div>
                      <div className="flex flex-wrap gap-1">
                        {team.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        지원하기
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </Button>
                    </div>

                    {/* 추가 정보 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {team.createdAt}
                      </div>
                      <div>{team.applications}명 지원</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 빈 상태 */}
            {filteredTeams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">조건에 맞는 팀이 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 조건으로 검색해보거나 새로운 팀을 만들어보세요.</p>
                <Link href="/teams/create">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    팀 만들기
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 팀원 찾기 탭 */}
          <TabsContent value="individuals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIndividuals.map((person) => (
                <Card key={person.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                        <AvatarFallback className="text-lg">{person.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{person.name}</h3>
                      <p className="text-gray-600 text-sm">{person.role}</p>
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {person.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {person.experience}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {person.rating}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{person.bio}</p>

                    {/* 기술 스택 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">기술 스택</div>
                      <div className="flex flex-wrap gap-1">
                        {person.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 관심 분야 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">관심 분야</div>
                      <div className="flex flex-wrap gap-1">
                        {person.interests.map((interest) => (
                          <Badge key={interest} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 상태 및 프로젝트 수 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${person.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                        {person.isAvailable ? '참여 가능' : '참여 불가'}
                      </div>
                      <div>{person.completedProjects}개 프로젝트 완료</div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        size="sm" 
                        disabled={!person.isAvailable}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        연락하기
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        프로필
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 빈 상태 */}
            {filteredIndividuals.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">조건에 맞는 팀원이 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 조건으로 검색해보거나 프로필을 등록해보세요.</p>
                <Link href="/mypage/profile">
                  <Button className="mt-4">
                    <UserPlus className="w-4 h-4 mr-2" />
                    프로필 등록
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}