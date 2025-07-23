"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Upload, X, Plus, Trophy, Users, CheckCircle, Loader2 } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"



const regions = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
]

const eligibilityOptions = ["누구나", "대학생", "대학원생", "직장인", "프리랜서", "창업자", "개발자", "디자이너"]

function ContestCreateContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const API_GATEWAY_URL = 'http://localhost:8080';

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizer: "",
    registrationDeadline: "", // 접수 마감일
    startDate: "",    // 대회 시작일
    endDate: "",      // 대회 종료일
    category: "",
    region: "",
    prizeDescription: "",
    maxParticipants: "",
    eligibility: [] as string[],
    requirements: "",
    submissionFormat: "",
    organizerEmail: "",
    organizerPhone: "",
    websiteUrl: "",
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState("")
  const [newEligibility, setNewEligibility] = useState("")
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  // 날짜 필드에 시간 정보 (자정) 추가
  const formatDateTime = (dateString: string) => {
    if (!dateString) return null;
    // YYYY-MM-DD 형식에 T00:00:00을 붙여 LocalDateTime이 파싱할 수 있는 형식으로 만듦
    return `${dateString}T00:00:00`;
  };

  const submissionData = {
    ...formData,
    maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : 0,
    startDate: formatDateTime(formData.startDate),
    endDate: formatDateTime(formData.endDate),
    registrationDeadline: formatDateTime(formData.registrationDeadline),
  };

  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/contests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
      throw new Error(errorData.message || '공모전 생성에 실패했습니다.');
    }

    console.log("Contest created successfully:", await response.json());
    setSuccess(true);

    setTimeout(() => {
      router.push("/contests");
    }, 3000);
  } catch (error: any) {
    console.error("Error creating contest:", error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      })
    }
    setNewTag("")
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const addEligibility = () => {
    if (newEligibility && !formData.eligibility.includes(newEligibility)) {
      setFormData({
        ...formData,
        eligibility: [...formData.eligibility, newEligibility],
      })
    }
    setNewEligibility("")
  }

  const removeEligibility = (eligibility: string) => {
    setFormData({
      ...formData,
      eligibility: formData.eligibility.filter((e) => e !== eligibility),
    })
  }

  if (!user) return null

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">공모전 등록 완료!</h2>
              <p className="text-gray-600 mb-6">
                공모전이 성공적으로 등록되었습니다.
                <br />
                잠시 후 공모전 목록으로 이동합니다.
              </p>
              <div className="flex gap-2">
                <Link href="/contests" className="flex-1">
                  <Button className="w-full">공모전 목록 보기</Button>
                </Link>
                <Link href="/mypage" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    마이페이지
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/contests">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">공모전 등록</h1>
              <p className="text-gray-600">새로운 공모전을 등록하고 참가자를 모집해보세요</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    기본 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">공모전 제목 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="공모전 제목을 입력하세요"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">공모전 설명 *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="공모전에 대한 자세한 설명을 입력하세요"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리 *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          setFormData({ ...formData, category: value });
                          console.log("선택된 카테고리:", value);
                        }}
                        required
                        disabled={isCategoriesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {isCategoriesLoading ? (
                            <SelectItem value="loading" disabled>불러오는 중...</SelectItem>
                          ) : categoriesError ? (
                            <SelectItem value="error" disabled>카테고리 로딩 실패</SelectItem>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">지역 *</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) => setFormData({ ...formData, region: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="지역 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">대회 시작일 *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">대회 종료일 *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationDeadline">접수 마감일 *</Label>
                      <Input
                        id="registrationDeadline"
                        type="date"
                        value={formData.registrationDeadline}
                        onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 상세 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    상세 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prizeDescription">상금/혜택</Label>
                      <Input
                        id="prizeDescription"
                        value={formData.prizeDescription}
                        onChange={(e) => setFormData({ ...formData, prizeDescription: e.target.value })}
                        placeholder="예: 1등 500만원, 2등 300만원"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">최대 참가자 수</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                        placeholder="예: 100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>참가 자격</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.eligibility.map((eligibility) => (
                        <Badge key={eligibility} variant="secondary" className="flex items-center gap-1">
                          {eligibility}
                          <button
                            type="button"
                            onClick={() => removeEligibility(eligibility)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newEligibility} onValueChange={setNewEligibility}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="참가 자격 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {eligibilityOptions
                            .filter((option) => !formData.eligibility.includes(option))
                            .map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addEligibility} disabled={!newEligibility} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">참가 요구사항</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="참가자가 준비해야 할 것들을 설명해주세요"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submissionFormat">제출 형식</Label>
                    <Textarea
                      id="submissionFormat"
                      value={formData.submissionFormat}
                      onChange={(e) => setFormData({ ...formData, submissionFormat: e.target.value })}
                      placeholder="제출물의 형식과 요구사항을 설명해주세요"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 태그 */}
              <Card>
                <CardHeader>
                  <CardTitle>태그</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="태그 입력"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} disabled={!newTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 주최자 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>주최자 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer">주최자명 *</Label>
                    <Input
                      id="organizer"
                      value={formData.organizer}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      placeholder="주최자 이름"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizerEmail">이메일 *</Label>
                    <Input
                      id="organizerEmail"
                      type="email"
                      value={formData.organizerEmail}
                      onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                      placeholder="contact@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizerPhone">연락처</Label>
                    <Input
                      id="organizerPhone"
                      value={formData.organizerPhone}
                      onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                      placeholder="010-0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">웹사이트</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 이미지 업로드 */}
              <Card>
                <CardHeader>
                  <CardTitle>공모전 이미지</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">이미지를 업로드하세요</p>
                    <Button type="button" variant="outline" size="sm" disabled>
                      파일 선택 (준비중)
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG 파일만 가능 (최대 5MB)</p>
                  </div>
                </CardContent>
              </Card>

              {/* 제출 버튼 */}
              <Card>
                <CardContent className="p-4">
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        등록 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        공모전 등록하기
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">등록 후 관리자 승인을 거쳐 게시됩니다</p>
                  {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}

export default function ContestCreatePage() {
  return (
    <ProtectedRoute>
      <ContestCreateContent />
    </ProtectedRoute>
  )
}
