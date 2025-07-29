"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit,
  Users,
  Loader2,
  Info,
  Mail,
  MessageSquare,
  Award, // contestTitle 제거시 이 아이콘도 더 이상 사용되지 않을 수 있습니다.
  Trash2 // 삭제 아이콘 추가
} from 'lucide-react'
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


// 백엔드 TeamsResponse DTO에 있는 필드들만을 기반으로 정의
interface Team {
  id: string; // UUID
  name: string;
  description: string;
  leaderId: string; // UUID
  contestId: string; // UUID
  isRecruiting: boolean; // 모집중 여부 (백엔드 DTO에 있음)
  isPublic: boolean;
  maxMembers: number;
  createdByUserId: string; // UUID
  createdAt: string;
  updatedAt: string;

  // JSONB에서 변환되어 오는 필드들
  eligibility: string[]; // 백엔드 DTO의 eligibility 필드 (이전 neededRoles)
  tags: string[];        // 백엔드 DTO의 tags 필드 (이전 skills)

  // 아래 필드들은 현재 백엔드 TeamsResponse DTO에 없으므로,
  // 프론트엔드에서 임시로 사용하거나 제거해야 합니다.
  // 이 코드에서는 일단 임시 값을 사용하거나 표시하지 않도록 처리했습니다.
  // 추후 백엔드에서 제공되면 주석 해제하고 사용하시면 됩니다.
  // contestTitle?: string;
  // location?: string;
  // currentMembers?: number; // DB에 멤버 테이블이 있다면 카운트해서 넘겨줘야 함
  // leaderName?: string;
  // requirements?: string;
  // contactMethod?: "platform" | "email" | "kakao" | "discord";
  // contactInfo?: string;
  // allowDirectApply?: boolean; // 팀 설정의 직접 지원 허용 여부
  // status?: "모집중" | "모집완료" | "활동중" | "활동종료"; // isRecruiting으로 대체 가능
}

function TeamDetailPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 중 상태
  const [error, setError] = useState<string | null>(null);

  // API_GATEWAY_URL을 백엔드 로그에서 확인된 8086 포트로 변경합니다.
  const API_GATEWAY_URL = 'http://localhost:8086'; // <-- 여기 수정!

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
      setTeam(data);
    } catch (err: any) {
      console.error("팀 정보 불러오기 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId, fetchTeamData]);

  // 팀 삭제 핸들러
  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': user?.token ? `Bearer ${user.token}` : '', // 인증 토큰이 필요하다면 추가
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "팀 삭제에 실패했습니다.");
      }

      alert("팀이 성공적으로 삭제되었습니다.");
      router.push("/teams"); // 팀 목록 페이지로 리다이렉트
    } catch (err: any) {
      console.error("팀 삭제 오류:", err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };


  // contactMethod, contactInfo 필드가 백엔드 DTO에 없으므로
  // 이 함수는 사용되지 않거나, 임시로 처리되어야 합니다.
  const getContactIcon = (method: string | undefined) => {
    if (!method) return <Info className="w-4 h-4 mr-2" />; // method가 없으면 기본 아이콘 반환
    switch (method) {
      case "email":
        return <Mail className="w-4 h-4 mr-2" />;
      case "kakao":
        return <MessageSquare className="w-4 h-4 mr-2" />;
      case "discord":
        return <MessageSquare className="w-4 h-4 mr-2" />;
      default:
        return <Info className="w-4 h-4 mr-2" />;
    }
  };

  // leaderId는 백엔드 DTO에 있으므로 비교 가능
  const isLeader = user?.id === team?.leaderId; // team이 null일 수 있으므로 옵셔널 체이닝


  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700">팀 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 오류 상태
  if (error && !team) { // 팀 데이터가 로드되기 전의 오류
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

  // 팀 데이터가 없을 경우 (예: 404가 아닌 다른 이유로 null이 된 경우)
  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-lg text-gray-700 mb-4">팀 정보를 찾을 수 없습니다.</p>
        <Link href="/teams">
          <Button>팀 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/teams">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600">{team.description}</p>
            </div>
          </div>
          {isLeader && (
            <div className="flex gap-2">
              <Link href={`/teams/${team.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  팀 수정
                </Button>
              </Link>
              <Link href={`/teams/${team.id}/manage-members`}>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  팀원 관리
                </Button>
              </Link>
              {/* 삭제 버튼 추가 */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    팀 삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 팀을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 팀과 관련된 모든 데이터가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTeam} disabled={isDeleting}>
                      {isDeleting ? "삭제 중..." : "삭제"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {error && ( // 삭제 중 발생하는 오류 메시지
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">참가 공모전</p>
                    {/* team.contestTitle이 백엔드 DTO에 없으므로 임시 값 사용 */}
                    <p className="text-lg font-semibold flex items-center mt-1">
                      <Award className="w-4 h-4 mr-2 text-yellow-500" />
                      {"[공모전 정보 없음]"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">활동 지역</p>
                    {/* team.location이 백엔드 DTO에 없으므로 임시 값 사용 */}
                    <p className="text-lg font-semibold mt-1">{"[활동 지역 정보 없음]"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">모집 현황</p>
                  {/* 여기가 Hydration 오류를 해결하기 위해 p 태그를 div 태그로 변경합니다. */}
                  <div className="text-lg font-semibold mt-1">
                    {/* team.currentMembers가 백엔드 DTO에 없으므로 임시 값 (0) 사용 */}
                    {`0`} / {team.maxMembers} 명
                    <Badge variant={team.isRecruiting ? "default" : "secondary"} className="ml-2">
                      {team.isRecruiting ? "모집중" : "모집완료"} {/* isRecruiting 필드 사용 */}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">생성일</p>
                  <p className="text-lg font-semibold mt-1">{new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* 모집 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>모집 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">모집하는 역할</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* team.eligibility 사용 */}
                    {team.eligibility && team.eligibility.length > 0 ? (
                      team.eligibility.map((role) => (
                        <Badge key={role} variant="secondary">{role}</Badge>
                      ))
                    ) : (
                      <p className="text-gray-600">모집하는 역할이 없습니다.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">필요한 기술 스택</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* team.tags 사용 */}
                    {team.tags && team.tags.length > 0 ? (
                      team.tags.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-gray-600">필요한 기술 스택이 없습니다.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">지원 요구사항</p>
                  {/* team.requirements가 백엔드 DTO에 없으므로 임시 값 사용 */}
                  <p className="text-gray-800 whitespace-pre-line mt-2">
                    {"[지원 요구사항 정보 없음]"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 연락 방법 */}
            <Card>
              <CardHeader>
                <CardTitle>연락 방법</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">주요 연락 방법</p>
                  <p className="text-lg font-semibold flex items-center mt-1">
                    {/* team.contactMethod가 백엔드 DTO에 없으므로 임시 값 사용 */}
                    {getContactIcon(undefined)} {/* 임시로 undefined 전달 */}
                    {"[연락 방법 정보 없음]"}
                  </p>
                </div>
                {/* contactInfo가 백엔드 DTO에 없으므로 이 블록은 항상 숨겨집니다. */}
                <div>
                  <p className="text-gray-600">연락처 정보가 제공되지 않습니다.</p>
                </div>
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
                    {/* team.leaderName이 백엔드 DTO에 없으므로 임시 값 사용 */}
                    <span className="text-blue-600 font-bold text-xl">{"?"}</span>
                  </div>
                  <h3 className="font-medium">{"[팀장 이름 정보 없음]"}</h3>
                </div>
              </CardContent>
            </Card>

            {/* 팀 설정 요약 */}
            <Card>
              <CardHeader>
                <CardTitle>팀 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full ${team.isPublic ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm">{team.isPublic ? "공개 팀" : "비공개 팀"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* team.allowDirectApply가 백엔드 DTO에 없으므로 임시 값 (false) 사용 */}
                  <span className={`w-4 h-4 rounded-full ${false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm">{"[직접 지원 허용 여부 정보 없음]"}</span>
                </div>
              </CardContent>
            </Card>

            {/* 지원하기 버튼 (팀장이 아닐 경우) */}
            {!isLeader && (
              <Card>
                <CardContent className="p-4">
                  <Button className="w-full" size="lg">
                    팀에 지원하기
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    팀에 지원하여 함께 프로젝트를 시작해보세요!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Next.js App Router에서 동적 경로를 처리하는 방식
// src/app/teams/[teamId]/page.tsx 파일에 이 컴포넌트를 직접 export 하거나
// 별도 컴포넌트로 분리 후 import 하여 사용합니다.
export default function TeamDetailPage() {
  return (
    <ProtectedRoute>
      <TeamDetailPageContent />
    </ProtectedRoute>
  );
}