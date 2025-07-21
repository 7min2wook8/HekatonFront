"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";

// 샘플 데이터
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

const receivedApplications = [
  {
    id: 1,
    contestTitle: "AI 혁신 아이디어 공모전",
    applicantName: "김철수",
    appliedDate: "2025-01-22",
    status: "검토중",
    message: "함께 혁신적인 AI 서비스를 만들어보고 싶습니다!",
  },
  {
    id: 2,
    contestTitle: "환경보호 캠페인 공모전",
    applicantName: "이영희",
    appliedDate: "2025-01-21",
    status: "승인",
    message: "환경 보호에 대한 열정이 있습니다. 팀에 합류하고 싶어요.",
  },
];

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

function MyPageContent() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, profile, viewProfile } = useAuth();
  const [favoriteContests, setFavoriteContests] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.id) {
      // const localStorageKey = `favoriteContests_${user.id}`;
      // console.log("localStorageKey : " + localStorageKey)

      // const storedFavorites = localStorage.getItem(localStorageKey);
      // console.log("storedFavorites : " + storedFavorites)
      // if (storedFavorites) {
      //   setFavoriteContests(JSON.parse(storedFavorites));
      // }
      
      favoliteData(user.id)

    }
  }, []);

  if (!user) return null;
    const favoliteData = async (user_Id : String) : Promise<{ success: boolean; message: string }> => 
    {
      try{
        const response = await fetch(`http://localhost:8080/api/users/me/favorites`, {
                      method: 'GET',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      credentials: 'include', // 쿠키 포함                   
                  });

          if(response.ok){
            return { success: true, message: "즐겨찾기 성공" }
          }
          else
            return { success: false, message: "사용자 정보를 불러오지 못했습니다." }

        }catch (error) {

          return { success: false, message: "즐겨찾기 중 오류가 발생했습니다." }
      
        }
  }

  //const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {

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
      case "승인":
        return "bg-green-100 text-green-800";
      case "검토중":
        return "bg-orange-100 text-orange-800";
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
            <TabsTrigger value="applications">받은 신청</TabsTrigger>
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
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="text-sm text-gray-600">받은 팀원 신청</div>
                </CardContent>
              </Card>
            </div>

            {/* 즐겨찾기 리스트 */}
            <Card>
              <CardHeader>
                <CardTitle>즐겨찾기</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {favoriteContests.length > 0 ? (
                    favoriteContests.map((contest) => (
                      <li
                        key={contest.id}
                        className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between"
                      >
                        <h4 className="font-medium text-gray-900 mb-2 sm:mb-0 sm:mr-4">
                          {contest.title}
                        </h4>
                        {/* 공모전 상세 정보를 한 줄로 표기하기 위해 flexbox 사용 */}
                        <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-3">
                          <p>
                            <strong>주최:</strong> {contest.organizer}
                          </p>
                          <p>
                            <strong>지역:</strong> {contest.region}
                          </p>
                          <p>
                            <strong>D-Day:</strong> {contest.dDay}
                          </p>
                          <p>
                            <strong>기간:</strong> {contest.period}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      아직 즐겨찾기한 공모전이 없습니다.
                    </p>
                  )}
                </ul>
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

          {/* 받은 신청 탭 */}
          <TabsContent value="applications" className="space-y-6">
            <div className="space-y-4">
              {receivedApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {application.applicantName}
                          </h3>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {application.contestTitle}
                        </p>
                        <p className="text-gray-700 mb-3">
                          "{application.message}"
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          신청일: {application.appliedDate}
                        </div>
                      </div>

                      {application.status === "검토중" && (
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            거절
                          </Button>
                          <Button size="sm">승인</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
