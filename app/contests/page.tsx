"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, MapPin, Clock, Users, Plus, Filter } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import RegionFilter from "@/components/region-filter"

export default function ContestsPage() {
  // 상태 관리
  const [contests, setContests] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState("registrationDeadline")
  const [sortDir, setSortDir] = useState("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["서울특별시 강남구","서울특별시 관악구"])
  const [selectedStatus, setSelectedStatus] = useState("전체")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  // API URL
  const API_GATEWAY_URL = 'http://localhost:8080';

  // 카테고리 데이터 호출
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

  // 공모전 데이터 동적 검색 및 필터링
  useEffect(() => {
    const fetchContests = async () => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('keyword', searchTerm);
      }
      if (selectedStatus !== "전체") {
        params.append('status', selectedStatus);
      }
      if (selectedLocations.length > 0) {
        selectedLocations.forEach(location => params.append('locations', location));
      }

      params.append('page', String(page));
      params.append('size', '9');
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);

      try {
        let url = `${API_GATEWAY_URL}/api/contests/status`;

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
        setContests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, [searchTerm, selectedCategory, selectedLocations, selectedStatus, page, sortBy, sortDir, categories]);

  // 페이지 렌더링
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

        {/* 검색 및 필터링 UI */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="md:col-span-2 lg:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="관심있는 공모전을 검색해보세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

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

              <Dialog open={isRegionModalOpen} onOpenChange={setIsRegionModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-start text-left font-normal">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedLocations.length > 0 ? `지역 (${selectedLocations.length}개 선택됨)` : "지역 선택"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>지역 선택</DialogTitle>
                  </DialogHeader>
                  <RegionFilter onSelectionChange={setSelectedLocations} />
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setIsRegionModalOpen(false)}>완료</Button>
                  </div>
                </DialogContent>
              </Dialog>

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

              <Select value={`${sortBy},${sortDir}`} onValueChange={(value) => {
                const [newSortBy, newSortDir] = value.split(',');
                setSortBy(newSortBy);
                setSortDir(newSortDir);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrationDeadline,asc">마감일 오름차순</SelectItem>
                  <SelectItem value="registrationDeadline,desc">마감일 내림차순</SelectItem>
                  <SelectItem value="startDate,asc">시작일 오름차순</SelectItem>
                  <SelectItem value="startDate,desc">시작일 내림차순</SelectItem>
                  <SelectItem value="createdAt,desc">최신순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6 mb-2 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold text-blue-600">{totalElements}</span>개의 공모전이 있습니다
              </p>
              <div className="flex items-center gap-2">
                <Button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} size="sm">
                  이전
                </Button>
                <span className="text-sm text-gray-600">
                  {totalPages > 0 ? `${page + 1} / ${totalPages}` : "0 / 0"}
                </span>
                <Button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} size="sm">
                  다음
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 공모전 목록 그리드 */}
        {isLoading && <div className="text-center py-12 text-gray-500">공모전 목록을 불러오는 중...</div>}
        {error && <div className="text-center py-12 text-red-500">오류 발생: {error}</div>}
        {!isLoading && !error && contests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest: any) => (
              <Link href={`/contests/${contest.id}`} key={contest.id} className="block hover:shadow-lg transition-shadow rounded-lg">
                <Card className="h-full flex flex-col">
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
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg line-clamp-2">{contest.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {contest.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          최대 {contest.maxParticipants}명
                        </div>
                        <div className="font-semibold text-blue-600">{contest.prizeDescription}</div>
                      </div>
                      <div className="flex items-center text-red-600 pt-2">
                        <Clock className="w-4 h-4 mr-1" />
                        마감: {new Date(contest.registrationDeadline).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 검색 결과 없음 표시 */}
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