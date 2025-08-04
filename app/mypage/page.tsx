"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Trophy,
  Clock,
  Users,
  MapPin,
  Edit,
  Eye,
  Calendar,
  MessageSquare,
  Loader2,
  Check,
  X,
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

// 샘플 데이터 (임시, API 연동 후에는 사용되지 않음)
const participatingContests = [
  {
    id: 1,
    title: "2025 스타트업 아이디어 공모전",
    category: "창업",
    status: "진행중",
    deadline: "2025-02-28",
    image: "/placeholder.svg?height=150&width=200",
    progress: 65,
    teamMembers: 3,
  },
  {
    id: 2,
    title: "모바일 앱 개발 공모전",
    category: "IT",
    status: "제출완료",
    deadline: "2025-03-12",
    image: "/placeholder.svg?height=150&width=200",
    progress: 100,
    teamMembers: 4,
  },
];

const appliedContests = [
  {
    id: 3,
    title: "친환경 제품 디자인 공모전",
    category: "디자인",
    status: "심사중",
    appliedDate: "2025-01-20",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    id: 4,
    title: "청년 정책 제안 공모전",
    category: "정책",
    status: "대기중",
    appliedDate: "2025-01-18",
    image: "/placeholder.svg?height=150&width=200",
  },
];

// 이전에 있던 '받은 신청' 데이터는 '받은 초대장' 데이터로 대체됩니다.
// 따라서 아래 코드는 더 이상 사용되지 않습니다.
// const receivedApplications = [ ... ];

const notifications = [
  {
    id: 1,
    type: "contest",
    title: "공모전 마감 알림",
    message: "2025 스타트업 아이디어 공모전 마감이 7일 남았습니다.",
    time: "2시간 전",
    isRead: false,
  },
  {
    id: 2,
    type: "team",
    title: "팀 가입 승인",
    message: "모바일 앱 개발 공모전 팀에 가입이 승인되었습니다.",
    time: "1일 전",
    isRead: true,
  },
  {
    id: 3,
    type: "application",
    title: "새로운 팀원 신청",
    message: "김철수님이 AI 혁신 아이디어 공모전 팀에 가입을 신청했습니다.",
    time: "2일 전",
    isRead: false,
  },
];

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8080";

interface FavoriteContest {
  id: string;
  title: string;
  organizer: string;
  startDate: string;
  endDate: string;
}

