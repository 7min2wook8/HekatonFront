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

  
  const API_GATEWAY_URL = 'http://localhost:8080';

  
  useEffect(() => {
    const fetchContests = async () => {
      setIsLoading(true);
      setError(null);

      // URLSearchParams를 사용하여 쿼리 파라미터를 동적으로 구성합니다.
      const params = new URLSearchParams();
      
      // 각 필터 상태에 따라 파라미터를 추가합니다. '전체'가 아닌 경우에만 추가합니다.
      if (searchTerm) {
        params.append('keyword', searchTerm);
      }
      if (selectedCategory !== "전체") {
        params.append('category', selectedCategory);
      }
      if (selectedLocation !== "전체") {
        params.append('location', selectedLocation);
      }
      if (selectedStatus !== "전체") {
        params.append('status', selectedStatus);
      }
      // 페이지네이션과 정렬 파라미터는 우선 기본값으로 설정하거나 추후 추가할 수 있습니다.
      // params.append('page', '0');
      // params.append('size', '10');

      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/contests?${params.toString()}&size=30`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.");
        }

        const data = await response.json();
        
        // API 응답이 배열인지, 혹은 .content 프로퍼티에 배열이 있는지 확인합니다.
        if (Array.isArray(data)) {
          setContests(data);
        } else if (data && Array.isArray(data.content)) {
          setContests(data.content);
        } else {
          console.error("API 응답이 배열 또는 예상되는 객체 구조가 아닙니다:", data);
          setContests([]); // 데이터가 없거나 형식이 맞지 않으면 빈 배열로 설정
        }

      } catch (error: any) {
        console.error("공모전 데이터를 가져오는 중 오류 발생:", error);
        setError(error.message);
        setContests([]); // 오류 발생 시 빈 배열로 설정
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, [searchTerm, selectedCategory, selectedLocation, selectedStatus]); // 필터가 변경될 때마다 fetchContests 함수를 다시 호출합니다.

  // 서버에서 필터링을 하므로 클라이언트 측 필터링 로직은 더 이상 필요하지 않습니다.
  // 렌더링할 때 'contests'를 직접 사용합니다.
  const filteredContests = contests;

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
            총 <span className="font-semibold text-blue-600">{contests.length}</span>개의 공모전이 있습니다
          </p>
        </div>

        {/* 공모전 그리드 */}
        {isLoading && <div className="text-center py-12 text-gray-500">공모전 목록을 불러오는 중...</div>}
        {error && <div className="text-center py-12 text-red-500">오류 발생: {error}</div>}
        {!isLoading && !error && contests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest: any) => (
              <Link href={`/contests/${contest.id}`} key={contest.id} className="block hover:shadow-lg transition-shadow rounded-lg">
                <Card className="h-full">
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !error && contests.length === 0 && (
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
