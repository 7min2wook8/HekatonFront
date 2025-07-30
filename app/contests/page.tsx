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
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState("endDate")
  const [sortDir, setSortDir] = useState("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedLocation, setSelectedLocation] = useState("전체")
  const [selectedStatus, setSelectedStatus] = useState("전체")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  //카테고리 호출
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/categories`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error("카테고리 목록을 불러오는 데 실패했습니다.");
        }
        const data = await response.json();
        console.log(data)
        // API 응답에서 실제 카테고리 배열을 추출합니다.
        const categoriesArray = Array.isArray(data) ? data : data.content;

        if (Array.isArray(categoriesArray)) {
          setCategories(categoriesArray);
        } else {
          console.error("API로부터 받은 카테고리 데이터가 배열이 아닙니다:", data);
          throw new Error("카테고리 데이터 형식이 올바르지 않습니다.");
        }
      } catch (error: any) {
        setCategoriesError(error.message);
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  //동적 검색
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
      if (selectedLocation !== "전체") {
        params.append('location', selectedLocation);
      }
      if (selectedStatus !== "전체") {
        params.append('status', selectedStatus);
      }

      // 페이지네이션과 정렬 파라미터 추가
      params.append('page', String(page));
      params.append('size', '9'); // 한 페이지에 9개씩 표시
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);

      try {
        let url = `${API_GATEWAY_URL}/api/contests/status`;

        // 카테고리 필터링 URL 처리
        if (selectedCategory !== "전체") {
          const foundCategory = categories.find(cat => cat.name === selectedCategory);
          if (foundCategory) {
            url = `${API_GATEWAY_URL}/api/categories/${foundCategory.id}/contests`;
          }
        }

        const response = await fetch(`${url}?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.");
        }

        const data = await response.json();
        
        console.log("response: ", response);
        console.log("API 응답:", data);
        console.log("카테고리:", categories);
        if (data && Array.isArray(data.content)) {
          setContests(data.content);          
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          console.error("API 응답이 예상되는 객체 구조가 아닙니다:", data);
          setContests([]);
          setTotalPages(0);
          setTotalElements(0);
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
  }, [searchTerm, selectedCategory, selectedLocation, selectedStatus, page, sortBy, sortDir, categories]); // 필터, 정렬, 페이지 변경 시 다시 호출

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
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isCategoriesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>불러오는 중...</SelectItem>
                  ) : categoriesError ? (
                    <SelectItem value="error" disabled>카테고리 로딩 실패</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="전체">전체 카테고리</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
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
                  <SelectItem value="OPEN">모집중</SelectItem>
                  <SelectItem value="CLOSING_SOON">마감임박</SelectItem>
                  <SelectItem value="CLOSED">마감</SelectItem>
                </SelectContent>
              </Select>

              {/* 정렬 필터 */}
              <Select value={`${sortBy},${sortDir}`} onValueChange={(value) => {
                const [newSortBy, newSortDir] = value.split(',');
                setSortBy(newSortBy);
                setSortDir(newSortDir);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="endDate,asc">마감일 오름차순</SelectItem>
                  <SelectItem value="endDate,desc">마감일 내림차순</SelectItem>
                  <SelectItem value="startDate,asc">시작일 오름차순</SelectItem>
                  <SelectItem value="startDate,desc">시작일 내림차순</SelectItem>
                  <SelectItem value="createdAt,desc">최신순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            총 <span className="font-semibold text-blue-600">{totalElements}</span>개의 공모전이 있습니다
          </p>
          {/* 페이지네이션 */}
          <div className="flex items-center gap-2">
            <Button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              이전
            </Button>
            <span className="text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <Button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
              다음
            </Button>
          </div>
        </div>
          </CardContent>
        </Card>

        

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
                      
                      {Array.isArray(contest.categories) && contest.categories.map((category:any) => (
                  <Badge key={category.id}>{category.name}</Badge>
                 ))}
                      
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
                          {contest.maxParticipants}명
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-red-600">
                          <Clock className="w-4 h-4 mr-1" />
                          종료일:{contest.endDate}
                        </div>
                        <div className="font-semibold text-blue-600">상금 {contest.prizeDescription}</div>
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