interface Invitation {
  id: string;
  teamId: string;
  teamName: string;
  senderName: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

function MyPageContent() {
  const [activeTab, setActiveTab] = useState("overview");

  const { user } = useAuth();
  const [favoriteContests, setFavoriteContests] = useState<FavoriteContest[]>(
    []
  );
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingInvitations(true);
    setInvitationsError(null);

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/invitations/users/${user.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("초대장 목록을 불러오는 데 실패했습니다.");
      }

      const data: Invitation[] = await response.json();
      setReceivedInvitations(data);
    } catch (error: any) {
      console.error("초대장 목록 불러오기 오류:", error);
      setInvitationsError(error.message);
      setReceivedInvitations([]);
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  useEffect(() => {
    const fetchFavoriteContests = async () => {
      if (!user) return;

      setIsLoadingFavorites(true);
      setFavoritesError(null);

      try {
        const response = await fetch(
          `${API_GATEWAY_URL}/api/mypage/favorites`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("즐겨찾기 목록을 불러오는 데 실패했습니다.");
        }

        const data = await response.json();
        setFavoriteContests(data || []);
      } catch (error: any) {
        setFavoritesError(error.message);
        setFavoriteContests([]);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavoriteContests();
  }, [user]);

  const handleInvitationResponse = async (invitationId: string, action: "accept" | "reject") => {
    if (!user?.id) {
      toast.error("사용자 정보가 없어 요청을 보낼 수 없습니다.");
      return;
    }

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/invitations/${invitationId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${action === "accept" ? "수락" : "거절"} 요청에 실패했습니다.`);
      }

      toast.success(`초대장을 성공적으로 ${action === "accept" ? "수락" : "거절"}했습니다.`);
      // 상태를 업데이트하거나 데이터를 다시 불러옴
      fetchInvitations();
    } catch (error: any) {
      console.error(`초대장 ${action} 오류:`, error);
      toast.error(error.message || "알 수 없는 오류가 발생했습니다.");
    }
  };

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중":
        return "bg-blue-100 text-blue-800";
      case "제출완료":
        return "bg-green-100 text-green-800";
      case "심사중":
        return "bg-yellow-100 text-yellow-800";
      case "대기중":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 프로필 헤더 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={/*user.avatar ||*/ "/placeholder.svg"}
                  alt={user.username}
                />
                <AvatarFallback className="text-2xl">
                  {user?.username?.[0] || ""}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.username}님
                    </h1>
                    <p className="text-gray-600 mb-2">{user.email}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {/*user.location ||*/ "위치 미설정"}
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      가입일: 2024-01-15
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Link href="/mypage/profile">
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        프로필 수정
                      </Button>
                    </Link>
                    <Link href="/mypage/notifications">
                      <Button variant="outline">
                        <Bell className="w-4 h-4 mr-2" />
                        알림
                      </Button>
                    </Link>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  열정적인 개발자이자 창업가입니다. 혁신적인 아이디어로 세상을
                  바꾸고 싶습니다.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      관심 분야
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {
                        /*user.interests?.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      )) ||*/ <span className="text-sm text-gray-400">
                          관심 분야 미설정
                        </span>
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      기술 스택
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {
                        /*user.skills?.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      )) || */ <span className="text-sm text-gray-400">
                          기술 스택 미설정
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="participating">참여 중인 공모전</TabsTrigger>
            <TabsTrigger value="applied">신청한 공모전</TabsTrigger>
            <TabsTrigger value="applications">받은 초대장</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 통계 카드들 */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="text-sm text-gray-600">참여 중인 공모전</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="text-sm text-gray-600">신청한 공모전</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {receivedInvitations.length}
                  </div>
                  <div className="text-sm text-gray-600">받은 팀 초대</div>
                </CardContent>
              </Card>
            </div>

            {/* 즐겨찾기 리스트 */}
            <Card>
              <CardHeader>
                <CardTitle>즐겨찾기한 공모전</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingFavorites ? (
                  <p className="text-center text-gray-500">
                    목록을 불러오는 중...
                  </p>
                ) : favoritesError ? (
                  <p className="text-center text-red-500">
                    오류: {favoritesError}
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {favoriteContests.length > 0 ? (
                      favoriteContests.map((contest) => (
                        <li key={contest.id}>
                          <Link
                            href={`/contests/${contest.id}`}
                            className="block p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h4 className="font-medium text-gray-900 mb-2 sm:mb-0 sm:mr-4 truncate">
                                {contest.title}
                              </h4>
                              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <Badge variant="outline">
                                  {contest.organizer}
                                </Badge>
                                <span
                                  className={`font-semibold ${
                                    new Date(contest.endDate) < new Date()
                                      ? "text-gray-500"
                                      : "text-red-600"
                                  }`}
                                >
                                  마감:{" "}
                                  {new Date(
                                    contest.endDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        아직 즐겨찾기한 공모전이 없습니다.
                      </p>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 참여 중인 공모전 탭 */}
          <TabsContent value="participating" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {participatingContests.map((contest) => (
                <Card
                  key={contest.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={contest.image || "/placeholder.svg"}
                      alt={contest.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2">
                      {contest.category}
                    </Badge>
                    <Badge
                      className={`absolute top-2 right-2 ${getStatusColor(
                        contest.status
                      )}`}
                    >
                      {contest.status}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{contest.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          마감: {contest.deadline}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          팀원 {contest.teamMembers}명
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>진행률</span>
                          <span>{contest.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${contest.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          상세보기
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />팀 채팅
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 신청한 공모전 탭 */}
          <TabsContent value="applied" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appliedContests.map((contest) => (
                <Card
                  key={contest.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={contest.image || "/placeholder.svg"}
                      alt={contest.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2">
                      {contest.category}
                    </Badge>
                    <Badge
                      className={`absolute top-2 right-2 ${getStatusColor(
                        contest.status
                      )}`}
                    >
                      {contest.status}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{contest.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          신청일: {contest.appliedDate}
                        </div>
                      </div>

                      <Button size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 받은 초대 탭 */}
          <TabsContent value="applications" className="space-y-6">
            {isLoadingInvitations ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : invitationsError ? (
              <div className="text-center text-red-500 p-4 border border-red-200 rounded-lg">
                <p>초대장 목록을 불러오는 데 오류가 발생했습니다: {invitationsError}</p>
              </div>
            ) : receivedInvitations.length > 0 ? (
              <div className="space-y-4">
                {receivedInvitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {invitation.teamName}에서 보낸 초대장
                            </h3>
                            <Badge className={getStatusColor(invitation.status)}>
                              {invitation.status === "PENDING" && "대기중"}
                              {invitation.status === "ACCEPTED" && "승인됨"}
                              {invitation.status === "REJECTED" && "거절됨"}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">
                            보낸 사람: {invitation.senderName}
                          </p>
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                            "{invitation.message}"
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            초대일: {new Date(invitation.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {invitation.status === "PENDING" && (
                          <div className="flex gap-2 ml-4 self-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInvitationResponse(invitation.id, "reject")}
                            >
                              <X className="w-4 h-4 mr-1" /> 거절
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleInvitationResponse(invitation.id, "accept")}
                            >
                              <Check className="w-4 h-4 mr-1" /> 승인
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4 border rounded-lg bg-white">
                <p>받은 초대장이 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MyPageContent />
    </ProtectedRoute>
  );
}