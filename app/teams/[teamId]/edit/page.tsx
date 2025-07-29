"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Plus, X, Users, Trophy, CheckCircle, Loader2, Info } from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

// 백엔드 TeamsResponse DTO에 있는 필드들만을 기반으로 정의
// 이 인터페이스는 백엔드 TeamsResponse DTO와 일치해야 합니다.
interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  contestId: string;
  isRecruiting: boolean; // 모집중 여부
  isPublic: boolean;
  maxMembers: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;

  eligibility: string[]; // 이전 neededRoles에 해당
  tags: string[];        // 이전 skills에 해당

  // 아래 필드들은 백엔드 TeamsResponse에 있다면 추가해야 합니다.
  // 이 페이지는 수정 페이지이므로, 백엔드에서 불러와서 다시 보낼 필드들이 여기에 포함됩니다.
  location: string;
  requirements: string;
  contactMethod: "platform" | "email" | "kakao" | "discord";
  contactInfo: string; // contactMethod가 platform이 아닐 경우 필요
  allowDirectApply: boolean;
}

const availableRoles = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "풀스택 개발자",
  "모바일 개발자",
  "UI/UX 디자이너",
  "그래픽 디자이너",
  "기획자",
  "마케터",
  "데이터 사이언티스트",
  "DevOps 엔지니어",
  "QA 엔지니어",
  "프로젝트 매니저"
]

const availableSkills = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
  "Flutter", "React Native", "Swift", "Kotlin", "Figma", "Sketch", "Photoshop",
  "마케팅", "SEO", "콘텐츠", "데이터분석", "머신러닝", "AWS", "Docker", "Kubernetes"
]

