"use client"

// import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, Users, Plus } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

import { useState, useEffect } from "react"

export default function ContestsPage() {
  const [contests, setContests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedLocation, setSelectedLocation] = useState("전체")
  const [selectedStatus, setSelectedStatus] = useState("전체")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
  useEffect(() => {
    
    fetchContests()
    
  }, [])

 // 서버에서 공모전 데이터 가져오기
  const fetchContests = async () => {
    setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/contests/AllContests", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },          
          credentials: 'include', // 쿠키 포함

        })

        // 네트워크 응답 확인
        if (!response.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.")
        }
        const data = await response.json()
        setIsLoading(false)
        
        setContests(data)
      } catch (error) {
        console.error("공모전 데이터를 가져오는 중 오류 발생:", error)
      }
    }
  

  const filteredContests = contests.filter((contest: any) => {
    return (
      contest.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "전체" || contest.category === selectedCategory) &&
      (selectedLocation === "전체" || contest.location === selectedLocation) &&
      (selectedStatus === "전체" || contest.status === selectedStatus)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">공모전 찾기</h1>
            <p className="text-gray-600 mt-2">다양한 공모전을 탐색하고 참여해보세요</p>
          </div>
          <Link href="/contests/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              공모전 등록
            </Button>
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* 검색 */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="공모전 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 카테고리 필터 */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 카테고리</SelectItem>
                  <SelectItem value="창업">창업</SelectItem>
                  <SelectItem value="광고">광고</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="사회">사회</SelectItem>
                  <SelectItem value="디자인">디자인</SelectItem>
                  <SelectItem value="정책">정책</SelectItem>
                </SelectContent>
              </Select>

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

              {/* 상태 필터 */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 상태</SelectItem>
                  <SelectItem value="모집중">모집중</SelectItem>
                  <SelectItem value="마감임박">마감임박</SelectItem>
                  <SelectItem value="마감">마감</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 결과 개수 */}
        <div className="mb-6">
          <p className="text-gray-600">
            총 <span className="font-semibold text-blue-600">{filteredContests.length}</span>개의 공모전이 있습니다
          </p>
        </div>

        {/* 공모전 그리드 */}
        {isLoading && <div className="text-center py-12 text-gray-500">공모전 목록을 불러오는 중...</div>}
        {error && <div className="text-center py-12 text-red-500">오류 발생: {error}</div>}
        {!isLoading && !error && filteredContests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest: any) => (
              <Card key={contest.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img
                    src={contest.image || "/placeholder.svg"}
                    alt={contest.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge>{contest.category}</Badge>
                    <Badge variant={contest.status === "마감임박" ? "destructive" : "secondary"}>{contest.status}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{contest.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {contest.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {contest.participants}명
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-red-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {contest.deadline}
                      </div>
                      <div className="font-semibold text-blue-600">상금 {contest.prize}</div>
                    </div>
                  </div>
                  <Link href={`/contests/${contest.id}`}>
                    <Button className="w-full mt-4">자세히 보기</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !error && filteredContests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색 조건에 맞는 공모전이 없습니다.</p>
            <p className="text-gray-400 mt-2">다른 조건으로 검색해보세요.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
