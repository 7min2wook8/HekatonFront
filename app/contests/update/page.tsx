"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation" // useParams 대신 useSearchParams 사용
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

const categories = [
  "창업",
  "IT",
  "디자인",
  "마케팅",
  "광고",
  "사회",
  "환경",
  "교육",
  "문화",
  "예술",
  "스포츠",
  "의료",
  "금융",
  "정책",
]

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

function ContestEditContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams() // useParams 대신 useSearchParams 훅 사용
  const contestId = searchParams.get('id') // URL 쿼리 파라미터 'id' 값 가져오기

  const API_GATEWAY_URL = 'http://localhost:8080';

  const [isLoading, setIsLoading] = useState(true); // 초기 데이터 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 폼 제출 중 상태
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizer: "",
    registrationDeadline: "",
    startDate: "",
    endDate: "",
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
  });

  const [newTag, setNewTag] = useState("");
  const [newEligibility, setNewEligibility] = useState("");
  
  // 컴포넌트 마운트 시 기존 공모전 데이터 불러오기
  useEffect(() => {
    // contestId가 없거나 이미 로딩 중인 경우 함수 종료
    if (!contestId) {
      setError("수정할 공모전 ID가 없습니다. URL 쿼리 파라미터에 'id' 값을 포함해주세요 (예: /contests/update?id=YOUR_CONTEST_ID).");
      setIsLoading(false);
      return;
    }

    const fetchContestData = async () => {
      setIsLoading(true);
      setError(null); // 에러 초기화
      try {
        const response = await fetch(`${API_GATEWAY_URL}/api/contests/${contestId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
          throw new Error(errorData.message || '공모전 정보를 불러오는 데 실패했습니다.');
        }

        const data = await response.json();
        
        // 날짜 필드를 'YYYY-MM-DD' 형식으로 변환 (Input type="date"에 맞춤)
        setFormData({
          title: data.title || "",
          description: data.description || "",
          organizer: data.organizer || "",
          registrationDeadline: data.registrationDeadline ? data.registrationDeadline.split('T')[0] : "",
          startDate: data.startDate ? data.startDate.split('T')[0] : "",
          endDate: data.endDate ? data.endDate.split('T')[0] : "",
          category: data.category || "",
          region: data.region || "",
          prizeDescription: data.prizeDescription || "",
          maxParticipants: data.maxParticipants ? String(data.maxParticipants) : "", // 숫자를 문자열로 변환
          eligibility: Array.isArray(data.eligibility) ? data.eligibility : [],
          requirements: data.requirements || "",
          submissionFormat: data.submissionFormat || "",
          organizerEmail: data.organizerEmail || "",
          organizerPhone: data.organizerPhone || "",
          websiteUrl: data.websiteUrl || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
        });
      } catch (err: any) {
        console.error("Error fetching contest data:", err);
        setError(err.message || "공모전 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContestData();
  }, [contestId, API_GATEWAY_URL]); // contestId와 API_GATEWAY_URL이 변경될 때마다 데이터를 다시 불러옵니다.


  // 폼 제출 핸들러 (PUT 요청)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 날짜 유효성 검사
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDateTime = new Date(formData.startDate);
    const endDateTime = new Date(formData.endDate);
    const registrationDateTime = new Date(formData.registrationDeadline);

    if (!formData.startDate || !formData.endDate || !formData.registrationDeadline) {
        setError("모든 날짜 필드를 입력해주세요.");
        setIsSubmitting(false);
        return;
    }

    if (startDateTime > endDateTime) {
      setError("대회 시작일은 종료일보다 빠를 수 없습니다.");
      setIsSubmitting(false);
      return;
    }

    if (registrationDateTime > startDateTime) {
      setError("접수 마감일은 대회 시작일보다 빠를 수 없습니다.");
      setIsSubmitting(false);
      return;
    }

    // 날짜 필드에 시간 정보 (자정) 추가
    const formatDateTime = (dateString: string) => {
      if (!dateString) return null;
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
      const response = await fetch(`${API_GATEWAY_URL}/api/contests/${contestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
        throw new Error(errorData.message || '공모전 업데이트에 실패했습니다.');
      }

      console.log("Contest updated successfully:", await response.json());
      setSuccess(true);

      setTimeout(() => {
        router.push(`/contests/${contestId}`);
      }, 3000);
    } catch (err: any) {
      console.error("Error updating contest:", err);
      setError(err.message || "공모전 업데이트에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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

  // 사용자 인증이 완료되지 않았거나 contestId가 없는 경우 로딩 또는 오류 처리
  if (!user) { // user가 없으면 ProtectedRoute에서 처리하겠지만, 혹시 모를 경우를 대비
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">접근 권한이 없습니다.</p>
      </div>
    );
  }

  // contestId가 아직 로딩 중이거나 유효하지 않은 경우
  if (isLoading || !contestId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        {isLoading && <Loader2 className="w-10 h-10 text-gray-500 animate-spin mb-4" />}
        <p className="text-gray-600">{error || (isLoading ? "공모전 정보를 불러오는 중..." : "유효한 공모전 ID가 없습니다.")}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">공모전 수정 완료!</h2>
              <p className="text-gray-600 mb-6">
                공모전 정보가 성공적으로 업데이트되었습니다.
                <br />
                잠시 후 공모전 상세 페이지로 이동합니다.
              </p>
              <div className="flex gap-2">
                <Link href={`/contests/${contestId}`} className="flex-1">
                  <Button className="w-full">수정된 공모전 보기</Button>
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
              <h1 className="text-3xl font-bold text-gray-900">공모전 수정</h1>
              <p className="text-gray-600">기존 공모전 정보를 수정합니다</p>
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
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
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
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        수정 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        공모전 수정하기
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">수정 후 관리자 승인을 거쳐 게시됩니다</p>
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

// 이 부분은 변경 없음. ProtectedRoute가 ContestEditContent를 감싸는 역할.
export default function ContestEditPage() {
  return (
    <ProtectedRoute>
      <ContestEditContent />
    </ProtectedRoute>
  )
}