const contests = [
  { id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", title: "2025 스타트업 아이디어 공모전" },
  { id: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d", title: "AI 혁신 아이디어 공모전" },
  { id: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d", title: "모바일 앱 개발 공모전" },
  { id: "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d", title: "환경보호 캠페인 공모전" },
  { id: "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d", title: "사회혁신 아이디어 공모전" }
]

function TeamEditContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Team | null>(null); // 불러온 데이터를 저장할 상태

  const [newRole, setNewRole] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const API_GATEWAY_URL = 'http://localhost:8080';

  // 1. 팀 데이터 불러오기
  const fetchTeamData = useCallback(async () => {
    if (!teamId) {
      setError("팀 ID가 제공되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': user?.token ? `Bearer ${user.token}` : '', // 인증 토큰이 필요하다면 추가
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("팀을 찾을 수 없습니다.");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "팀 정보를 불러오는 데 실패했습니다.");
      }

      const data: Team = await response.json();

      // 권한 확인: 현재 로그인한 유저가 팀장이 아니면 접근 불가
      if (user && data.leaderId !== user.id) {
        setError("팀 수정 권한이 없습니다.");
        router.push(`/teams/${teamId}`); // 상세보기 페이지로 리다이렉션
        return;
      }

      // 폼 데이터 초기화 (백엔드에서 받은 데이터로)
      // `neededRoles`는 `eligibility`로, `skills`는 `tags`로 매핑
      setFormData({
        ...data,
        eligibility: data.eligibility || [], // null일 경우 빈 배열로 초기화
        tags: data.tags || [], // null일 경우 빈 배열로 초기화
        // 백엔드에 없는 필드는 기본값 또는 임시값으로 설정
        location: data.location || "온라인", // 백엔드에 location 필드가 없다면 기본값
        requirements: data.requirements || "", // 백엔드에 requirements 필드가 없다면 기본값
        contactMethod: data.contactMethod || "platform", // 백엔드에 contactMethod 필드가 없다면 기본값
        contactInfo: data.contactInfo || "", // 백엔드에 contactInfo 필드가 없다면 기본값
        allowDirectApply: data.allowDirectApply !== undefined ? data.allowDirectApply : true, // 백엔드에 없으면 기본값 true
      });

    } catch (err: any) {
      console.error("팀 정보 불러오기 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [teamId, user, router]);

  useEffect(() => {
    if (teamId && user) { // user 정보가 로드된 후에 fetch 시작
      fetchTeamData();
    }
  }, [teamId, user, fetchTeamData]);


  // 2. 팀 정보 업데이트 (저장)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!user || !formData) {
      setError("로그인이 필요하거나 팀 데이터가 없습니다.");
      setIsSaving(false);
      return;
    }

    try {
      // 백엔드의 TeamsUpdateRequest DTO에 맞춰 payload 구성
      // 여기서는 Team 인터페이스의 모든 필드를 보냅니다.
      // 백엔드 DTO에 따라 필요한 필드만 포함하도록 조정해야 합니다.
      const payload = {
        name: formData.name,
        description: formData.description,
        contestId: formData.contestId,
        location: formData.location, // 백엔드 DTO에 있어야 함
        maxMembers: formData.maxMembers,
        eligibility: formData.eligibility, // neededRoles
        tags: formData.tags, // skills
        requirements: formData.requirements, // 백엔드 DTO에 있어야 함
        contactMethod: formData.contactMethod, // 백엔드 DTO에 있어야 함
        contactInfo: formData.contactInfo, // 백엔드 DTO에 있어야 함
        isPublic: formData.isPublic,
        allowDirectApply: formData.allowDirectApply, // 백엔드 DTO에 있어야 함
        isRecruiting: formData.isRecruiting, // 모집 상태도 수정 가능하게 할 경우
        // leaderId는 일반적으로 수정하지 않습니다 (팀장 위임 기능이 별도로 있을 수 있음)
        // createdByUserId, createdAt, updatedAt 등은 백엔드에서 관리
      };

      console.log("팀 수정 API 전송 데이터:", payload);

      const response = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}`, {
        method: 'PUT', // 또는 PATCH
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': user.token ? `Bearer ${user.token}` : '', // 인증 토큰이 필요하다면 추가
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "팀 정보 수정에 실패했습니다.");
      }

      console.log("팀 수정 성공!");
      setSuccess(true);

      // 3초 후 팀 상세 페이지로 이동
      setTimeout(() => {
        router.push(`/teams/${teamId}`);
      }, 3000);

    } catch (err: any) {
      console.error("팀 수정 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const addRole = () => {
    if (formData && newRole && !formData.eligibility.includes(newRole)) {
      setFormData({
        ...formData,
        eligibility: [...formData.eligibility, newRole]
      });
    }
    setNewRole("");
  };

  const removeRole = (role: string) => {
    if (formData) {
      setFormData({
        ...formData,
        eligibility: formData.eligibility.filter(r => r !== role)
      });
    }
  };

  const addSkill = () => {
    if (formData && newSkill && !formData.tags.includes(newSkill)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newSkill]
      });
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    if (formData) {
      setFormData({
        ...formData,
        tags: formData.tags.filter(s => s !== skill)
      });
    }
  };

  if (!user) { // ProtectedRoute가 작동하지 않는 경우를 대비한 추가 방어 로직
    return null;
  }

  // 초기 로딩 상태 (데이터 불러오는 중)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700">팀 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 오류 상태 (데이터 로딩 실패 또는 권한 없음)
  if (error && !formData) { // formData가 null인 경우만 오류 메시지를 직접 표시
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <Link href="/teams">
          <Button>팀 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  // 성공 메시지 표시
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">팀 정보 수정 완료!</h2>
              <p className="text-gray-600 mb-6">
                팀 정보가 성공적으로 업데이트되었습니다.
              </p>
              <div className="flex gap-2">
                <Link href={`/teams/${teamId}`} className="flex-1">
                  <Button className="w-full">팀 상세보기</Button>
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
    );
  }

  // 폼 렌더링 (formData가 성공적으로 로드된 경우)
  if (!formData) return null; // formData가 null이면 렌더링하지 않음 (로딩/에러 처리에서 걸러짐)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/teams/${teamId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">팀 정보 수정</h1>
              <p className="text-gray-600">{formData.name} 팀의 정보를 수정합니다</p>
            </div>
          </div>
        </div>

        {error && ( // 저장 중 발생하는 오류 메시지
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    기본 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">팀명 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="팀명을 입력하세요"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">팀 소개 *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="팀에 대한 소개와 목표를 작성해주세요"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contest">참가 공모전 *</Label>
                      <Select
                        value={formData.contestId}
                        onValueChange={(value) => setFormData({ ...formData, contestId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="공모전 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {contests.map((contest) => (
                            <SelectItem key={contest.id} value={contest.id}>
                              {contest.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">활동 지역 *</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="지역 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="서울">서울</SelectItem>
                          <SelectItem value="부산">부산</SelectItem>
                          <SelectItem value="대구">대구</SelectItem>
                          <SelectItem value="인천">인천</SelectItem>
                          <SelectItem value="광주">광주</SelectItem>
                          <SelectItem value="대전">대전</SelectItem>
                          <SelectItem value="온라인">온라인</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">최대 팀원 수</Label>
                    <Select
                      value={formData.maxMembers.toString()}
                      onValueChange={(value) => setFormData({ ...formData, maxMembers: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2명</SelectItem>
                        <SelectItem value="3">3명</SelectItem>
                        <SelectItem value="4">4명</SelectItem>
                        <SelectItem value="5">5명</SelectItem>
                        <SelectItem value="6">6명</SelectItem>
                        <SelectItem value="7">7명</SelectItem>
                        <SelectItem value="8">8명</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isRecruiting">모집 상태</Label>
                    <Select
                      value={formData.isRecruiting.toString()} // boolean을 string으로 변환
                      onValueChange={(value) => setFormData({ ...formData, isRecruiting: value === 'true' })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="모집 상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">모집중</SelectItem>
                        <SelectItem value="false">모집완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* 모집 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>모집 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>모집하는 역할</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.eligibility.map((role) => ( // eligibility 사용
                        <Badge key={role} variant="secondary" className="flex items-center gap-1">
                          {role}
                          <button
                            type="button"
                            onClick={() => removeRole(role)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="역할 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles
                            .filter(role => !formData.eligibility.includes(role))
                            .map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addRole} disabled={!newRole} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>필요한 기술 스택</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((skill) => ( // tags 사용
                        <Badge key={skill} variant="outline" className="flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select value={newSkill} onValueChange={setNewSkill}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="기술 스택 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSkills
                            .filter(skill => !formData.tags.includes(skill))
                            .map((skill) => (
                              <SelectItem key={skill} value={skill}>
                                {skill}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addSkill} disabled={!newSkill} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">지원 요구사항</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="팀원에게 바라는 점이나 필요한 경험을 작성해주세요"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 연락 방법 */}
              <Card>
                <CardHeader>
                  <CardTitle>연락 방법</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>연락 방법</Label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value: "platform" | "email" | "kakao" | "discord") => setFormData({ ...formData, contactMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform">플랫폼 내 메시지</SelectItem>
                        <SelectItem value="email">이메일</SelectItem>
                        <SelectItem value="kakao">카카오톡</SelectItem>
                        <SelectItem value="discord">디스코드</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.contactMethod !== "platform" && (
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">연락처</Label>
                      <Input
                        id="contactInfo"
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        placeholder={
                          formData.contactMethod === "email" ? "이메일 주소" :
                          formData.contactMethod === "kakao" ? "카카오톡 ID" :
                          "디스코드 ID"
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 팀장 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>팀장 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold text-xl">{user?.username?.[0] || ""}</span>
                    </div>
                    <h3 className="font-medium">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {/* <p className="text-sm text-gray-600 mt-1">{user.location || "위치 미설정"}</p> */}
                  </div>
                </CardContent>
              </Card>

              {/* 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle>팀 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked as boolean })}
                    />
                    <Label htmlFor="isPublic" className="text-sm">
                      팀을 공개적으로 표시
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowDirectApply"
                      checked={formData.allowDirectApply}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowDirectApply: checked as boolean })}
                    />
                    <Label htmlFor="allowDirectApply" className="text-sm">
                      직접 지원 허용
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* 제출 버튼 */}
              <Card>
                <CardContent className="p-4">
                  <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        변경 사항 저장
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    변경 사항은 즉시 반영됩니다
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default function TeamEditPage() {
  return (
    <ProtectedRoute>
      <TeamEditContent />
    </ProtectedRoute>
  );
}